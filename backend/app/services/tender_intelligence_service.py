import re
from typing import Dict, List

from sqlalchemy.orm import Session

from app.models.analysis import Analysis, AnalysisFinding, AnalysisRequirement
from app.models.document_report_audit import Document
from app.models.standard import Standard
from app.services.semantic_recommendation_service import SemanticRecommendationService


class RequirementExtractionService:
    patterns = {
        "Quantity": r"\b(?:quantity|qty|requirement)\s*[:=-]?\s*([\d,]+\s*[a-zA-Z]*)",
        "Testing": r"[^.\n]*(?:test|testing|inspection)[^.\n]*",
        "Safety": r"[^.\n]*(?:safety|protection|hazard)[^.\n]*",
        "Installation": r"[^.\n]*(?:install|installation|commissioning)[^.\n]*",
        "Certification": r"[^.\n]*(?:certif|BIS|ISI|registration)[^.\n]*",
    }

    @classmethod
    def extract(cls, text: str) -> List[Dict[str, str]]:
        requirements = []
        for category, pattern in cls.patterns.items():
            matches = re.findall(pattern, text or "", flags=re.IGNORECASE)
            for match in matches[:5]:
                source = match if isinstance(match, str) else " ".join(match)
                requirements.append({"category": category, "name": category, "description": source.strip(), "value": source.strip(), "status": "Provided", "source_text": source.strip()})
        return requirements

    @staticmethod
    def detect_standards(text: str) -> List[Dict[str, str]]:
        return [{"reference": match, "exact_text": match, "verification_status": "VERIFY_REQUIRED"} for match in sorted(set(re.findall(r"\bIS\s*\d+(?:\s*\([^)]*\))?\s*:?\s*\d{0,4}\b", text or "", flags=re.IGNORECASE)))]


class GapAnalysisService:
    @staticmethod
    def analyze(analysis: Analysis) -> List[Dict[str, str]]:
        names = {requirement.category.lower() for requirement in analysis.requirements}
        gaps = []
        for category in ("safety", "testing", "installation", "certification"):
            if category not in names:
                gaps.append({"category": category.title(), "message": f"Potentially missing: {category} information was not identified in the uploaded document.", "severity": "NEEDS_VERIFICATION"})
        return gaps


class VersionCheckService:
    @staticmethod
    def check(db: Session, references: List[Dict[str, str]]) -> List[Dict[str, str]]:
        result = []
        for reference in references:
            number = re.search(r"\d+", reference["reference"])
            standard = db.query(Standard).filter(Standard.is_number.ilike(f"%{number.group()}%")) .first() if number else None
            result.append({**reference, "available_version": standard.versions[0].version if standard and standard.versions else None, "message": "Current version could not be verified from available data." if not standard else "Reference requires comparison with the available version metadata."})
        return result


class SpecificationReadinessService:
    @staticmethod
    def score(analysis: Analysis) -> Dict[str, int]:
        provided = sum(requirement.status.lower() == "provided" for requirement in analysis.requirements)
        technical = round((provided / max(len(analysis.requirements), 1)) * 100)
        gaps = len(GapAnalysisService.analyze(analysis))
        coverage = max(0, 100 - gaps * 15)
        overall = round((technical + coverage) / 2)
        return {"technical_completeness": technical, "standards_coverage": coverage, "version_status": 75 if analysis.recommendations else 0, "testing_coverage": 100 if "testing" in {r.category.lower() for r in analysis.requirements} else 40, "safety_coverage": 100 if "safety" in {r.category.lower() for r in analysis.requirements} else 40, "overall": overall}


class DocumentProcessingService:
    @classmethod
    def process(cls, db: Session, analysis: Analysis) -> Dict:
        documents = db.query(Document).filter(Document.analysis_id == analysis.id).all()
        text = "\n".join(document.extracted_text or "" for document in documents)
        if not text.strip():
            analysis.status = "Needs Clarification"
            db.commit()
            return {"status": "FAILED", "message": "No text could be extracted from the uploaded document."}
        extracted = RequirementExtractionService.extract(text)
        existing = {(item.category, item.description) for item in analysis.requirements}
        for item in extracted:
            if (item["category"], item["description"]) not in existing:
                analysis.requirements.append(AnalysisRequirement(**item))
        analysis.status = "In Review"
        SemanticRecommendationService.recommend(db, analysis)
        gaps = GapAnalysisService.analyze(analysis)
        for gap in gaps:
            analysis.findings.append(AnalysisFinding(severity=gap["severity"], title=f"{gap['category']} review", description=gap["message"], recommendation="Review this area with a qualified procurement or technical expert."))
        analysis.readiness_score = SpecificationReadinessService.score(analysis)["overall"]
        db.commit()
        references = RequirementExtractionService.detect_standards(text)
        return {"status": "COMPLETED", "requirements": extracted, "detected_standards": VersionCheckService.check(db, references), "gaps": gaps, "readiness": SpecificationReadinessService.score(analysis)}