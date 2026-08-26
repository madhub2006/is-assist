import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app
from app.database.session import get_db
from app.database.base import Base
from app.models.role_department import Role, Department
from app.models.user import User
from app.models.standard import Standard
from app.core.security import get_password_hash, create_access_token

TEST_DATABASE_URL = "sqlite:///./test_is_assist.db"

test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed test roles and departments
    admin_role = Role(name="Admin", description="Admin")
    officer_role = Role(name="Procurement Officer", description="Officer")
    reviewer_role = Role(name="Reviewer", description="Reviewer")
    db.add_all([admin_role, officer_role, reviewer_role])
    
    dept = Department(name="Ministry of Energy", code="MOE")
    db.add(dept)
    db.commit()

    admin_user = User(
        name="Test Admin",
        email="testadmin@isassist.gov.in",
        password_hash=get_password_hash("TestPass@123"),
        role_id=admin_role.id,
        department_id=dept.id,
        is_active=True
    )
    officer_user = User(
        name="Test Officer",
        email="testofficer@isassist.gov.in",
        password_hash=get_password_hash("TestPass@123"),
        role_id=officer_role.id,
        department_id=dept.id,
        is_active=True
    )
    db.add_all([admin_user, officer_user])

    std = Standard(
        is_number="DEMO-IS-10322",
        title="Luminaires for Road and Street Lighting",
        category="Electrical",
        sector="Municipal",
        status="Active",
        source="BIS / Demo",
        verification_status="Verified (Demo)"
    )
    db.add(std)
    db.commit()

    yield

    db.close()
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_is_assist.db"):
        try:
            os.remove("./test_is_assist.db")
        except Exception:
            pass


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_token():
    return create_access_token(
        subject=1,
        extra_claims={"role": "Admin", "email": "testadmin@isassist.gov.in", "name": "Test Admin"}
    )


@pytest.fixture
def officer_token():
    return create_access_token(
        subject=2,
        extra_claims={"role": "Procurement Officer", "email": "testofficer@isassist.gov.in", "name": "Test Officer"}
    )
