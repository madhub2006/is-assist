from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import require_admin, get_current_user
from app.models.user import User
from app.models.role_department import Role, Department
from app.schemas.user import UserCreate, UserUpdate, UserResponse, RoleResponse, DepartmentResponse
from app.core.security import get_password_hash
from app.core.exceptions import EntityNotFoundException
from app.services.audit_service import AuditService

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """List all registered users (Admin only)."""
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/roles", response_model=List[RoleResponse])
def get_roles(db: Session = Depends(get_db)):
    """List available system roles."""
    return db.query(Role).all()


@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    """List available government/enterprise departments."""
    return db.query(Department).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single user profile by ID (Admin or Self)."""
    if current_user.role.name != "Admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise EntityNotFoundException("User", user_id)
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: Request,
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new user account (Admin only)."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": f"User with email '{user_data.email}' already exists."}
        )

    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        role_id=user_data.role_id,
        department_id=user_data.department_id,
        is_active=user_data.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="USER_CREATED",
        user_id=current_user.id,
        entity_type="User",
        entity_id=str(user.id),
        details=f"Admin created user '{user.email}' with role ID {user.role_id}",
        ip_address=client_ip,
    )

    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    request: Request,
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update a user's details or status (Admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise EntityNotFoundException("User", user_id)

    update_dict = user_data.model_dump(exclude_unset=True)
    if "password" in update_dict and update_dict["password"]:
        user.password_hash = get_password_hash(update_dict.pop("password"))

    for k, v in update_dict.items():
        setattr(user, k, v)

    db.commit()
    db.refresh(user)

    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="USER_UPDATED",
        user_id=current_user.id,
        entity_type="User",
        entity_id=str(user.id),
        details=f"Admin updated user '{user.email}'",
        ip_address=client_ip,
    )

    return user


@router.delete("/{user_id}")
def delete_user(
    request: Request,
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Deactivate or delete a user account (Admin only)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Admin cannot delete own account."}
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise EntityNotFoundException("User", user_id)

    # Mark inactive rather than hard delete to preserve audit relations
    user.is_active = False
    db.commit()

    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="USER_DEACTIVATED",
        user_id=current_user.id,
        entity_type="User",
        entity_id=str(user_id),
        details=f"Admin deactivated user '{user.email}'",
        ip_address=client_ip,
    )

    return {"success": True, "message": f"User '{user.email}' deactivated."}
