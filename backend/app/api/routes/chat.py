from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.intelligence import ChatRequest
from app.services.rag_service import RAGService

router = APIRouter(tags=["AI Assistant"])


@router.post("/chat")
def chat(data: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    analysis = None
    if data.analysis_id:
        analysis = db.query(Analysis).filter(Analysis.id == data.analysis_id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
    return RAGService.answer(db, data.question, analysis)