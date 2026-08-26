from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user, require_admin
from app.models.user import User
from app.schemas.standard import (
    StandardCreate, StandardUpdate, StandardResponse, StandardDetailResponse
)
from app.services.standards_service import StandardsService
from app.schemas.intelligence import SemanticSearchRequest, SemanticStandardResult
from app.services.semantic_recommendation_service import VectorSearchService

router = APIRouter(prefix="/standards", tags=["Standards Directory"])


@router.post("/search/semantic", response_model=List[SemanticStandardResult])
def semantic_search(
    data: SemanticSearchRequest,
    db: Session = Depends(get_db),
):
    """Return ranked standards using embeddings plus transparent lexical evidence."""
    results = VectorSearchService.search(db, data.query, min(data.top_k, 50), data.category, data.sector)
    return [
        {**standard.__dict__, "relevance_score": round(score * 100, 2), "reason": "Product, application, and technical terminology similarity; verify against the source."}
        for standard, score in results
    ]


@router.get("", response_model=List[StandardResponse])
def list_standards(
    query: Optional[str] = None,
    category: Optional[str] = None,
    sector: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search and filter Indian Standards directory.
    Database-backed search foundation with Phase 2 semantic extension point.
    """
    standards, total = StandardsService.get_all(
        db=db,
        query=query,
        category=category,
        sector=sector,
        status=status,
        skip=skip,
        limit=limit
    )
    return standards


@router.get("/{standard_id}", response_model=StandardDetailResponse)
def get_standard_details(
    standard_id: int,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive details of a standard, including version history,
    amendments, and normative/safety relationships.
    """
    return StandardsService.get_by_id(db=db, standard_id=standard_id)


@router.post("", response_model=StandardResponse, status_code=status.HTTP_201_CREATED)
def create_standard(
    data: StandardCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new standard record (Admin only)."""
    return StandardsService.create(db=db, data=data)


@router.put("/{standard_id}", response_model=StandardResponse)
def update_standard(
    standard_id: int,
    data: StandardUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a standard record (Admin only)."""
    return StandardsService.update(db=db, standard_id=standard_id, data=data)
