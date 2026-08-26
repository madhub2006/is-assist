import os
from typing import List
from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.models.document_report_audit import Document
from app.models.analysis import Analysis
from app.core.exceptions import EntityNotFoundException, InvalidFileException
from app.utils.file_storage import save_uploaded_pdf
from app.utils.pdf_extractor import extract_pdf_content
from app.services.audit_service import AuditService


class DocumentService:
    @staticmethod
    async def upload_and_process_pdf(
        db: Session,
        analysis_id: int,
        file: UploadFile,
        user_id: int,
        client_ip: str = None
    ) -> Document:
        # Check analysis exists
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise EntityNotFoundException("Analysis", analysis_id)

        # Save PDF securely
        secure_filename, destination_path, file_size = await save_uploaded_pdf(file)

        # Extract text via PyMuPDF
        extracted_data = extract_pdf_content(destination_path)

        doc_record = Document(
            analysis_id=analysis_id,
            filename=secure_filename,
            original_filename=file.filename,
            file_path=destination_path,
            file_type="application/pdf",
            file_size=file_size,
            processing_status="COMPLETED" if extracted_data["success"] and extracted_data.get("text", "").strip() else "FAILED",
            extracted_text=extracted_data.get("text", ""),
            page_count=extracted_data.get("page_count", 0),
            metadata_json={**extracted_data.get("metadata", {}), "processing_error": extracted_data.get("error") if not extracted_data.get("success") else None},
        )

        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        # Audit log
        AuditService.log(
            db=db,
            action="DOCUMENT_UPLOADED",
            user_id=user_id,
            entity_type="Document",
            entity_id=str(doc_record.id),
            details=f"Uploaded PDF tender document '{file.filename}' ({doc_record.page_count} pages) for Analysis ID {analysis_id}",
            ip_address=client_ip,
        )

        return doc_record

    @staticmethod
    def get_by_analysis(db: Session, analysis_id: int) -> List[Document]:
        return db.query(Document).filter(Document.analysis_id == analysis_id).all()

    @staticmethod
    def get_by_id(db: Session, document_id: int) -> Document:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise EntityNotFoundException("Document", document_id)
        return doc

    @staticmethod
    def delete(db: Session, document_id: int, user_id: int, client_ip: str = None) -> bool:
        doc = DocumentService.get_by_id(db, document_id)
        
        # Remove from disk if exists
        if doc.file_path and os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except Exception:
                pass

        db.delete(doc)
        db.commit()

        AuditService.log(
            db=db,
            action="DOCUMENT_DELETED",
            user_id=user_id,
            entity_type="Document",
            entity_id=str(document_id),
            details=f"Deleted document '{doc.original_filename}'",
            ip_address=client_ip,
        )
        return True
