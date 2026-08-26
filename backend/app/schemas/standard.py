from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class StandardVersionResponse(BaseModel):
    id: int
    standard_id: int
    version: str
    publication_year: int
    revision: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AmendmentResponse(BaseModel):
    id: int
    standard_id: int
    amendment_number: str
    amendment_date: Optional[date] = None
    description: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class StandardRelationshipResponse(BaseModel):
    id: int
    source_standard_id: int
    target_standard_id: int
    relationship_type: str
    description: Optional[str] = None
    target_standard_number: Optional[str] = None
    target_standard_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StandardBase(BaseModel):
    is_number: str
    title: str
    scope: Optional[str] = None
    category: str
    sector: Optional[str] = None
    status: str = "Active"
    source: str = "BIS / Demo Registry"
    verification_status: str = "Verified (Demo)"
    keywords: Optional[str] = None
    is_mock: bool = True


class StandardCreate(StandardBase):
    pass


class StandardUpdate(BaseModel):
    title: Optional[str] = None
    scope: Optional[str] = None
    category: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    verification_status: Optional[str] = None
    keywords: Optional[str] = None
    is_mock: Optional[bool] = None


class StandardResponse(StandardBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StandardDetailResponse(StandardResponse):
    versions: List[StandardVersionResponse] = []
    amendments: List[AmendmentResponse] = []
    outgoing_relationships: List[StandardRelationshipResponse] = []
    incoming_relationships: List[StandardRelationshipResponse] = []

    model_config = ConfigDict(from_attributes=True)
