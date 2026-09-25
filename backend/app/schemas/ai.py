"""Pydantic schemas for AI Document Intelligence endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class AiStatusResponse(BaseModel):
    configured: bool
    model: str
    provider: str
    message: str


class AiSource(BaseModel):
    page: int
    snippet: str


class AiSummaryRequest(BaseModel):
    style: str = Field("concise", description="'concise' or 'detailed'")
    include_key_points: bool = True
    include_topics: bool = True
    include_action_items: bool = False


class AiSummaryResponse(BaseModel):
    success: bool = True
    summary: str
    key_points: list[str] = Field(default_factory=list)
    topics: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    pages_processed: int
    ocr_used: bool
    notice: str = "Document processed temporarily and not stored permanently."


class ChatHistoryItem(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class AiAskRequest(BaseModel):
    question: str
    history: list[ChatHistoryItem] = Field(default_factory=list)


class AiAskResponse(BaseModel):
    success: bool = True
    answer: str
    sources: list[AiSource] = Field(default_factory=list)
    ocr_used: bool = False
    notice: str = "Document processed temporarily and not stored permanently."


class AiSessionResponse(BaseModel):
    session_id: str
    filename: str
    page_count: int
    ocr_used: bool
    preview_text: str
