import os
import pymupdf as fitz  # PyMuPDF
from typing import Dict, Any, Optional


def extract_pdf_content(file_path: str) -> Dict[str, Any]:
    """
    Extract text and structural metadata from a PDF file using PyMuPDF.
    Phase 1 implementation for document parsing foundation.
    """
    if not os.path.exists(file_path):
        return {
            "success": False,
            "text": "",
            "page_count": 0,
            "metadata": {},
            "error": "File not found on disk"
        }

    try:
        doc = fitz.open(file_path)
        page_count = len(doc)
        full_text = []

        for page_num in range(page_count):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                full_text.append(f"--- [Page {page_num + 1}] ---\n{text}")

        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "creator": doc.metadata.get("creator", ""),
            "format": doc.metadata.get("format", "PDF"),
        }
        
        doc.close()

        extracted_text = "\n\n".join(full_text)
        return {
            "success": True,
            "text": extracted_text,
            "page_count": page_count,
            "metadata": metadata,
            "char_count": len(extracted_text),
            "preview": extracted_text[:1000] if extracted_text else "No text extracted from document."
        }
    except Exception as e:
        return {
            "success": False,
            "text": "",
            "page_count": 0,
            "metadata": {},
            "error": str(e)
        }
