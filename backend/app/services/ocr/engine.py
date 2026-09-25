"""Low-level OCR engine wrappers leveraging PyMuPDF and Tesseract tessdata."""

import logging
from pathlib import Path
from typing import Any

import pymupdf as fitz

from app.core.config import settings
from app.core.errors import ProcessingError

logger = logging.getLogger("app.ocr.engine")

# Central extensible registry of supported OCR languages
OCR_LANGUAGES: dict[str, str] = {
    "eng": "English",
    "hin": "Hindi",
}

DEFAULT_OCR_LANGUAGE = "eng"


def get_tessdata_path() -> str:
    """Return the absolute path to the directory containing Tesseract traineddata."""
    tess_path = settings.tessdata_directory
    if not tess_path.exists():
        raise ProcessingError(f"OCR data directory '{tess_path}' not found.")
    return str(tess_path.resolve())


def get_available_languages() -> dict[str, str]:
    """Return dictionary of language code -> human readable name based on installed traineddata."""
    tess_dir = settings.tessdata_directory
    available: dict[str, str] = {}
    for code, name in OCR_LANGUAGES.items():
        if (tess_dir / f"{code}.traineddata").exists():
            available[code] = name
    if not available:
        # Fallback to configured defaults
        return OCR_LANGUAGES
    return available


def normalize_language(language: str | None) -> str:
    """Validate and normalize language code; fallback to DEFAULT_OCR_LANGUAGE if unavailable."""
    if not language:
        return DEFAULT_OCR_LANGUAGE
    code = language.strip().lower()
    available = get_available_languages()
    if code in available:
        return code
    # Try prefix match (e.g. 'en' -> 'eng')
    for avail_code in available:
        if avail_code.startswith(code):
            return avail_code
    return DEFAULT_OCR_LANGUAGE


def ocr_page_to_searchable_pdf_bytes(page: fitz.Page, language: str = "eng", dpi: int = 150) -> bytes:
    """Render a PDF page to pixmap and return a 1-page searchable PDF with OCR text layer."""
    tess_path = get_tessdata_path()
    lang = normalize_language(language)
    try:
        pix = page.get_pixmap(dpi=dpi)
        if pix.alpha:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        return pix.pdfocr_tobytes(tessdata=tess_path, language=lang)
    except Exception as exc:
        logger.warning("Failed to OCR page %s with dpi %s: %s", page.number, dpi, exc)
        # Fallback with standard DPI or textpage OCR
        try:
            pix = page.get_pixmap(dpi=100)
            return pix.pdfocr_tobytes(tessdata=tess_path, language=lang)
        except Exception as retry_exc:
            raise ProcessingError(f"Could not perform OCR on page {page.number + 1}: {retry_exc}") from exc


def ocr_image_to_searchable_pdf_bytes(image_bytes: bytes, language: str = "eng") -> bytes:
    """Convert an image (JPG/PNG) into a 1-page searchable PDF with OCR text layer."""
    tess_path = get_tessdata_path()
    lang = normalize_language(language)
    try:
        pix = fitz.Pixmap(image_bytes)
        if pix.alpha or pix.colorspace.n != 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        return pix.pdfocr_tobytes(tessdata=tess_path, language=lang)
    except Exception as exc:
        raise ProcessingError(f"Could not perform OCR on image: {exc}") from exc


def extract_page_text_ocr(page: fitz.Page, language: str = "eng") -> str:
    """Extract recognized text from a PDF page using OCR."""
    tess_path = get_tessdata_path()
    lang = normalize_language(language)
    try:
        # First try direct textpage OCR
        tp = page.get_textpage_ocr(tessdata=tess_path, language=lang)
        text = page.get_text("text", textpage=tp).strip()
        if text:
            return text
    except Exception as exc:
        logger.debug("Page get_textpage_ocr returned error, trying pixmap fallback: %s", exc)

    # Fallback via pixmap OCR
    try:
        pdf_bytes = ocr_page_to_searchable_pdf_bytes(page, language=lang, dpi=150)
        with fitz.open("pdf", pdf_bytes) as ocr_doc:
            return ocr_doc[0].get_text("text").strip()
    except Exception as exc:
        logger.warning("OCR text extraction fallback failed: %s", exc)
        return ""


def extract_page_blocks_ocr(page: fitz.Page, language: str = "eng") -> list[dict[str, Any]]:
    """Extract recognized text blocks from a PDF page for structured Word reconstruction."""
    tess_path = get_tessdata_path()
    lang = normalize_language(language)
    try:
        tp = page.get_textpage_ocr(tessdata=tess_path, language=lang)
        raw_blocks = page.get_text("blocks", textpage=tp)
    except Exception:
        # Fallback to pixmap OCR document
        pdf_bytes = ocr_page_to_searchable_pdf_bytes(page, language=lang, dpi=150)
        with fitz.open("pdf", pdf_bytes) as ocr_doc:
            raw_blocks = ocr_doc[0].get_text("blocks")

    blocks = []
    for block in raw_blocks:
        # fitz block format: (x0, y0, x1, y1, text, block_no, block_type)
        if len(block) >= 5:
            text = block[4].strip()
            if text:
                blocks.append({
                    "bbox": (block[0], block[1], block[2], block[3]),
                    "text": text,
                    "height": block[3] - block[1],
                })
    return blocks
