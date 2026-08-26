from typing import List, Optional
from pydantic import BaseModel
from app.schemas.analysis import AnalysisResponse


class ActivityChartPoint(BaseModel):
    month: str
    created: int
    reviewed: int


class StatusDistribution(BaseModel):
    name: str
    value: int
    color: str


class ReadinessScoreItem(BaseModel):
    name: str
    score: int
    category: str


class AttentionItem(BaseModel):
    id: str
    type: str  # warning, info, critical
    title: str
    count: int
    description: str
    action_link: str


class DashboardStatsResponse(BaseModel):
    total_analyses: int
    pending_reviews: int
    standards_reviewed: int
    reports_generated: int
    is_mock_data: bool = True
    
    activity_chart: List[ActivityChartPoint]
    status_distribution: List[StatusDistribution]
    readiness_scores: List[ReadinessScoreItem]
    attention_items: List[AttentionItem]
    recent_analyses: List[AnalysisResponse]
