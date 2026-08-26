from app.models.analysis import Analysis, AnalysisRequirement
from app.models.standard import Standard
from app.services.embedding_service import EmbeddingService
from app.services.semantic_recommendation_service import VectorSearchService
from app.services.tender_intelligence_service import GapAnalysisService, RequirementExtractionService, SpecificationReadinessService


def test_embedding_is_deterministic_and_normalized():
    first = EmbeddingService.generate_embedding("energy efficient LED street light")
    second = EmbeddingService.generate_embedding("energy efficient LED street light")
    assert first == second
    assert len(first) == 384
    assert sum(value * value for value in first) > 0.99


def test_requirement_extraction_and_safe_gap_language():
    extracted = RequirementExtractionService.extract("Quantity: 500 units. Testing shall include safety inspection.")
    assert any(item["category"] == "Quantity" for item in extracted)
    analysis = Analysis(user_id=1, title="Test", product_name="Lights", requirements=[])
    analysis.requirements.append(AnalysisRequirement(category="Testing", name="Testing", status="Provided"))
    gaps = GapAnalysisService.analyze(analysis)
    assert any("Potentially missing" in gap["message"] for gap in gaps)


def test_search_returns_no_fabricated_standard():
    from conftest import TestingSessionLocal
    db = TestingSessionLocal()
    try:
        results = VectorSearchService.search(db, "unrelated quantum mining equipment", top_k=5)
        assert all(isinstance(item[0], Standard) for item in results)
    finally:
        db.close()


def test_readiness_score_is_bounded():
    analysis = Analysis(user_id=1, title="Test", product_name="Lights", requirements=[])
    score = SpecificationReadinessService.score(analysis)
    assert 0 <= score["overall"] <= 100