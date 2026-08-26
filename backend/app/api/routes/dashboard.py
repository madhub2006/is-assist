from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.analysis import Analysis, AnalysisFinding
from app.models.standard import Standard
from app.models.document_report_audit import Report
from app.schemas.dashboard import (
    DashboardStatsResponse, ActivityChartPoint, StatusDistribution, ReadinessScoreItem, AttentionItem
)
from app.schemas.analysis import AnalysisResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve aggregated procurement dashboard statistics, analytics, and attention items."""
    total_analyses = db.query(Analysis).count()
    pending_reviews = db.query(Analysis).filter(Analysis.status.in_(["In Review", "Draft"])).count()
    standards_count = db.query(Standard).count()
    reports_count = db.query(Report).count()

    # Status distribution
    completed_cnt = db.query(Analysis).filter(Analysis.status == "Completed").count()
    in_review_cnt = db.query(Analysis).filter(Analysis.status == "In Review").count()
    draft_cnt = db.query(Analysis).filter(Analysis.status == "Draft").count()
    processing_cnt = db.query(Analysis).filter(Analysis.status == "Processing").count()

    status_dist = [
        {"name": "Completed", "value": max(completed_cnt, 8), "color": "#16a34a"},
        {"name": "In Review", "value": max(in_review_cnt, 5), "color": "#2563eb"},
        {"name": "Draft", "value": max(draft_cnt, 3), "color": "#d97706"},
        {"name": "Processing", "value": max(processing_cnt, 1), "color": "#9333ea"},
    ]

    # Activity chart mock distribution with realistic trend
    activity_chart = [
        {"month": "Apr", "created": 12, "reviewed": 9},
        {"month": "May", "created": 18, "reviewed": 15},
        {"month": "Jun", "created": 24, "reviewed": 20},
        {"month": "Jul", "created": 31, "reviewed": 27},
        {"month": "Aug", "created": 38, "reviewed": 32},
        {"month": "Sep", "created": 45, "reviewed": 41},
    ]

    # Specification readiness scores of recent analyses
    recent_records = db.query(Analysis).order_by(Analysis.created_at.desc()).limit(6).all()
    readiness_scores = []
    for a in recent_records:
        readiness_scores.append({
            "name": (a.product_name[:14] + "...") if len(a.product_name) > 14 else a.product_name,
            "score": a.readiness_score or 75,
            "category": a.category or "General"
        })

    if not readiness_scores:
        readiness_scores = [
            {"name": "LED Street Light", "score": 86, "category": "Lighting"},
            {"name": "Power Transformer", "score": 74, "category": "Electrical"},
            {"name": "HDPE Pipes", "score": 88, "category": "Civil"},
            {"name": "Safety Helmets", "score": 92, "category": "Safety"},
        ]

    # Attention items
    attention_items = [
        {
            "id": "att-1",
            "type": "warning",
            "title": "Pending Tender Reviews",
            "count": max(pending_reviews, 2),
            "description": "Procurement analyses waiting for technical committee review.",
            "action_link": "/history?status=In%20Review"
        },
        {
            "id": "att-2",
            "type": "critical",
            "title": "Missing Specification Parameters",
            "count": 3,
            "description": "Surge protection & BEE energy rating details required across active drafts.",
            "action_link": "/findings?severity=CRITICAL"
        },
        {
            "id": "att-3",
            "type": "info",
            "title": "Draft Analyses in Progress",
            "count": max(draft_cnt, 2),
            "description": "Incomplete procurement drafts saved by your department.",
            "action_link": "/history?status=Draft"
        }
    ]

    # Recent analyses
    recent_analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).limit(5).all()

    return DashboardStatsResponse(
        total_analyses=max(total_analyses, 24),
        pending_reviews=max(pending_reviews, 5),
        standards_reviewed=max(standards_count, 14),
        reports_generated=max(reports_count, 18),
        is_mock_data=True,
        activity_chart=activity_chart,
        status_distribution=status_dist,
        readiness_scores=readiness_scores,
        attention_items=attention_items,
        recent_analyses=recent_analyses,
    )
