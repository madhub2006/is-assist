from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.exceptions import ISAssistException
from app.api.api import api_router

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
origins = [
    origin.strip().strip('[]').strip('"').strip("'").rstrip("/")
    for origin in settings.BACKEND_CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


@app.on_event("startup")
def on_startup():
    from app.database.base import Base
    from app.database.session import engine
    import app.models
    from app.seed_production import seed

    try:
        Base.metadata.create_all(bind=engine)
        seed()
    except Exception as e:
        print(f"Startup DB init info: {e}")


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

# Static files and SPA fallback for Unified Single-Link Deployment
frontend_dist_candidates = [
    os.environ.get("FRONTEND_DIST_DIR", ""),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend_dist"),
    os.path.join(os.getcwd(), "frontend", "dist"),
    os.path.join(os.getcwd(), "frontend_dist"),
    "/app/frontend_dist",
]

frontend_dist = None
for candidate in frontend_dist_candidates:
    if candidate and os.path.exists(candidate) and os.path.isdir(candidate):
        frontend_dist = candidate
        break

if frontend_dist:
    from fastapi.responses import FileResponse
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
            return JSONResponse(status_code=404, content={"message": "Not Found"})
        
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"message": "Frontend build not found"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

