from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.standard import StandardResponse
from app.schemas.user import UserResponse, DepartmentResponse


class RequirementBase(BaseModel):
    category: str
    name: str
    description: Optional[str] = None
    value: Optional[str] = None
    status: str = "Provided"  # Provided, Missing, Needs Review


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[str] = None
    status: Optional[str] = None


class RequirementResponse(RequirementBase):
    id: int
    analysis_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FindingResponse(BaseModel):
    id: int
    analysis_id: int
    severity: str  # INFO, WARNING, CRITICAL, NEEDS_VERIFICATION
    title: str
    description: str
    recommendation: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    id: int
    analysis_id: int
    standard_id: int
    relevance_score: float
    reason: Optional[str] = None
    verification_status: str
    is_mock: bool
    created_at: datetime
    standard: Optional[StandardResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AnalysisBase(BaseModel):
    title: str
    product_name: str
    category: Optional[str] = None
    procurement_type: str = "Goods"
    quantity: Optional[str] = None
    application_use: Optional[str] = None
    department_id: Optional[int] = None
    natural_language_input: Optional[str] = None
    technical_spec_json: Optional[Any] = None


class AnalysisCreate(AnalysisBase):
    requirements: Optional[List[RequirementCreate]] = []
    run_mock_analysis: bool = True


class AnalysisUpdate(BaseModel):
    title: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    procurement_type: Optional[str] = None
    quantity: Optional[str] = None
    application_use: Optional[str] = None
    department_id: Optional[int] = None
    status: Optional[str] = None
    readiness_score: Optional[int] = None
    summary: Optional[str] = None
    natural_language_input: Optional[str] = None
    technical_spec_json: Optional[Any] = None


class AnalysisResponse(AnalysisBase):
    id: int
    user_id: int
    status: str
    readiness_score: Optional[int] = 0
    is_mock: bool
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    department: Optional[DepartmentResponse] = None

    model_config = ConfigDict(from_attributes=True)


class DocumentSimpleResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    processing_status: str
    page_count: Optional[int] = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalysisDetailResponse(AnalysisResponse):
    requirements: List[RequirementResponse] = []
    findings: List[FindingResponse] = []
    recommendations: List[RecommendationResponse] = []
    documents: List[DocumentSimpleResponse] = []

    model_config = ConfigDict(from_attributes=True)
