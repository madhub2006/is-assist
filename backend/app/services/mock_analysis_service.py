from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.standard import Standard
from app.models.analysis import Analysis, AnalysisRequirement, AnalysisFinding, Recommendation


class MockAnalysisService:
    """
    Phase 1 Prototype Analysis Engine.
    Generates structured prototype recommendations, requirement assessments, and risk findings.
    Clearly marks all recommendations as prototype data with is_mock=True.
    """

    @classmethod
    def evaluate_analysis(
        cls,
        db: Session,
        analysis: Analysis,
        natural_text: str = "",
        tech_spec: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        combined_text = f"{analysis.product_name} {analysis.title} {natural_text} {analysis.application_use or ''}".lower()

        # Query demo standards available in database
        all_standards = db.query(Standard).all()

        matched_recs: List[Tuple[Standard, float, str, str]] = []
        findings_data: List[Dict[str, str]] = []
        requirements_to_add: List[Dict[str, str]] = []

        # Domain matching heuristics for prototype demonstration
        if any(w in combined_text for w in ["led", "light", "luminaire", "lighting", "street light"]):
            # Lighting domain
            for std in all_standards:
                if "10322" in std.is_number or "16102" in std.is_number:
                    matched_recs.append((
                        std,
                        94.5,
                        "Core standard covering safety and photometric performance requirements for luminaires and LED street lighting applications.",
                        "Recommended (Prototype)"
                    ))
                elif "15885" in std.is_number or "16103" in std.is_number:
                    matched_recs.append((
                        std,
                        88.0,
                        "Normative reference for AC/DC supplied electronic controlgear (LED Drivers) and efficiency parameters.",
                        "Normative Reference (Prototype)"
                    ))

            findings_data.extend([
                {
                    "severity": "WARNING",
                    "title": "Surge Protection Specification Incomplete",
                    "description": "The specification does not explicitly state minimum 10kV surge protection device (SPD) requirement as per outdoor municipal procurement guidelines.",
                    "recommendation": "Incorporate explicit surge withstand rating (minimum 10 kV/5 kA) in Clause 4.2."
                },
                {
                    "severity": "INFO",
                    "title": "Ingress Protection Rating Identified",
                    "description": "IP66 ingress protection rating identified for luminaire enclosure, which meets standard outdoor environmental criteria.",
                    "recommendation": "Maintain IP66 compliance requirement and verify third-party test laboratory accreditation."
                },
                {
                    "severity": "NEEDS_VERIFICATION",
                    "title": "Warranty & L70 Lumen Maintenance Verification",
                    "description": "50,000 burning hours claim requires LM-79 and LM-80 test reports from an accredited NABL testing facility.",
                    "recommendation": "Mandate submission of LM-79 and LM-80 test reports alongside standard technical bid documentation."
                }
            ])

            requirements_to_add.extend([
                {"category": "Performance", "name": "System Efficacy", "value": "≥ 120 Lumens/Watt", "status": "Provided"},
                {"category": "Safety", "name": "Ingress Protection", "value": "IP66 Enclosure", "status": "Provided"},
                {"category": "Electrical", "name": "Power Factor", "value": "≥ 0.95 at 230V AC", "status": "Provided"},
                {"category": "Testing", "name": "Surge Protection Test", "value": "10 kV external SPD", "status": "Needs Review"},
                {"category": "Certification", "name": "BIS CRS Registration", "value": "Mandatory under CRO order", "status": "Provided"}
            ])
            readiness_score = 86

        elif any(w in combined_text for w in ["transformer", "power", "distribution", "voltage"]):
            # Transformer domain
            for std in all_standards:
                if "1180" in std.is_number or "2026" in std.is_number:
                    matched_recs.append((
                        std,
                        96.0,
                        "Mandatory Indian Standard specification for Outdoor Distribution Transformers up to and including 2.5 MVA / 33 kV.",
                        "Mandatory Standard (Prototype)"
                    ))
                elif "335" in std.is_number:
                    matched_recs.append((
                        std,
                        91.2,
                        "Specification for uninhibited and inhibited mineral insulating oils for transformers and switchgear.",
                        "Normative Reference (Prototype)"
                    ))

            findings_data.extend([
                {
                    "severity": "CRITICAL",
                    "title": "BEE Star Rating Energy Efficiency Levels Missing",
                    "description": "Procurement of distribution transformers requires adherence to BEE energy efficiency loss limits (Level 2 or Level 3 standards).",
                    "recommendation": "Specify maximum permissible total losses at 50% and 100% loading as per BEE Level 2 norms."
                },
                {
                    "severity": "WARNING",
                    "title": "Short Circuit Withstand Test Requirement",
                    "description": "Type test certificate for dynamic and thermal short-circuit withstand test must not be older than 5 years.",
                    "recommendation": "Add clause requiring valid CPRI/ERDA short circuit test certificate from identical rating."
                }
            ])

            requirements_to_add.extend([
                {"category": "Electrical", "name": "Rated Capacity", "value": "100 kVA / 11 kV / 433 V", "status": "Provided"},
                {"category": "Performance", "name": "Energy Loss Limits", "value": "BEE Level 2 Standards", "status": "Needs Review"},
                {"category": "Safety", "name": "Insulating Medium", "value": "Mineral Oil IS 335 Type II", "status": "Provided"},
                {"category": "Testing", "name": "Type Test Validity", "value": "CPRI/ERDA within 5 years", "status": "Missing"}
            ])
            readiness_score = 74

        elif any(w in combined_text for w in ["pipe", "pvc", "hdpe", "water", "plumbing"]):
            # Piping domain
            for std in all_standards:
                if "4984" in std.is_number or "4985" in std.is_number or "12235" in std.is_number:
                    matched_recs.append((
                        std,
                        93.0,
                        "Standard for High Density Polyethylene (HDPE) / Unplasticized PVC pipes for potable water supplies.",
                        "Recommended (Prototype)"
                    ))

            findings_data.extend([
                {
                    "severity": "INFO",
                    "title": "Hydrostatic Pressure Test Verification",
                    "description": "Standard hydrostatic internal pressure test at 27°C and 80°C identified.",
                    "recommendation": "Confirm sampling frequency for batch testing as per IS sampling scheme."
                },
                {
                    "severity": "WARNING",
                    "title": "Raw Material Grade Certification",
                    "description": "PE-100 virgin grade polymer certificate is required to avoid reground material usage.",
                    "recommendation": "Add clause prohibiting recycled polymer and demanding manufacturer raw material test certificate (MTC)."
                }
            ])

            requirements_to_add.extend([
                {"category": "Material", "name": "Polymer Grade", "value": "PE-100 Virgin Grade", "status": "Provided"},
                {"category": "Performance", "name": "Pressure Rating", "value": "PN 6 / PN 10", "status": "Provided"},
                {"category": "Testing", "name": "Long-Term Hydrostatic", "value": "IS 4984 Clause 7.3", "status": "Provided"}
            ])
            readiness_score = 88

        else:
            # General / Default procurement domain
            for std in all_standards[:3]:
                matched_recs.append((
                    std,
                    79.0,
                    f"Relevant general engineering / quality standard ({std.is_number}) applicable to procurement category.",
                    "General Reference (Prototype)"
                ))

            findings_data.extend([
                {
                    "severity": "INFO",
                    "title": "General Quality Assurance Plan Required",
                    "description": "Ensure manufacturer holds active ISO 9001 / BIS Quality Management certification.",
                    "recommendation": "Require submission of QAP (Quality Assurance Plan) with inspection hold points."
                },
                {
                    "severity": "WARNING",
                    "title": "Warranty & Acceptance Criteria Ambiguity",
                    "description": "Specification should clarify onsite inspection vs factory acceptance testing (FAT) timeline.",
                    "recommendation": "Define 14-day defect rectification SLA during standard warranty period."
                }
            ])

            requirements_to_add.extend([
                {"category": "General", "name": "Quality Management", "value": "ISO 9001:2015 / BIS Certification", "status": "Provided"},
                {"category": "Warranty", "name": "Defect Liability Period", "value": "24 Months from commissioning", "status": "Needs Review"},
                {"category": "Testing", "name": "Pre-dispatch Inspection", "value": "Joint Inspection at manufacturer works", "status": "Provided"}
            ])
            readiness_score = 80

        # If no standards matched above, pick top 2 demo standards from db
        if not matched_recs and all_standards:
            for s in all_standards[:2]:
                matched_recs.append((
                    s,
                    82.0,
                    "General prototype standard mapping based on category classification.",
                    "Prototype Reference"
                ))

        return {
            "readiness_score": readiness_score,
            "matched_standards": matched_recs,
            "findings": findings_data,
            "requirements": requirements_to_add,
            "summary": f"Prototype specification readiness evaluated at {readiness_score}%. {len(matched_recs)} relevant standards identified and {len(findings_data)} technical attention items generated for review.",
            "is_mock": True
        }
