from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    analysis_id: int
    filename: str
    original_filename: str
    file_path: str
    file_type: str
    file_size: int
    processing_status: str
    extracted_text: Optional[str] = None
    page_count: Optional[int] = 0
    metadata_json: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentExtractResponse(BaseModel):
    success: bool
    document_id: int
    filename: str
    page_count: int
    extracted_preview: str
    message: str
