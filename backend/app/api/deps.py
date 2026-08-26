from typing import Generator, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Dependency to retrieve the authenticated user from the JWT token."""
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Invalid or expired authentication token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Token payload missing subject identifier")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise UnauthorizedException("Authenticated user not found in database")

    if not user.is_active:
        raise ForbiddenException("User account is inactive or disabled")

    return user


class RoleChecker:
    """Dependency factory to enforce role-based access control (RBAC)."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.name if current_user.role else ""
        if user_role not in self.allowed_roles:
            raise ForbiddenException(
                f"Access denied. Requires one of roles: {', '.join(self.allowed_roles)}. Your role is '{user_role}'."
            )
        return current_user


# Convenience shortcuts
require_admin = RoleChecker(["Admin"])
require_officer_or_admin = RoleChecker(["Admin", "Procurement Officer"])
require_reviewer_or_admin = RoleChecker(["Admin", "Reviewer"])
require_any_authenticated = get_current_user
