from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.exceptions import ISAssistException
from app.database.base import Base
from app.database.session import engine
from app.api.api import api_router

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description="""
# IS-Assist Backend API (Phase 1)
**AI-Powered Indian Standards & Procurement Intelligence Platform**

### Key Capabilities:
* **Procurement Requirement Analysis**: Parse natural language and structured specs.
* **Document Processing Foundation**: PyMuPDF-based text and metadata extraction for PDF tenders.
* **Indian Standards Directory**: Searchable database of standards, versions, amendments, and normative relationships.
* **Prototype Recommendation Engine**: Clearly marked AI/algorithmic prototype recommendations and risk findings.
* **Role-Based Access Control**: Admin, Procurement Officer, and Reviewer role permissions.
* **Audit Trail**: Government-grade compliance activity logging.

*Note: Phase 1 provides the complete foundation and prototype mock evaluation engine. Phase 2 will introduce pgvector embeddings, RAG, and LLM reasoning.*
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Custom Exception Handler
@app.exception_handler(ISAssistException)
async def is_assist_exception_handler(request: Request, exc: ISAssistException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {
            "success": False,
            "message": str(exc.detail),
            "error_code": "IS_ASSIST_ERROR"
        }
    )


# Health Check
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "phase": "Phase 2 + Phase 3 Intelligence",
        "tagline": settings.TAGLINE,
        "environment": settings.ENVIRONMENT
    }


# Include API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
