from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.analysis import (
    RequirementCreate, RequirementUpdate, RequirementResponse
)
from app.services.analysis_service import AnalysisService

router = APIRouter(tags=["Analysis Requirements"])


@router.post("/analyses/{analysis_id}/requirements", response_model=RequirementResponse, status_code=status.HTTP_201_CREATED)
def add_requirement_to_analysis(
    analysis_id: int,
    data: RequirementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a new technical requirement item to an analysis."""
    return AnalysisService.add_requirement(db=db, analysis_id=analysis_id, data=data)


@router.get("/analyses/{analysis_id}/requirements", response_model=List[RequirementResponse])
def get_analysis_requirements(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all requirements for a specific analysis."""
    analysis = AnalysisService.get_by_id(db=db, analysis_id=analysis_id)
    return analysis.requirements


@router.put("/requirements/{requirement_id}", response_model=RequirementResponse)
def update_requirement(
    requirement_id: int,
    data: RequirementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific technical requirement item."""
    return AnalysisService.update_requirement(db=db, requirement_id=requirement_id, data=data)


@router.delete("/requirements/{requirement_id}")
def delete_requirement(
    requirement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a technical requirement item."""
    AnalysisService.delete_requirement(db=db, requirement_id=requirement_id)
    return {"success": True, "message": "Requirement deleted"}
