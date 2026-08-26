from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.document_report_audit import AuditLog


class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        user_id: Optional[int] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        metadata: Optional[Any] = None,
    ) -> AuditLog:
        """Create an audit log record for tracking system events."""
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            details=details,
            ip_address=ip_address,
            metadata_json=metadata,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
