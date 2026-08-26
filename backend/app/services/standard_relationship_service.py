from typing import List
from sqlalchemy.orm import Session
from app.models.analysis import Analysis
from app.models.standard import Standard


class StandardRelationshipService:
    @staticmethod
    def for_analysis(db: Session, analysis: Analysis) -> List[dict]:
        standard_ids = {item.standard_id for item in analysis.recommendations}
        relationships = []
        for standard in db.query(Standard).filter(Standard.id.in_(standard_ids or {0})).all():
            for relation in standard.outgoing_relationships:
                relationships.append({"from_standard": standard.is_number, "to_standard": relation.target_standard.is_number, "title": relation.target_standard.title, "relationship_type": relation.relationship_type, "description": relation.description, "verification_status": relation.target_standard.verification_status})
        return relationships