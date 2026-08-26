import json
import urllib.request
from typing import Dict, Optional

from sqlalchemy.orm import Session

from app.models.analysis import Analysis
from app.services.semantic_recommendation_service import VectorSearchService
from app.core.config import settings


class RequirementNormalizationService:
    @staticmethod
    def normalize(text: str) -> str:
        """Preserve official identifiers while accepting English, Hindi and Hinglish text."""
        return " ".join((text or "").split())


class RetrievalService:
    @staticmethod
    def retrieve(db: Session, question: str, analysis: Optional[Analysis] = None):
        query = question
        if analysis:
            query = f"{analysis.product_name} {analysis.application_use or ''} {question}"
        return VectorSearchService.search(db, RequirementNormalizationService.normalize(query), top_k=5)


class ContextBuilder:
    @staticmethod
    def build(results) -> str:
        return "\n".join(f"{standard.is_number}: {standard.title}. Scope: {standard.scope or 'Unavailable'}. Source: {standard.source}." for standard, _ in results)


class LLMService:
    @staticmethod
    def answer(question: str, context: str) -> str:
        if not context:
            return "I could not verify this from the available indexed sources."
        if settings.LLM_API_KEY and settings.LLM_MODEL:
            payload = json.dumps({
                "model": settings.LLM_MODEL,
                "temperature": 0,
                "messages": [
                    {"role": "system", "content": "Answer only from the supplied sources. Never invent standards, versions, amendments, certifications, or technical values. If unavailable, say you could not verify it."},
                    {"role": "user", "content": f"Sources:\n{context}\n\nQuestion: {question}"},
                ],
            }).encode("utf-8")
            request = urllib.request.Request(settings.LLM_API_URL, data=payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {settings.LLM_API_KEY}"})
            try:
                with urllib.request.urlopen(request, timeout=20) as response:
                    data = json.loads(response.read().decode("utf-8"))
                return data["choices"][0]["message"]["content"]
            except (OSError, KeyError, IndexError, json.JSONDecodeError):
                return "AI service is temporarily unavailable. The indexed sources are available for manual review."
        return "Available indexed sources indicate: " + context.splitlines()[0] + " Please review the cited source before procurement use."


class RAGService:
    @classmethod
    def answer(cls, db: Session, question: str, analysis: Optional[Analysis] = None) -> Dict:
        results = RetrievalService.retrieve(db, question, analysis)
        context = ContextBuilder.build(results)
        return {"answer": LLMService.answer(question, context), "sources": [{"is_number": standard.is_number, "title": standard.title, "source": standard.source, "verification_status": standard.verification_status, "relevance_score": round(score * 100, 2)} for standard, score in results], "disclaimer": "AI assistance is source-grounded support, not legal compliance certification."}