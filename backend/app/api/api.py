from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    analyses,
    requirements,
    documents,
    standards,
    recommendations,
    findings,
    reports,
    audit,
    dashboard,
    intelligence,
    chat,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(analyses.router)
api_router.include_router(requirements.router)
api_router.include_router(documents.router)
api_router.include_router(standards.router)
api_router.include_router(recommendations.router)
api_router.include_router(findings.router)
api_router.include_router(reports.router)
api_router.include_router(audit.router)
api_router.include_router(dashboard.router)
api_router.include_router(intelligence.router)
api_router.include_router(chat.router)
