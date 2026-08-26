from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.standard import StandardResponse


class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    category: Optional[str] = None
    sector: Optional[str] = None


class SemanticStandardResult(StandardResponse):
    relevance_score: float
    reason: str


class RecommendationRequest(BaseModel):
    top_k: int = 5


class RecommendationExplanation(BaseModel):
    relevance_score: float
    reason: str
    matched_concepts: List[str] = []
    verification_status: str
    source: str


class ChatRequest(BaseModel):
    question: str
    analysis_id: Optional[int] = None