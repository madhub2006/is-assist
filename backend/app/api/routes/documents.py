import os
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Request, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentExtractResponse
from app.services.document_service import DocumentService

router = APIRouter(tags=["Document Processing"])


@router.post("/analyses/{analysis_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_tender_document(
    request: Request,
    analysis_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a tender PDF document.
    Validates PDF format, stores securely with UUID, and extracts text/metadata using PyMuPDF.
    """
    client_ip = request.client.host if request.client else None
    return await DocumentService.upload_and_process_pdf(
        db=db,
        analysis_id=analysis_id,
        file=file,
        user_id=current_user.id,
        client_ip=client_ip
    )


@router.get("/analyses/{analysis_id}/documents", response_model=List[DocumentResponse])
def get_analysis_documents(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents uploaded for a specific analysis."""
    return DocumentService.get_by_analysis(db=db, analysis_id=analysis_id)


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_details(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get metadata and extracted text for a specific document."""
    return DocumentService.get_by_id(db=db, document_id=document_id)


@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original stored PDF file."""
    doc = DocumentService.get_by_id(db=db, document_id=document_id)
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server disk")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type="application/pdf"
    )


@router.delete("/documents/{document_id}")
def delete_document(
    request: Request,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document record and its underlying file."""
    client_ip = request.client.host if request.client else None
    DocumentService.delete(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
        client_ip=client_ip
    )
    return {"success": True, "message": "Document deleted successfully"}
