"""OCR service module."""

from app.services.ocr.service import (
    detect_text_layer,
    get_supported_languages,
    ocr_to_searchable_pdf,
    ocr_to_text,
    ocr_to_word,
)

__all__ = [
    "detect_text_layer",
    "get_supported_languages",
    "ocr_to_searchable_pdf",
    "ocr_to_text",
    "ocr_to_word",
]
