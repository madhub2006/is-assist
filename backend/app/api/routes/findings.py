from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.analysis import AnalysisFinding
from app.schemas.analysis import FindingResponse

router = APIRouter(tags=["Risk & Findings"])


@router.get("/analyses/{analysis_id}/findings", response_model=List[FindingResponse])
def get_analysis_findings(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve all findings and risk flags for an analysis."""
    return db.query(AnalysisFinding).filter(AnalysisFinding.analysis_id == analysis_id).order_by(AnalysisFinding.id.asc()).all()


@router.get("/findings", response_model=List[FindingResponse])
def list_all_findings(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List system-wide findings filtered by severity or status."""
    q = db.query(AnalysisFinding)
    if severity and severity != "All":
        q = q.filter(AnalysisFinding.severity == severity)
    if status and status != "All":
        q = q.filter(AnalysisFinding.status == status)
    return q.order_by(AnalysisFinding.created_at.desc()).limit(limit).all()


@router.put("/findings/{finding_id}/status")
def update_finding_status(
    finding_id: int,
    status_value: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update finding resolution status (e.g. 'Open', 'Resolved', 'Acknowledged')."""
    finding = db.query(AnalysisFinding).filter(AnalysisFinding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    finding.status = status_value
    db.commit()
    return {"success": True, "message": f"Finding {finding_id} status updated to {status_value}"}
