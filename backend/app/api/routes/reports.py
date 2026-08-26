from typing import List
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.report import ReportResponse, ReportCreate
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Procurement Reports"])


@router.get("", response_model=List[ReportResponse])
def list_reports(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all generated procurement reports."""
    reports, total = ReportService.get_all(db=db, skip=skip, limit=limit)
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_detail(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full advisory report details and structured JSON data."""
    return ReportService.get_by_id(db=db, report_id=report_id)


@router.post("/generate/{analysis_id}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_analysis_report(
    request: Request,
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a structured procurement advisory report for an analysis."""
    client_ip = request.client.host if request.client else None
    return ReportService.generate_report(
        db=db,
        analysis_id=analysis_id,
        user_id=current_user.id,
        client_ip=client_ip
    )
