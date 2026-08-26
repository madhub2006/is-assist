from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user, require_officer_or_admin
from app.models.user import User
from app.schemas.analysis import (
    AnalysisCreate, AnalysisUpdate, AnalysisResponse, AnalysisDetailResponse
)
from app.services.analysis_service import AnalysisService
from app.schemas.intelligence import RecommendationRequest
from app.models.analysis import Analysis
from app.services.semantic_recommendation_service import SemanticRecommendationService
from app.services.tender_intelligence_service import DocumentProcessingService, GapAnalysisService, SpecificationReadinessService

router = APIRouter(prefix="/analyses", tags=["Procurement Analyses"])


@router.post("/{analysis_id}/recommend")
def recommend_standards(
    analysis_id: int,
    data: RecommendationRequest = RecommendationRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate explainable semantic recommendations for an existing analysis."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    recommendations = SemanticRecommendationService.recommend(db, analysis, data.top_k)
    return {"analysis_id": analysis_id, "recommendations": recommendations, "message": "Relevance scores are recommendations, not legal certainty."}


@router.post("/{analysis_id}/process-document")
def process_document_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return DocumentProcessingService.process(db, analysis)


@router.get("/{analysis_id}/readiness-score")
def readiness_score(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"analysis_id": analysis_id, "label": "Specification Readiness Score", "is_legal_compliance": False, **SpecificationReadinessService.score(analysis)}


@router.get("/{analysis_id}/findings")
def analysis_findings(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.findings


@router.post("", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(
    request: Request,
    data: AnalysisCreate,
    current_user: User = Depends(require_officer_or_admin),
    db: Session = Depends(get_db)
):
    """Create a new procurement analysis and trigger Phase 1 prototype evaluation."""
    client_ip = request.client.host if request.client else None
    return AnalysisService.create(
        db=db,
        data=data,
        user_id=current_user.id,
        client_ip=client_ip
    )


@router.get("", response_model=List[AnalysisResponse])
def list_analyses(
    query: Optional[str] = None,
    department_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List procurement analyses with search and filters."""
    analyses, total = AnalysisService.get_list(
        db=db,
        user=current_user,
        query=query,
        department_id=department_id,
        status=status,
        skip=skip,
        limit=limit
    )
    return analyses


@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis_detail(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full details of an analysis including requirements, findings, and recommendations."""
    return AnalysisService.get_by_id(db=db, analysis_id=analysis_id)


@router.put("/{analysis_id}", response_model=AnalysisResponse)
def update_analysis(
    request: Request,
    analysis_id: int,
    data: AnalysisUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update analysis metadata, status, or notes."""
    client_ip = request.client.host if request.client else None
    return AnalysisService.update(
        db=db,
        analysis_id=analysis_id,
        data=data,
        user_id=current_user.id,
        client_ip=client_ip
    )


@router.delete("/{analysis_id}")
def delete_analysis(
    request: Request,
    analysis_id: int,
    current_user: User = Depends(require_officer_or_admin),
    db: Session = Depends(get_db)
):
    """Delete a procurement analysis."""
    client_ip = request.client.host if request.client else None
    AnalysisService.delete(
        db=db,
        analysis_id=analysis_id,
        user_id=current_user.id,
        client_ip=client_ip
    )
    return {"success": True, "message": f"Analysis {analysis_id} deleted successfully"}
