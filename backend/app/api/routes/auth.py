from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, ChangePasswordRequest
from app.schemas.user import UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email & password, returning signed JWT token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "message": "User account has been deactivated", "error_code": "ACCOUNT_DEACTIVATED"}
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # Log audit event
    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="LOGIN",
        user_id=user.id,
        entity_type="User",
        entity_id=str(user.id),
        details=f"User {user.email} logged in successfully",
        ip_address=client_ip,
    )

    role_name = user.role.name if user.role else "Procurement Officer"
    dept_name = user.department.name if user.department else None

    token = create_access_token(
        subject=user.id,
        extra_claims={
            "role": role_name,
            "email": user.email,
            "name": user.name,
        }
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=role_name,
        department=dept_name,
    )


@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log out user session and record audit trail."""
    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="LOGOUT",
        user_id=current_user.id,
        entity_type="User",
        entity_id=str(current_user.id),
        details=f"User {current_user.email} logged out",
        ip_address=client_ip,
    )
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve details of currently logged-in user."""
    return current_user


@router.post("/change-password")
def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password."""
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Current password is incorrect", "error_code": "INVALID_PASSWORD"}
        )

    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "New password must be at least 6 characters long", "error_code": "PASSWORD_TOO_SHORT"}
        )

    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()

    client_ip = request.client.host if request.client else None
    AuditService.log(
        db=db,
        action="PASSWORD_CHANGED",
        user_id=current_user.id,
        entity_type="User",
        entity_id=str(current_user.id),
        details=f"User {current_user.email} changed password",
        ip_address=client_ip,
    )

    return {"success": True, "message": "Password changed successfully"}
