"""Pydantic schemas for OCR endpoints."""

from pydantic import BaseModel, Field


class OcrLanguage(BaseModel):
    code: str = Field(..., description="ISO language code, e.g. 'eng', 'hin'")
    name: str = Field(..., description="Human-readable language name, e.g. 'English', 'Hindi'")


class OcrLanguagesResponse(BaseModel):
    languages: list[OcrLanguage]
    default: str = "eng"


class OcrDetectionResponse(BaseModel):
    has_text_layer: bool
    text_pages: int
    total_pages: int
    message: str


class OcrTextResponse(BaseModel):
    success: bool = True
    filename: str
    pages: int
    text: str
    language: str
    message: str = ""
