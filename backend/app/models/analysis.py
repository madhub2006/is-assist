from typing import List, Optional, Any
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Analysis(Base, TimestampMixin):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id"), nullable=True)
    
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    procurement_type: Mapped[str] = mapped_column(String(50), default="Goods", nullable=False)  # Goods, Services, Works
    quantity: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    application_use: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    natural_language_input: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    technical_spec_json: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    status: Mapped[str] = mapped_column(String(50), default="Draft", nullable=False, index=True)
    # Draft, Processing, In Review, Completed, Needs Clarification
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer, default=0, nullable=True)  # 0 to 100
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="analyses")
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="analyses")
    requirements: Mapped[List["AnalysisRequirement"]] = relationship(
        "AnalysisRequirement", back_populates="analysis", cascade="all, delete-orphan"
    )
    findings: Mapped[List["AnalysisFinding"]] = relationship(
        "AnalysisFinding", back_populates="analysis", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["Recommendation"]] = relationship(
        "Recommendation", back_populates="analysis", cascade="all, delete-orphan"
    )
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="analysis", cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(
        "Report", back_populates="analysis", cascade="all, delete-orphan"
    )


class AnalysisRequirement(Base, TimestampMixin):
    __tablename__ = "analysis_requirements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # Electrical, Safety, Performance, Environmental, Testing, Certification
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Provided", nullable=False)  # Provided, Missing, Needs Review
    source_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="requirements")


class AnalysisFinding(Base, TimestampMixin):
    __tablename__ = "analysis_findings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)  # INFO, WARNING, CRITICAL, NEEDS_VERIFICATION
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Open", nullable=False)  # Open, Resolved, Acknowledged

    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="findings")


class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    standard_id: Mapped[int] = mapped_column(ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    relevance_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # e.g., 94.5%
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(50), default="Needs Verification", nullable=False)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    analysis: Mapped["Analysis"] = relationship("Analysis", back_populates="recommendations")
    standard: Mapped["Standard"] = relationship("Standard", back_populates="recommendations")
