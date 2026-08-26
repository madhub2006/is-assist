from datetime import date
from typing import List, Optional
from sqlalchemy import String, Text, Integer, ForeignKey, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Standard(Base, TimestampMixin):
    __tablename__ = "standards"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    is_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    scope: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sector: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)  # Active, Superseded, Withdrawn, Draft
    source: Mapped[str] = mapped_column(String(100), default="BIS / Demo Registry", nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), default="Verified (Demo)", nullable=False)
    keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Extension point for Phase 2 pgvector embedding
    # In Phase 2: embedding = mapped_column(Vector(384))
    embedding_placeholder: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    versions: Mapped[List["StandardVersion"]] = relationship(
        "StandardVersion", back_populates="standard", cascade="all, delete-orphan"
    )
    amendments: Mapped[List["Amendment"]] = relationship(
        "Amendment", back_populates="standard", cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["Recommendation"]] = relationship(
        "Recommendation", back_populates="standard"
    )
    outgoing_relationships: Mapped[List["StandardRelationship"]] = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.source_standard_id",
        back_populates="source_standard",
        cascade="all, delete-orphan"
    )
    incoming_relationships: Mapped[List["StandardRelationship"]] = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.target_standard_id",
        back_populates="target_standard",
        cascade="all, delete-orphan"
    )


class StandardVersion(Base, TimestampMixin):
    __tablename__ = "standard_versions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    standard_id: Mapped[int] = mapped_column(ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    publication_year: Mapped[int] = mapped_column(Integer, nullable=False)
    revision: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)

    standard: Mapped["Standard"] = relationship("Standard", back_populates="versions")


class Amendment(Base, TimestampMixin):
    __tablename__ = "amendments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    standard_id: Mapped[int] = mapped_column(ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    amendment_number: Mapped[str] = mapped_column(String(50), nullable=False)
    amendment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)

    standard: Mapped["Standard"] = relationship("Standard", back_populates="amendments")


class StandardRelationship(Base, TimestampMixin):
    __tablename__ = "standard_relationships"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_standard_id: Mapped[int] = mapped_column(ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    target_standard_id: Mapped[int] = mapped_column(ForeignKey("standards.id", ondelete="CASCADE"), nullable=False)
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: NORMATIVE_REFERENCE, TEST_METHOD, SAFETY, INSTALLATION, TERMINOLOGY, RELATED_PRODUCT, PERFORMANCE
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    source_standard: Mapped["Standard"] = relationship(
        "Standard", foreign_keys=[source_standard_id], back_populates="outgoing_relationships"
    )
    target_standard: Mapped["Standard"] = relationship(
        "Standard", foreign_keys=[target_standard_id], back_populates="incoming_relationships"
    )
