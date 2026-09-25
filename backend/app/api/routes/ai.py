"""AI Document Intelligence routes: Status, Session Management, Summarize, and Ask Questions."""

import json
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import read_upload
from app.core.config import settings
from app.schemas.ai import (
    AiAskResponse,
    AiSessionResponse,
    AiStatusResponse,
    AiSummaryResponse,
)
from app.services.ai.service import ask_document, session_manager, summarize_document
from app.utils.validation import validate_file

router = APIRouter(prefix="/ai", tags=["ai"])

PDF_ONLY = {"pdf"}


@router.get("/status", response_model=AiStatusResponse)
async def get_ai_status():
    """Return whether the AI provider is configured and ready."""
    configured = settings.is_ai_configured
    msg = (
        "AI Document Intelligence is ready."
        if configured
        else "AI features are not configured yet. Add your API_KEY to the backend .env file to enable document intelligence."
    )
    base_url = settings.get_ai_base_url()
    provider = base_url.replace("https://", "").replace("http://", "").split("/")[0]
    return AiStatusResponse(
        configured=configured,
        model=settings.get_ai_model(),
        provider=provider,
        message=msg,
    )


@router.post("/session", response_model=AiSessionResponse)
async def create_document_session(pdf_file: UploadFile = File(...)):
    """Upload a document and initialize a temporary session for fast multi-turn Q&A and summary."""
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "document.pdf", content, PDF_ONLY)
    session = session_manager.create_session(content, pdf_file.filename or "document.pdf")
    preview = session.extracted.full_text[:500] if session.extracted.full_text else "No extractable text"
    return AiSessionResponse(
        session_id=session.session_id,
        filename=session.extracted.filename,
        page_count=session.extracted.page_count,
        ocr_used=session.extracted.ocr_used,
        preview_text=preview,
    )


@router.delete("/session/{session_id}")
async def delete_document_session(session_id: str):
    """Delete a temporary in-memory document session."""
    session_manager.remove_session(session_id)
    return {"success": True, "message": "Session cleared."}


@router.post("/summary", response_model=AiSummaryResponse)
async def summarize_pdf(
    pdf_file: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    style: str = Form("concise"),
    include_key_points: bool = Form(True),
    include_topics: bool = Form(True),
    include_action_items: bool = Form(False),
):
    """Generate a structured, grounded summary from an uploaded PDF or active session."""
    content: Optional[bytes] = None
    filename = "document.pdf"
    if pdf_file:
        content = await read_upload(pdf_file)
        validate_file(pdf_file.filename or "document.pdf", content, PDF_ONLY)
        filename = pdf_file.filename or "document.pdf"

    data = await summarize_document(
        content=content,
        filename=filename,
        session_id=session_id,
        style=style,
        include_key_points=include_key_points,
        include_topics=include_topics,
        include_action_items=include_action_items,
    )
    return AiSummaryResponse(**data)


@router.post("/ask", response_model=AiAskResponse)
async def ask_pdf(
    question: str = Form(...),
    pdf_file: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    history: Optional[str] = Form("[]"),
):
    """Ask a question about the document and receive an answer strictly grounded in citations."""
    content: Optional[bytes] = None
    filename = "document.pdf"
    if pdf_file:
        content = await read_upload(pdf_file)
        validate_file(pdf_file.filename or "document.pdf", content, PDF_ONLY)
        filename = pdf_file.filename or "document.pdf"

    parsed_history: list[dict[str, str]] = []
    if history:
        try:
            parsed_history = json.loads(history)
            if not isinstance(parsed_history, list):
                parsed_history = []
        except Exception:
            parsed_history = []

    data = await ask_document(
        question=question,
        content=content,
        filename=filename,
        session_id=session_id,
        history=parsed_history,
    )
    return AiAskResponse(**data)
