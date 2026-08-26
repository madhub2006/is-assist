from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    metadata_json: Optional[Any] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
