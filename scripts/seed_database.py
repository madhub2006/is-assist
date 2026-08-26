import os
import sys
from datetime import datetime, date, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database.session import engine, SessionLocal
from app.database.base import Base
from app.core.security import get_password_hash
from app.models.role_department import Role, Department
from app.models.user import User
from app.models.standard import Standard, StandardVersion, Amendment, StandardRelationship
from app.models.analysis import Analysis, AnalysisRequirement, AnalysisFinding, Recommendation
from app.models.document_report_audit import Report, AuditLog


def seed():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Role).first():
            print("Database already contains data. Skipping re-seed.")
            return

        print("Seeding Roles...")
        roles = {
            "Admin": Role(name="Admin", description="System administrator with full access to users, audit logs, and settings."),
            "Procurement Officer": Role(name="Procurement Officer", description="Procurement official who creates and manages specification analyses and tenders."),
            "Reviewer": Role(name="Reviewer", description="Technical committee reviewer evaluating compliance findings and standards coverage."),
        }
        db.add_all(roles.values())
        db.commit()

        print("Seeding Departments...")
        depts = [
            Department(name="Ministry of Power & Energy", code="MPE"),
            Department(name="Department of Urban Development", code="DUD"),
            Department(name="Department of Health & Family Welfare", code="DOHFW"),
            Department(name="Public Works Department", code="PWD"),
        ]
        db.add_all(depts)
        db.commit()

        print("Seeding Users with secure bcrypt hashes...")
        users = [
            User(
                name="Shri Rajesh Sharma",
                email="admin@isassist.gov.in",
                password_hash=get_password_hash("Admin@123456"),
                role_id=roles["Admin"].id,
                department_id=depts[0].id,
                is_active=True,
            ),
            User(
                name="Smt. Priya Nair",
                email="officer@isassist.gov.in",
                password_hash=get_password_hash("Officer@123456"),
                role_id=roles["Procurement Officer"].id,
                department_id=depts[1].id,
                is_active=True,
            ),
            User(
                name="Dr. Anil Kumar",
                email="reviewer@isassist.gov.in",
                password_hash=get_password_hash("Reviewer@123456"),
                role_id=roles["Reviewer"].id,
                department_id=depts[3].id,
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Indian Standards (Demo dataset)...")
        standards_data = [
            {
                "is_number": "DEMO-IS-10322-5-3",
                "title": "Luminaires - Part 5: Particular Requirements - Section 3: Luminaires for Road and Street Lighting",
                "scope": "Specifies requirements for road and street lighting luminaires, including optical performance, mechanical strength, thermal endurance, and ingress protection (IP) for outdoor applications.",
                "category": "Electrical & Electronics",
                "sector": "Municipal Infrastructure",
                "status": "Active",
                "versions": [
                    {"version": "IS 10322 (Part 5/Sec 3): 2012", "publication_year": 2012, "revision": "First Revision", "status": "Active"}
                ],
                "amendments": [
                    {"amendment_number": "AMD 1", "amendment_date": date(2018, 4, 15), "description": "Updated wind speed mechanical resistance criteria for high-mast luminaires."},
                    {"amendment_number": "AMD 2", "amendment_date": date(2021, 9, 10), "description": "Clarified CCT tolerances and glare index evaluation protocols."}
                ]
            },
            {
                "is_number": "DEMO-IS-16102-1",
                "title": "Self-ballasted LED Lamps for General Lighting Services - Part 1: Safety Requirements",
                "scope": "Specifies the safety and interchangeability requirements, together with the test methods and conditions required to show compliance of LED lamps with integrated controlgear.",
                "category": "Electrical & Electronics",
                "sector": "Energy & Power",
                "status": "Active",
                "versions": [
                    {"version": "IS 16102 (Part 1): 2014", "publication_year": 2014, "revision": "Edition 1.1", "status": "Active"}
                ],
                "amendments": [
                    {"amendment_number": "AMD 1", "amendment_date": date(2019, 11, 20), "description": "Mandated BIS Compulsory Registration Scheme (CRS) marking rules."}
                ]
            },
            {
                "is_number": "DEMO-IS-15885-2-13",
                "title": "Lamp Controlgear - Part 2: Particular Requirements - Section 13: Electronic Controlgear for LED Modules",
                "scope": "Covers particular safety requirements for electronic controlgear for use on DC supplies up to 250V and AC supplies up to 1000V at 50Hz/60Hz associated with LED modules.",
                "category": "Electrical & Electronics",
                "sector": "Energy & Power",
                "status": "Active",
                "versions": [
                    {"version": "IS 15885 (Part 2/Sec 13): 2012", "publication_year": 2012, "revision": "First Revision", "status": "Active"}
                ],
                "amendments": []
            },
            {
                "is_number": "DEMO-IS-1180-1",
                "title": "Outdoor Type Three-Phase Distribution Transformers Upto and Including 2.5 MVA, 33 kV",
                "scope": "Prescribes requirements and tests for outdoor type three-phase distribution transformers, including maximum permissible losses, temperature rise, and short circuit dynamic test criteria.",
                "category": "Heavy Engineering",
                "sector": "Power Distribution",
                "status": "Active",
                "versions": [
                    {"version": "IS 1180 (Part 1): 2014", "publication_year": 2014, "revision": "Fourth Revision", "status": "Active"}
                ],
                "amendments": [
                    {"amendment_number": "AMD 1", "amendment_date": date(2016, 7, 1), "description": "Harmonized total loss limits with BEE Star Labeling Level 2 norms."},
                    {"amendment_number": "AMD 2", "amendment_date": date(2020, 1, 15), "description": "Mandatory short circuit withstand testing every 5 years."}
                ]
            },
            {
                "is_number": "DEMO-IS-335",
                "title": "Insulating Liquids - Specifications for Unused Mineral Insulating Oils for Transformers and Switchgear",
                "scope": "Specifies requirements and test methods for unused mineral insulating oils as delivered, for use in transformers, switchgear, and similar electrical equipment where oil is required for insulation.",
                "category": "Chemicals & Petroleum",
                "sector": "Power Distribution",
                "status": "Active",
                "versions": [
                    {"version": "IS 335: 2018", "publication_year": 2018, "revision": "Fifth Revision", "status": "Active"}
                ],
                "amendments": []
            },
            {
                "is_number": "DEMO-IS-4984",
                "title": "High Density Polyethylene (HDPE) Pipes for Potable Water Supplies - Specification",
                "scope": "Specifies requirements for HDPE pipes from 16 mm to 1000 mm nominal outer diameter for use in buried and above-ground water supply systems under pressure.",
                "category": "Civil Engineering & Piping",
                "sector": "Water Supply & Sanitation",
                "status": "Active",
                "versions": [
                    {"version": "IS 4984: 2016", "publication_year": 2016, "revision": "Fifth Revision", "status": "Active"}
                ],
                "amendments": [
                    {"amendment_number": "AMD 1", "amendment_date": date(2019, 3, 10), "description": "Mandatory PE-100 virgin grade polymer certificate without recycled content."}
                ]
            },
            {
                "is_number": "DEMO-IS-2062",
                "title": "Hot Rolled Medium and High Tensile Structural Steel - Specification",
                "scope": "Specifies requirements for hot rolled medium and high tensile structural steel for use in structural work, bridges, building construction, and general engineering.",
                "category": "Metallurgy & Steel",
                "sector": "Construction & Infrastructure",
                "status": "Active",
                "versions": [
                    {"version": "IS 2062: 2011", "publication_year": 2011, "revision": "Seventh Revision", "status": "Active"}
                ],
                "amendments": []
            },
            {
                "is_number": "DEMO-IS-2925",
                "title": "Specification for Industrial Safety Helmets",
                "scope": "Covers requirements regarding materials, construction, finish, and testing of industrial safety helmets intended for protection against falling objects.",
                "category": "Personal Protective Equipment",
                "sector": "Occupational Safety",
                "status": "Active",
                "versions": [
                    {"version": "IS 2925: 1984", "publication_year": 1984, "revision": "Reaffirmed 2020", "status": "Active"}
                ],
                "amendments": []
            }
        ]

        created_stds = {}
        for s_data in standards_data:
            std = Standard(
                is_number=s_data["is_number"],
                title=s_data["title"],
                scope=s_data["scope"],
                category=s_data["category"],
                sector=s_data["sector"],
                status=s_data["status"],
                source="BIS / Demo Prototype Registry",
                verification_status="Verified (Demo)",
            )
            db.add(std)
            db.commit()
            db.refresh(std)
            created_stds[s_data["is_number"]] = std

            for v in s_data.get("versions", []):
                ver = StandardVersion(
                    standard_id=std.id,
                    version=v["version"],
                    publication_year=v["publication_year"],
                    revision=v.get("revision"),
                    status=v["status"]
                )
                db.add(ver)

            for a in s_data.get("amendments", []):
                amd = Amendment(
                    standard_id=std.id,
                    amendment_number=a["amendment_number"],
                    amendment_date=a.get("amendment_date"),
                    description=a.get("description"),
                    status="Active"
                )
                db.add(amd)

        db.commit()

        print("Seeding Standard Relationships...")
        relationships = [
            {
                "source": "DEMO-IS-10322-5-3",
                "target": "DEMO-IS-15885-2-13",
                "type": "NORMATIVE_REFERENCE",
                "description": "Requires electronic controlgear compliance for LED luminaire driver circuitry."
            },
            {
                "source": "DEMO-IS-10322-5-3",
                "target": "DEMO-IS-16102-1",
                "type": "RELATED_PRODUCT",
                "description": "Related lighting safety criteria for self-ballasted lamps."
            },
            {
                "source": "DEMO-IS-1180-1",
                "target": "DEMO-IS-335",
                "type": "NORMATIVE_REFERENCE",
                "description": "Mandates transformer oil quality parameters as per IS 335 specification."
            }
        ]

        for rel in relationships:
            if rel["source"] in created_stds and rel["target"] in created_stds:
                db_rel = StandardRelationship(
                    source_standard_id=created_stds[rel["source"]].id,
                    target_standard_id=created_stds[rel["target"]].id,
                    relationship_type=rel["type"],
                    description=rel["description"]
                )
                db.add(db_rel)
        db.commit()

        print("Seeding Sample Procurement Analyses...")
        sample_analysis_1 = Analysis(
            user_id=users[1].id,
            department_id=depts[1].id,
            title="Procurement of 100W Smart LED Street Lights for Ring Road Project",
            product_name="LED Street Light 100W",
            category="Electrical & Electronics",
            procurement_type="Goods",
            quantity="1200 Nos",
            application_use="Highway and urban arterial road illumination with centralized monitoring system.",
            natural_language_input="We need to procure 1200 units of energy-efficient 100W LED street lights with IP66 protection, surge protection 10kV, and automated dimming functionality for the municipal smart city highway expansion.",
            status="In Review",
            readiness_score=86,
            is_mock=True,
            summary="Prototype specification readiness evaluated at 86%. 2 relevant standards identified and 3 technical attention items generated for review.",
        )
        db.add(sample_analysis_1)
        db.commit()
        db.refresh(sample_analysis_1)

        # Requirements for Analysis 1
        sample_reqs = [
            {"category": "Performance", "name": "System Efficacy", "value": "≥ 120 Lumens/Watt", "status": "Provided"},
            {"category": "Safety", "name": "Ingress Protection", "value": "IP66 Enclosure", "status": "Provided"},
            {"category": "Electrical", "name": "Power Factor", "value": "≥ 0.95 at 230V AC", "status": "Provided"},
            {"category": "Testing", "name": "Surge Protection Test", "value": "10 kV external SPD", "status": "Needs Review"},
            {"category": "Certification", "name": "BIS CRS Registration", "value": "Mandatory under CRO order", "status": "Provided"}
        ]
        for r in sample_reqs:
            db.add(AnalysisRequirement(analysis_id=sample_analysis_1.id, **r))

        # Recommendations for Analysis 1
        db.add(Recommendation(
            analysis_id=sample_analysis_1.id,
            standard_id=created_stds["DEMO-IS-10322-5-3"].id,
            relevance_score=94.5,
            reason="Core standard covering safety and photometric performance requirements for road and street lighting luminaires.",
            verification_status="Recommended (Prototype)",
            is_mock=True
        ))
        db.add(Recommendation(
            analysis_id=sample_analysis_1.id,
            standard_id=created_stds["DEMO-IS-15885-2-13"].id,
            relevance_score=88.0,
            reason="Normative reference for AC/DC supplied electronic controlgear (LED Drivers) and efficiency parameters.",
            verification_status="Normative Reference (Prototype)",
            is_mock=True
        ))

        # Findings for Analysis 1
        db.add(AnalysisFinding(
            analysis_id=sample_analysis_1.id,
            severity="WARNING",
            title="Surge Protection Specification Incomplete",
            description="The specification does not explicitly state minimum 10kV surge protection device (SPD) requirement as per outdoor municipal procurement guidelines.",
            recommendation="Incorporate explicit surge withstand rating (minimum 10 kV/5 kA) in Clause 4.2.",
            status="Open"
        ))
        db.add(AnalysisFinding(
            analysis_id=sample_analysis_1.id,
            severity="INFO",
            title="Ingress Protection Rating Identified",
            description="IP66 ingress protection rating identified for luminaire enclosure, which meets standard outdoor environmental criteria.",
            recommendation="Maintain IP66 compliance requirement and verify third-party test laboratory accreditation.",
            status="Acknowledged"
        ))

        # Report for Analysis 1
        report = Report(
            analysis_id=sample_analysis_1.id,
            generated_by=users[1].id,
            status="Completed",
            summary="Prototype procurement advisory report generated for LED Street Light 100W. Readiness evaluated at 86%.",
            report_data_json={
                "report_title": "Procurement Advisory & Standards Review: LED Street Light 100W",
                "readiness_score": 86,
                "product_name": "LED Street Light 100W",
                "category": "Electrical & Electronics"
            }
        )
        db.add(report)

        # Audit logs
        AuditLog_1 = AuditLog(
            user_id=users[0].id,
            action="SYSTEM_INIT",
            entity_type="System",
            details="System initial seed dataset created successfully.",
            ip_address="127.0.0.1"
        )
        db.add(AuditLog_1)

        db.commit()
        print("Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
