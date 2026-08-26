from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.analysis import Recommendation
from app.schemas.analysis import RecommendationResponse

router = APIRouter(tags=["Recommendations"])


@router.get("/analyses/{analysis_id}/recommendations", response_model=List[RecommendationResponse])
def get_analysis_recommendations(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve standard recommendations generated for a specific analysis."""
    return db.query(Recommendation).filter(Recommendation.analysis_id == analysis_id).order_by(Recommendation.relevance_score.desc()).all()


@router.get("/recommendations/top", response_model=List[RecommendationResponse])
def get_top_recommendations(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Retrieve high-confidence prototype recommendations across system."""
    return db.query(Recommendation).order_by(Recommendation.relevance_score.desc()).limit(limit).all()
