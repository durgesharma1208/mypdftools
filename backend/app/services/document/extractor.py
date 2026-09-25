"""Reusable document text extraction with automatic scanned PDF detection and OCR fallback."""

import logging
from dataclasses import dataclass
from typing import Optional

import pymupdf as fitz

from app.core.config import settings
from app.core.errors import ProcessingError
from app.services.ocr.engine import extract_page_text_ocr
from app.services.pdf_base import open_pdf

logger = logging.getLogger("app.document.extractor")


@dataclass
class PageData:
    page: int
    text: str
    is_ocr: bool = False


@dataclass
class ExtractedDocument:
    filename: str
    page_count: int
    pages: list[PageData]
    is_scanned: bool
    ocr_used: bool

    @property
    def full_text(self) -> str:
        return "\n\n".join(
            f"[Page {p.page}]\n{p.text.strip()}" for p in self.pages if p.text.strip()
        )

    @property
    def total_words(self) -> int:
        return sum(len(p.text.split()) for p in self.pages)


def extract_document(
    content: bytes,
    filename: str = "document.pdf",
    allow_ocr_fallback: bool = True,
    language: str = "eng",
) -> ExtractedDocument:
    """Extract page-aware text from PDF. If the document is scanned, run OCR automatically."""
    doc = open_pdf(content)
    total_pages = doc.page_count
    if total_pages == 0:
        doc.close()
        raise ProcessingError("The uploaded document contains no pages.")

    max_pages = min(total_pages, settings.max_ai_document_pages)
    if total_pages > settings.max_ai_document_pages:
        logger.warning(
            "Document %s has %s pages; capping AI processing to first %s pages.",
            filename,
            total_pages,
            max_pages,
        )

    # First pass: try standard digital text extraction
    raw_pages: list[PageData] = []
    total_chars = 0
    non_empty_pages = 0

    for idx in range(max_pages):
        page = doc.load_page(idx)
        text = page.get_text("text").strip()
        raw_pages.append(PageData(page=idx + 1, text=text, is_ocr=False))
        if text:
            total_chars += len(text)
            non_empty_pages += 1

    # Detect if scanned: if average characters per page is very low
    avg_chars = total_chars / max(1, max_pages)
    is_scanned = avg_chars < 30 or (non_empty_pages / max_pages) < 0.2
    ocr_used = False

    if is_scanned and allow_ocr_fallback:
        logger.info(
            "Document %s appears to be scanned (avg chars: %.1f). Automatically running OCR.",
            filename,
            avg_chars,
        )
        ocr_pages: list[PageData] = []
        for idx in range(max_pages):
            page = doc.load_page(idx)
            # If the digital pass had substantial text, keep it; otherwise run OCR
            if len(raw_pages[idx].text) > 50:
                ocr_pages.append(raw_pages[idx])
            else:
                ocr_text = extract_page_text_ocr(page, language=language)
                ocr_pages.append(PageData(page=idx + 1, text=ocr_text, is_ocr=True))
        raw_pages = ocr_pages
        ocr_used = True

    doc.close()

    return ExtractedDocument(
        filename=filename,
        page_count=max_pages,
        pages=raw_pages,
        is_scanned=is_scanned,
        ocr_used=ocr_used,
    )
