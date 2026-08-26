from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.standard import Standard


class SearchService:
    """
    Search foundation for Indian Standards.
    Phase 1: Database relational search (IS number, Title, Category, Sector, Scope).
    Phase 2 Extension Point: Hybrid Search (BM25 Keyword + Sentence Transformer pgvector Semantic Search + Reranking).
    """

    @classmethod
    def search_standards(
        cls,
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[Standard], int]:
        q = db.query(Standard)

        if query and query.strip():
            term = f"%{query.strip()}%"
            q = q.filter(
                or_(
                    Standard.is_number.ilike(term),
                    Standard.title.ilike(term),
                    Standard.category.ilike(term),
                    Standard.sector.ilike(term),
                    Standard.scope.ilike(term),
                )
            )

        if category and category != "All":
            q = q.filter(Standard.category.ilike(f"%{category}%"))

        if sector and sector != "All":
            q = q.filter(Standard.sector.ilike(f"%{sector}%"))

        if status and status != "All":
            q = q.filter(Standard.status == status)

        total = q.count()
        standards = q.order_by(Standard.is_number.asc()).offset(skip).limit(limit).all()

        return standards, total
