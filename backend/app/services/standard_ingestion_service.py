import csv
import json
import re
from pathlib import Path
from typing import Any, Dict, Iterable, List

from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.standard import Standard, StandardVersion
from app.services.embedding_service import EmbeddingService


class StandardIngestionService:
    """Replaceable metadata ingestion boundary for authoritative BIS sources."""

    @staticmethod
    def normalize_text(value: Any) -> str:
        return re.sub(r"\s+", " ", str(value or "")).strip()

    @classmethod
    def load_file(cls, path: str) -> List[Dict[str, Any]]:
        file_path = Path(path)
        if file_path.suffix.lower() == ".csv":
            with file_path.open(newline="", encoding="utf-8") as source:
                return list(csv.DictReader(source))
        with file_path.open(encoding="utf-8") as source:
            data = json.load(source)
        return data if isinstance(data, list) else data.get("standards", [])

    @classmethod
    def validate_and_normalize(cls, records: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        seen = set()
        for record in records:
            is_number = cls.normalize_text(record.get("is_number"))
            title = cls.normalize_text(record.get("title"))
            if not is_number or not title or is_number in seen:
                continue
            seen.add(is_number)
            item = dict(record)
            for field in ("is_number", "title", "scope", "category", "sector", "source", "verification_status"):
                item[field] = cls.normalize_text(item.get(field))
            item["keywords"] = cls.normalize_text(item.get("keywords"))
            normalized.append(item)
        return normalized

    @classmethod
    def upsert(cls, db: Session, records: Iterable[Dict[str, Any]]) -> List[Standard]:
        result = []
        for record in cls.validate_and_normalize(records):
            standard = db.query(Standard).filter(Standard.is_number == record["is_number"]).first()
            if not standard:
                standard = Standard(is_number=record["is_number"], title=record["title"], category=record.get("category") or "General")
                db.add(standard)
            for field in ("title", "scope", "category", "sector", "status", "source", "verification_status"):
                if record.get(field):
                    setattr(standard, field, record[field])
                    standard.keywords = record.get("keywords")
                    standard.is_mock = "demo" in (record.get("source") or "").lower()
            text = " ".join(record.get(field, "") for field in ("is_number", "title", "scope", "category", "sector", "keywords"))
            standard.embedding_placeholder = json.dumps(EmbeddingService.generate_embedding(text))
            if record.get("version") and record.get("publication_year"):
                if not any(version.version == record["version"] for version in standard.versions):
                    standard.versions.append(StandardVersion(version=record["version"], publication_year=int(record["publication_year"]), revision=record.get("revision"), status=record.get("status") or "Active"))
            result.append(standard)
        db.commit()
        if db.bind.dialect.name == "postgresql":
            for standard in result:
                db.execute(text("UPDATE standards SET embedding = CAST(:embedding AS vector) WHERE id = :id"), {"embedding": standard.embedding_placeholder, "id": standard.id})
            db.commit()
        return result