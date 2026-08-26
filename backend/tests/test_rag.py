from app.services.rag_service import RAGService, RequirementNormalizationService


def test_normalization_preserves_multilingual_input():
    text = "राजमार्ग के लिए energy efficient LED lights"
    assert RequirementNormalizationService.normalize(text) == text


def test_rag_returns_grounding_fallback_without_sources():
    from conftest import TestingSessionLocal
    db = TestingSessionLocal()
    try:
        result = RAGService.answer(db, "unknown product with no matching standard")
        assert "could not verify" in result["answer"]
        assert result["sources"] == []
    finally:
        db.close()