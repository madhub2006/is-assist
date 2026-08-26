from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.intelligence import SemanticSearchRequest
from app.services.semantic_recommendation_service import VectorSearchService
from app.services.standard_relationship_service import StandardRelationshipService
from app.services.tender_intelligence_service import RequirementExtractionService, VersionCheckService

router = APIRouter(tags=["AI Intelligence"])


@router.post("/search/semantic")
def semantic_search(data: SemanticSearchRequest, db: Session = Depends(get_db)):
    results = VectorSearchService.search(db, data.query, min(data.top_k, 50), data.category, data.sector)
    return [{"standard": standard, "relevance_score": round(score * 100, 2), "reason": "Recommendation based on indexed metadata; source verification required."} for standard, score in results]


def _analysis(analysis_id: int, db: Session) -> Analysis:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/analyses/{analysis_id}/related-standards")
def related_standards(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return StandardRelationshipService.for_analysis(db, _analysis(analysis_id, db))


@router.get("/analyses/{analysis_id}/version-review")
def version_review(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = _analysis(analysis_id, db)
    references = []
    for document in analysis.documents:
        references.extend(RequirementExtractionService.detect_standards(document.extracted_text or ""))
    return VersionCheckService.check(db, references)


@router.get("/analyses/{analysis_id}/certification-review")
def certification_review(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = _analysis(analysis_id, db)
    identified = any(item.category.lower() == "certification" for item in analysis.requirements)
    return {"analysis_id": analysis_id, "status": "VERIFY_REQUIRED" if identified else "NOT_IDENTIFIED", "message": "Source verification required; this is not a certification determination."}


@router.post("/analyses/{analysis_id}/improve-specification")
def improve_specification(analysis_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = _analysis(analysis_id, db)
    requirements = [f"{item.name}: {item.value or item.description or 'Review required'}" for item in analysis.requirements]
    return {"analysis_id": analysis_id, "label": "AI-generated draft — requires human review.", "draft": "\n".join(requirements) or "No verified requirements were extracted; no draft can be generated safely.", "sources": [item.standard.is_number for item in analysis.recommendations if item.standard]}