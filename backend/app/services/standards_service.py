from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.standard import Standard, StandardVersion, Amendment, StandardRelationship
from app.schemas.standard import StandardCreate, StandardUpdate
from app.core.exceptions import EntityNotFoundException


class StandardsService:
    @staticmethod
    def get_all(
        db: Session,
        query: Optional[str] = None,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[Standard], int]:
        from app.services.search_service import SearchService
        return SearchService.search_standards(
            db=db,
            query=query,
            category=category,
            sector=sector,
            status=status,
            skip=skip,
            limit=limit,
        )

    @staticmethod
    def get_by_id(db: Session, standard_id: int) -> Standard:
        standard = db.query(Standard).filter(Standard.id == standard_id).first()
        if not standard:
            raise EntityNotFoundException("Standard", standard_id)
        return standard

    @staticmethod
    def create(db: Session, data: StandardCreate) -> Standard:
        standard = Standard(
            is_number=data.is_number,
            title=data.title,
            scope=data.scope,
            category=data.category,
            sector=data.sector,
            status=data.status,
            source=data.source,
            verification_status=data.verification_status,
        )
        db.add(standard)
        db.commit()
        db.refresh(standard)
        return standard

    @staticmethod
    def update(db: Session, standard_id: int, data: StandardUpdate) -> Standard:
        standard = StandardsService.get_by_id(db, standard_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(standard, key, value)
        db.commit()
        db.refresh(standard)
        return standard
