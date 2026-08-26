from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class ReportCreate(BaseModel):
    analysis_id: int
    summary: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    analysis_id: int
    generated_by: int
    file_path: Optional[str] = None
    status: str
    summary: Optional[str] = None
    report_data_json: Optional[Any] = None
    created_at: datetime
    generator_user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
