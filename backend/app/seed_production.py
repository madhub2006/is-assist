from app.core.security import get_password_hash
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.models.role_department import Department, Role
from app.models.standard import Standard
from app.models.user import User
import app.models


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        roles = {}
        for name in ("Admin", "Procurement Officer", "Reviewer"):
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=f"{name} access")
                db.add(role)
                db.flush()
            roles[name] = role
        department = db.query(Department).filter(Department.code == "MPE").first()
        if not department:
            department = Department(name="Ministry of Power & Energy", code="MPE")
            db.add(department)
            db.flush()
        users = (
            ("Shri Rajesh Sharma", "admin@isassist.gov.in", "Admin@123456", "Admin"),
            ("Smt. Priya Nair", "officer@isassist.gov.in", "Officer@123456", "Procurement Officer"),
            ("Dr. Anil Kumar", "reviewer@isassist.gov.in", "Reviewer@123456", "Reviewer"),
        )
        for name, email, password, role_name in users:
            if not db.query(User).filter(User.email == email).first():
                db.add(User(name=name, email=email, password_hash=get_password_hash(password), role_id=roles[role_name].id, department_id=department.id, is_active=True))
        if not db.query(Standard).first():
            db.add_all([
                Standard(is_number="DEMO-IS-001", title="LED Street Lighting Prototype Standard", scope="Demo metadata for LED street lighting procurement; authoritative verification required.", category="Electrical & Electronics", sector="Municipal Infrastructure", source="BIS / Demo Prototype Registry", verification_status="Verified (Demo)", is_mock=True),
                Standard(is_number="DEMO-IS-002", title="Transformer Procurement Prototype Standard", scope="Demo metadata for transformer procurement; authoritative verification required.", category="Heavy Engineering", sector="Power Distribution", source="BIS / Demo Prototype Registry", verification_status="Verified (Demo)", is_mock=True),
                Standard(is_number="DEMO-IS-003", title="Water Supply Pipe Prototype Standard", scope="Demo metadata for water supply piping; authoritative verification required.", category="Civil Engineering & Piping", sector="Water Supply & Sanitation", source="BIS / Demo Prototype Registry", verification_status="Verified (Demo)", is_mock=True),
            ])
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()