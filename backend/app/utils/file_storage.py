import os
import uuid
import re
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import InvalidFileException


def sanitize_filename(filename: str) -> str:
    """Sanitize the original filename to prevent directory traversal or script injection."""
    # Keep only alphanumeric, dots, dashes, underscores
    clean = re.sub(r"[^a-zA-Z0-9._-]", "_", os.path.basename(filename))
    return clean[:100] if clean else "document.pdf"


async def save_uploaded_pdf(file: UploadFile) -> tuple[str, str, int]:
    """
    Validate and save an uploaded PDF file with a secure UUID filename.
    Returns (secure_filename, full_file_path, file_size).
    """
    # Validate extension
    if not file.filename.lower().endswith(".pdf"):
        raise InvalidFileException("Only PDF documents (.pdf) are permitted for tender uploads.")

    # Validate content type if provided
    if file.content_type and "pdf" not in file.content_type.lower() and file.content_type != "application/octet-stream":
        raise InvalidFileException(f"Invalid content type '{file.content_type}'. Must be a PDF.")

    # Generate secure UUID filename
    unique_id = uuid.uuid4().hex
    safe_orig = sanitize_filename(file.filename)
    secure_filename = f"{unique_id}_{safe_orig}"
    destination_path = os.path.join(settings.UPLOAD_DIR, secure_filename)

    # Read and check size
    contents = await file.read()
    file_size = len(contents)

    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise InvalidFileException(
            f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024):.0f}MB."
        )

    if file_size == 0:
        raise InvalidFileException("Uploaded file is empty.")

    # Write securely
    with open(destination_path, "wb") as f:
        f.write(contents)

    return secure_filename, destination_path, file_size
