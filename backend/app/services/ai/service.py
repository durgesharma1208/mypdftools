"""High-level AI Document Intelligence orchestration: Summarization and Question Answering."""

import json
import logging
import re
import time
import uuid
from typing import Any, Optional

from app.core.config import settings
from app.core.errors import ProcessingError, ValidationError
from app.services.ai.client import AIClient
from app.services.ai.prompts import (
    SYSTEM_QA_PROMPT,
    SYSTEM_SUMMARY_PROMPT,
    build_qa_user_prompt,
    build_summary_user_prompt,
)
from app.services.document.chunker import DocumentChunk, chunk_pages
from app.services.document.extractor import ExtractedDocument, extract_document
from app.services.document.retriever import LightweightRetriever, ScoredChunk

logger = logging.getLogger("app.ai.service")

SESSION_TTL_SECONDS = 900  # 15 minutes


class DocumentSession:
    def __init__(self, session_id: str, extracted: ExtractedDocument, chunks: list[DocumentChunk]):
        self.session_id = session_id
        self.extracted = extracted
        self.chunks = chunks
        self.retriever = LightweightRetriever(chunks)
        self.created_at = time.time()


class SessionManager:
    """In-memory cache for temporary document sessions to allow conversational Q&A without re-uploading."""

    def __init__(self):
        self._sessions: dict[str, DocumentSession] = {}

    def _cleanup_expired(self) -> None:
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if now - s.created_at > SESSION_TTL_SECONDS]
        for sid in expired:
            del self._sessions[sid]

    def create_session(self, content: bytes, filename: str) -> DocumentSession:
        self._cleanup_expired()
        extracted = extract_document(content, filename=filename, allow_ocr_fallback=True)
        chunks = chunk_pages(extracted.pages)
        session_id = str(uuid.uuid4())
        session = DocumentSession(session_id, extracted, chunks)
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[DocumentSession]:
        self._cleanup_expired()
        session = self._sessions.get(session_id)
        if session:
            session.created_at = time.time()  # Refresh TTL
        return session

    def remove_session(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


session_manager = SessionManager()


def _clean_json_output(raw: str) -> str:
    """Strip markdown codeblock wrappers if present."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


async def summarize_document(
    content: Optional[bytes] = None,
    filename: str = "document.pdf",
    session_id: Optional[str] = None,
    style: str = "concise",
    include_key_points: bool = True,
    include_topics: bool = True,
    include_action_items: bool = False,
) -> dict[str, Any]:
    """Generate a grounded, structured summary from uploaded PDF content or active session."""
    session = None
    if session_id:
        session = session_manager.get_session(session_id)

    if not session:
        if not content:
            raise ValidationError("Please provide a document or a valid session ID.")
        session = session_manager.create_session(content, filename)

    extracted = session.extracted
    total_words = extracted.total_words

    if total_words < 10:
        raise ProcessingError("This document has no readable text to summarize.")

    # Single pass vs hierarchical for large documents
    if total_words <= 5000:
        user_prompt = build_summary_user_prompt(
            extracted.full_text,
            style=style,
            include_key_points=include_key_points,
            include_topics=include_topics,
            include_action_items=include_action_items,
        )
        messages = [
            {"role": "system", "content": SYSTEM_SUMMARY_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
        raw_response = await AIClient.chat_completion(messages, temperature=0.2, json_mode=True)
    else:
        logger.info("Hierarchical summarization for %s words", total_words)
        # Summarize in batches of 3000 words
        batch_summaries: list[str] = []
        batch_words: list[str] = []
        words = extracted.full_text.split()
        for i in range(0, len(words), 3000):
            batch_slice = " ".join(words[i : i + 3000])
            batch_msg = [
                {"role": "system", "content": "You are a summarizing assistant. Extract key factual points from this document section."},
                {"role": "user", "content": f"Summarize section:\n{batch_slice}"},
            ]
            batch_res = await AIClient.chat_completion(batch_msg, temperature=0.2)
            batch_summaries.append(batch_res)

        combined_notes = "\n\n".join(batch_summaries)
        final_prompt = build_summary_user_prompt(
            combined_notes,
            style=style,
            include_key_points=include_key_points,
            include_topics=include_topics,
            include_action_items=include_action_items,
        )
        messages = [
            {"role": "system", "content": SYSTEM_SUMMARY_PROMPT},
            {"role": "user", "content": final_prompt},
        ]
        raw_response = await AIClient.chat_completion(messages, temperature=0.2, json_mode=True)

    cleaned = _clean_json_output(raw_response)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback to plain text summary if model didn't return valid JSON
        parsed = {
            "summary": cleaned,
            "key_points": [],
            "topics": [],
            "action_items": [],
        }

    return {
        "success": True,
        "summary": parsed.get("summary", ""),
        "key_points": parsed.get("key_points", []),
        "topics": parsed.get("topics", []),
        "action_items": parsed.get("action_items", []),
        "pages_processed": extracted.page_count,
        "ocr_used": extracted.ocr_used,
        "session_id": session.session_id,
        "notice": "Document processed temporarily and not stored permanently.",
    }


async def ask_document(
    question: str,
    content: Optional[bytes] = None,
    filename: str = "document.pdf",
    session_id: Optional[str] = None,
    history: Optional[list[dict[str, str]]] = None,
) -> dict[str, Any]:
    """Answer a user question strictly based on relevant document excerpts with citations."""
    session = None
    if session_id:
        session = session_manager.get_session(session_id)

    if not session:
        if not content:
            raise ValidationError("Please upload a document or provide an active session ID.")
        session = session_manager.create_session(content, filename)

    if not session.chunks:
        return {
            "success": True,
            "answer": "I couldn't find this information in the uploaded document. The document appears to contain no readable text.",
            "sources": [],
            "ocr_used": session.extracted.ocr_used,
            "session_id": session.session_id,
            "notice": "Document processed temporarily and not stored permanently.",
        }

    # Retrieve top relevant chunks
    scored_chunks = session.retriever.retrieve(question, top_k=5)
    excerpts = [
        {"page": sc.chunk.page, "text": sc.chunk.text}
        for sc in scored_chunks
    ]

    user_prompt = build_qa_user_prompt(question, excerpts)

    messages = [{"role": "system", "content": SYSTEM_QA_PROMPT}]

    # Append brief recent history if available (limit to last 4 turns)
    if history:
        for turn in history[-4:]:
            role = "user" if turn.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": turn.get("content", "")})

    messages.append({"role": "user", "content": user_prompt})

    raw_answer = await AIClient.chat_completion(messages, temperature=0.1)

    # Detect if answer is 'not found'
    not_found_pattern = re.compile(
        r"(couldn't find|cannot find|could not find|not found in the (uploaded|provided) document|does not contain|no information about)",
        re.IGNORECASE,
    )
    is_not_found = bool(not_found_pattern.search(raw_answer))

    sources = []
    if not is_not_found:
        seen_pages = set()
        for sc in scored_chunks:
            p = sc.chunk.page
            if p not in seen_pages:
                seen_pages.add(p)
                snippet = sc.chunk.text.strip()
                if len(snippet) > 220:
                    snippet = snippet[:220] + "…"
                sources.append({"page": p, "snippet": snippet})

    return {
        "success": True,
        "answer": raw_answer,
        "sources": sources,
        "ocr_used": session.extracted.ocr_used,
        "session_id": session.session_id,
        "notice": "Document processed temporarily and not stored permanently.",
    }
