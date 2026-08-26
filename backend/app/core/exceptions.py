from typing import Any, Optional
from fastapi import HTTPException, status


class ISAssistException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str = "GENERIC_ERROR",
        details: Optional[Any] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "message": message,
                "error_code": error_code,
                "details": details,
            },
        )


class EntityNotFoundException(ISAssistException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"{entity_name} with ID '{entity_id}' not found.",
            error_code="ENTITY_NOT_FOUND",
        )


class UnauthorizedException(ISAssistException):
    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            error_code="UNAUTHORIZED",
        )


class ForbiddenException(ISAssistException):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            error_code="FORBIDDEN",
        )


class InvalidFileException(ISAssistException):
    def __init__(self, message: str = "Invalid file uploaded"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            error_code="INVALID_FILE",
        )
