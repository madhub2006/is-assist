from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.document_report_audit import Report
from app.models.analysis import Analysis
from app.core.exceptions import EntityNotFoundException
from app.services.audit_service import AuditService


class ReportService:
    @staticmethod
    def generate_report(
        db: Session,
        analysis_id: int,
        user_id: int,
        client_ip: Optional[str] = None
    ) -> Report:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise EntityNotFoundException("Analysis", analysis_id)

        # Build structured procurement advisory report payload
        report_data = {
            "report_title": f"Procurement Advisory & Standards Review: {analysis.title}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analysis_id": analysis.id,
            "product_name": analysis.product_name,
            "category": analysis.category,
            "procurement_type": analysis.procurement_type,
            "readiness_score": analysis.readiness_score,
            "disclaimer": "PROTOTYPE ANALYSIS REPORT: This document contains AI/algorithmic recommendations for procurement advisory purposes only. Formal verification against authoritative BIS publications is required.",
            "requirements_summary": [
                {
                    "category": r.category,
                    "name": r.name,
                    "value": r.value,
                    "status": r.status
                } for r in analysis.requirements
            ],
            "standards_recommendations": [
                {
                    "is_number": rec.standard.is_number if rec.standard else "DEMO-STD",
                    "title": rec.standard.title if rec.standard else "Standard Title",
                    "relevance_score": f"{rec.relevance_score}%",
                    "reason": rec.reason,
                    "verification_status": rec.verification_status
                } for rec in analysis.recommendations
            ],
            "risk_findings": [
                {
                    "severity": f.severity,
                    "title": f.title,
                    "description": f.description,
                    "recommendation": f.recommendation
                } for f in analysis.findings
            ]
        }

        report = Report(
            analysis_id=analysis_id,
            generated_by=user_id,
            status="Completed",
            summary=f"Automated advisory report generated for {analysis.product_name}. Readiness evaluated at {analysis.readiness_score}%.",
            report_data_json=report_data,
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        AuditService.log(
            db=db,
            action="REPORT_GENERATED",
            user_id=user_id,
            entity_type="Report",
            entity_id=str(report.id),
            details=f"Generated procurement report for Analysis ID {analysis_id}",
            ip_address=client_ip,
        )

        return report

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 50) -> tuple[List[Report], int]:
        total = db.query(Report).count()
        reports = db.query(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
        return reports, total

    @staticmethod
    def get_by_id(db: Session, report_id: int) -> Report:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise EntityNotFoundException("Report", report_id)
        return report
