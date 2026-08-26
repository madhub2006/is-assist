import json
import re
from typing import List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session, joinedload

from app.models.analysis import Analysis, Recommendation
from app.models.standard import Standard
from app.services.embedding_service import EmbeddingService


class VectorSearchService:
    """Uses pgvector when available later; JSON embeddings provide SQLite parity now."""

    @staticmethod
    def _similarity(left: List[float], right: List[float]) -> float:
        return max(0.0, min(1.0, sum(a * b for a, b in zip(left, right))))

    @classmethod
    def search(cls, db: Session, query: str, top_k: int = 5, category: Optional[str] = None, sector: Optional[str] = None) -> List[tuple]:
        query_embedding = EmbeddingService.generate_embedding(query)
        if db.bind.dialect.name == "postgresql":
            filters = ["embedding IS NOT NULL"]
            params = {"embedding": str(query_embedding), "limit": min(top_k, 50)}
            if category:
                filters.append("category ILIKE :category")
                params["category"] = f"%{category}%"
            if sector:
                filters.append("sector ILIKE :sector")
                params["sector"] = f"%{sector}%"
            rows = db.execute(text(f"SELECT id, 1 - (embedding <=> CAST(:embedding AS vector)) AS score FROM standards WHERE {' AND '.join(filters)} ORDER BY embedding <=> CAST(:embedding AS vector) LIMIT :limit"), params).all()
            standards = {standard.id: standard for standard in db.query(Standard).filter(Standard.id.in_([row.id for row in rows] or {0})).all()}
            return [(standards[row.id], float(row.score)) for row in rows if row.id in standards and float(row.score) >= 0.15]
        standards_query = db.query(Standard)
        if category:
            standards_query = standards_query.filter(Standard.category.ilike(f"%{category}%"))
        if sector:
            standards_query = standards_query.filter(Standard.sector.ilike(f"%{sector}%"))
        ranked = []
        query_terms = set(re.findall(r"[a-z0-9]+", query.lower()))
        for standard in standards_query.all():
            text = " ".join(filter(None, [standard.is_number, standard.title, standard.scope, standard.category, standard.sector])).lower()
            lexical = len(query_terms.intersection(set(re.findall(r"[a-z0-9]+", text)))) / max(len(query_terms), 1)
            vector = cls._similarity(query_embedding, json.loads(standard.embedding_placeholder)) if standard.embedding_placeholder else 0.0
            score = min(1.0, vector * 0.7 + lexical * 0.3)
            if score >= 0.15:
                ranked.append((standard, score))
        return sorted(ranked, key=lambda item: item[1], reverse=True)[:top_k]


class SemanticRecommendationService:
    @staticmethod
    def recommend(db: Session, analysis: Analysis, top_k: int = 5) -> List[Recommendation]:
        query = " ".join(filter(None, [analysis.product_name, analysis.natural_language_input, analysis.application_use, analysis.category]))
        results = VectorSearchService.search(db, query, top_k)
        db.query(Recommendation).filter(Recommendation.analysis_id == analysis.id).delete(synchronize_session=False)
        recommendations = []
        for standard, score in results:
            recommendations.append(Recommendation(
                analysis_id=analysis.id,
                standard_id=standard.id,
                relevance_score=round(score * 100, 2),
                reason=f"Relevance based on product, application, and technical terminology match. Score is an AI recommendation, not legal certainty.",
                verification_status=standard.verification_status,
                is_mock=standard.source.lower().find("demo") >= 0,
            ))
        db.add_all(recommendations)
        db.commit()
        for recommendation in recommendations:
            db.refresh(recommendation)
        return recommendations