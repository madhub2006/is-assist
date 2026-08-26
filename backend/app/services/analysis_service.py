from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.analysis import Analysis, AnalysisRequirement, AnalysisFinding, Recommendation
from app.models.user import User
from app.schemas.analysis import AnalysisCreate, AnalysisUpdate, RequirementCreate, RequirementUpdate
from app.core.exceptions import EntityNotFoundException
from app.services.mock_analysis_service import MockAnalysisService
from app.services.audit_service import AuditService


class AnalysisService:
    @staticmethod
    def create(
        db: Session,
        data: AnalysisCreate,
        user_id: int,
        client_ip: Optional[str] = None
    ) -> Analysis:
        user = db.query(User).filter(User.id == user_id).first()
        dept_id = data.department_id or (user.department_id if user else None)

        analysis = Analysis(
            user_id=user_id,
            department_id=dept_id,
            title=data.title,
            product_name=data.product_name,
            category=data.category or "General",
            procurement_type=data.procurement_type,
            quantity=data.quantity,
            application_use=data.application_use,
            natural_language_input=data.natural_language_input,
            technical_spec_json=data.technical_spec_json,
            status="In Review" if data.run_mock_analysis else "Draft",
            readiness_score=0,
            is_mock=True,
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Add any explicitly provided user requirements
        if data.requirements:
            for req in data.requirements:
                db_req = AnalysisRequirement(
                    analysis_id=analysis.id,
                    category=req.category,
                    name=req.name,
                    description=req.description,
                    value=req.value,
                    status=req.status,
                )
                db.add(db_req)

        # Execute prototype evaluation
        if data.run_mock_analysis:
            evaluation = MockAnalysisService.evaluate_analysis(
                db=db,
                analysis=analysis,
                natural_text=data.natural_language_input or "",
                tech_spec=data.technical_spec_json or {}
            )

            analysis.readiness_score = evaluation["readiness_score"]
            analysis.summary = evaluation["summary"]

            # Add prototype recommendations
            for std, score, reason, ver_status in evaluation["matched_standards"]:
                rec = Recommendation(
                    analysis_id=analysis.id,
                    standard_id=std.id,
                    relevance_score=score,
                    reason=reason,
                    verification_status=ver_status,
                    is_mock=True,
                )
                db.add(rec)

            # Add prototype findings
            for f in evaluation["findings"]:
                finding = AnalysisFinding(
                    analysis_id=analysis.id,
                    severity=f["severity"],
                    title=f["title"],
                    description=f["description"],
                    recommendation=f.get("recommendation"),
                    status="Open",
                )
                db.add(finding)

            # Add prototype requirement items if not already added
            if not data.requirements:
                for r in evaluation["requirements"]:
                    db_req = AnalysisRequirement(
                        analysis_id=analysis.id,
                        category=r["category"],
                        name=r["name"],
                        value=r.get("value"),
                        status=r["status"],
                    )
                    db.add(db_req)

        db.commit()
        db.refresh(analysis)

        AuditService.log(
            db=db,
            action="ANALYSIS_CREATED",
            user_id=user_id,
            entity_type="Analysis",
            entity_id=str(analysis.id),
            details=f"Created procurement analysis '{analysis.title}' ({analysis.product_name})",
            ip_address=client_ip,
        )

        return analysis

    @staticmethod
    def get_by_id(db: Session, analysis_id: int) -> Analysis:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise EntityNotFoundException("Analysis", analysis_id)
        return analysis

    @staticmethod
    def get_list(
        db: Session,
        user: User,
        query: Optional[str] = None,
        department_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Analysis], int]:
        q = db.query(Analysis)

        # Non-admin / non-reviewer users see their own analyses unless department shared
        if user.role and user.role.name not in ["Admin", "Reviewer"]:
            q = q.filter(Analysis.user_id == user.id)

        if query and query.strip():
            term = f"%{query.strip()}%"
            q = q.filter(
                or_(
                    Analysis.title.ilike(term),
                    Analysis.product_name.ilike(term),
                    Analysis.category.ilike(term),
                )
            )

        if department_id:
            q = q.filter(Analysis.department_id == department_id)

        if status and status != "All":
            q = q.filter(Analysis.status == status)

        total = q.count()
        analyses = q.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
        return analyses, total

    @staticmethod
    def update(
        db: Session,
        analysis_id: int,
        data: AnalysisUpdate,
        user_id: int,
        client_ip: Optional[str] = None
    ) -> Analysis:
        analysis = AnalysisService.get_by_id(db, analysis_id)
        update_dict = data.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            setattr(analysis, k, v)

        db.commit()
        db.refresh(analysis)

        AuditService.log(
            db=db,
            action="ANALYSIS_UPDATED",
            user_id=user_id,
            entity_type="Analysis",
            entity_id=str(analysis.id),
            details=f"Updated analysis '{analysis.title}'",
            ip_address=client_ip,
        )
        return analysis

    @staticmethod
    def delete(
        db: Session,
        analysis_id: int,
        user_id: int,
        client_ip: Optional[str] = None
    ) -> bool:
        analysis = AnalysisService.get_by_id(db, analysis_id)
        title = analysis.title
        db.delete(analysis)
        db.commit()

        AuditService.log(
            db=db,
            action="ANALYSIS_DELETED",
            user_id=user_id,
            entity_type="Analysis",
            entity_id=str(analysis_id),
            details=f"Deleted analysis '{title}'",
            ip_address=client_ip,
        )
        return True

    # Requirement Sub-resources
    @staticmethod
    def add_requirement(db: Session, analysis_id: int, data: RequirementCreate) -> AnalysisRequirement:
        analysis = AnalysisService.get_by_id(db, analysis_id)
        req = AnalysisRequirement(
            analysis_id=analysis.id,
            category=data.category,
            name=data.name,
            description=data.description,
            value=data.value,
            status=data.status,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def update_requirement(db: Session, requirement_id: int, data: RequirementUpdate) -> AnalysisRequirement:
        req = db.query(AnalysisRequirement).filter(AnalysisRequirement.id == requirement_id).first()
        if not req:
            raise EntityNotFoundException("Requirement", requirement_id)

        update_dict = data.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            setattr(req, k, v)
        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def delete_requirement(db: Session, requirement_id: int) -> bool:
        req = db.query(AnalysisRequirement).filter(AnalysisRequirement.id == requirement_id).first()
        if not req:
            raise EntityNotFoundException("Requirement", requirement_id)
        db.delete(req)
        db.commit()
        return True
