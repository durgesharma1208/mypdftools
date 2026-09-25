"""High-level OCR operations for PDF and image documents."""

import logging
from pathlib import Path
from typing import Any

from docx import Document as WordDocument
import pymupdf as fitz

from app.core.errors import ProcessingError
from app.services.ocr.engine import (
    DEFAULT_OCR_LANGUAGE,
    extract_page_blocks_ocr,
    extract_page_text_ocr,
    get_available_languages,
    normalize_language,
    ocr_image_to_searchable_pdf_bytes,
    ocr_page_to_searchable_pdf_bytes,
)
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

logger = logging.getLogger("app.ocr.service")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif"}


def is_image_file(filename: str, content: bytes) -> bool:
    ext = Path(filename).suffix.lower()
    if ext in IMAGE_EXTENSIONS:
        return True
    # Magic bytes check for JPEG, PNG, BMP, WebP
    if content.startswith(b"\xff\xd8\xff") or content.startswith(b"\x89PNG\r\n\x1a\n") or content.startswith(b"BM"):
        return True
    return False


def get_supported_languages() -> list[dict[str, str]]:
    """Return available OCR languages formatted for API consumption."""
    langs = get_available_languages()
    return [{"code": code, "name": name} for code, name in sorted(langs.items())]


def detect_text_layer(content: bytes) -> dict[str, Any]:
    """Inspect whether a PDF contains an existing usable digital text layer."""
    try:
        doc = open_pdf(content)
    except Exception as exc:
        raise ProcessingError(f"Could not inspect document: {exc}") from exc

    page_count = doc.page_count
    text_pages = 0
    total_characters = 0

    scan_pages = min(page_count, 50)
    for index in range(scan_pages):
        page = doc.load_page(index)
        text = page.get_text("text").strip()
        if len(text) > 20:
            text_pages += 1
            total_characters += len(text)

    doc.close()

    has_text = text_pages > 0 and (total_characters / max(1, scan_pages)) > 40
    message = (
        "This PDF already contains selectable text. OCR may not be necessary."
        if has_text
        else "This PDF appears to be scanned or image-based. OCR is recommended."
    )

    return {
        "has_text_layer": has_text,
        "text_pages": text_pages,
        "total_pages": page_count,
        "message": message,
    }


def ocr_to_searchable_pdf(content: bytes, filename: str, language: str = DEFAULT_OCR_LANGUAGE) -> ProcessingResult:
    """Generate a searchable PDF with selectable text layer, preserving original visual appearance."""
    lang = normalize_language(language)
    stem = Path(filename).stem or "document"
    output_name = f"{stem}_searchable.pdf"

    with temp_workspace() as workspace:
        out_path = workspace / output_name

        if is_image_file(filename, content):
            logger.info("Processing single image OCR to PDF: %s", filename)
            pdf_bytes = ocr_image_to_searchable_pdf_bytes(content, language=lang)
            out_path.write_bytes(pdf_bytes)
            data = pdf_bytes
            page_count = 1
        else:
            doc = open_pdf(content)
            page_count = doc.page_count
            if page_count == 0:
                doc.close()
                raise ProcessingError("The uploaded PDF has no pages.")

            out_doc = fitz.open()
            for index, page in enumerate(doc):
                logger.info("OCR to PDF processing page %s of %s", index + 1, page_count)
                page_pdf_bytes = ocr_page_to_searchable_pdf_bytes(page, language=lang, dpi=150)
                with fitz.open("pdf", page_pdf_bytes) as single_doc:
                    out_doc.insert_pdf(single_doc)

            doc.close()
            save_document(out_doc, out_path, garbage=3, deflate=True)
            data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message=f"Created searchable PDF with OCR text layer across {page_count} page{'s' if page_count != 1 else ''}.",
    )


def ocr_to_text(content: bytes, filename: str, language: str = DEFAULT_OCR_LANGUAGE) -> dict[str, Any]:
    """Recognize text from PDF or image and return clean structured text with page boundaries."""
    lang = normalize_language(language)

    if is_image_file(filename, content):
        pdf_bytes = ocr_image_to_searchable_pdf_bytes(content, language=lang)
        with fitz.open("pdf", pdf_bytes) as doc:
            text = doc[0].get_text("text").strip()
        return {
            "success": True,
            "filename": filename,
            "pages": 1,
            "text": text,
            "language": lang,
            "message": "Extracted text from image via OCR.",
        }

    doc = open_pdf(content)
    page_count = doc.page_count
    if page_count == 0:
        doc.close()
        raise ProcessingError("The uploaded PDF has no pages.")

    pages_text: list[str] = []
    for index, page in enumerate(doc):
        extracted = extract_page_text_ocr(page, language=lang)
        pages_text.append(extracted)

    doc.close()

    if page_count == 1:
        full_text = pages_text[0]
    else:
        sections = []
        for idx, page_t in enumerate(pages_text, 1):
            sections.append(f"--- Page {idx} ---\n\n{page_t.strip()}\n")
        full_text = "\n".join(sections).strip()

    return {
        "success": True,
        "filename": filename,
        "pages": page_count,
        "text": full_text,
        "language": lang,
        "message": f"Extracted text from {page_count} page{'s' if page_count != 1 else ''} via OCR.",
    }


def ocr_to_word(content: bytes, filename: str, language: str = DEFAULT_OCR_LANGUAGE) -> ProcessingResult:
    """Run OCR and generate an editable Word (.docx) document preserving paragraphs and structure."""
    lang = normalize_language(language)
    stem = Path(filename).stem or "document"
    output_name = f"{stem}_ocr.docx"

    word_doc = WordDocument()

    if is_image_file(filename, content):
        pdf_bytes = ocr_image_to_searchable_pdf_bytes(content, language=lang)
        with fitz.open("pdf", pdf_bytes) as doc:
            page = doc[0]
            blocks = extract_page_blocks_ocr(page, language=lang)
            if not blocks:
                text = page.get_text("text").strip()
                if text:
                    for line in text.split("\n\n"):
                        word_doc.add_paragraph(line.strip())
            else:
                for block in blocks:
                    word_doc.add_paragraph(block["text"])
        page_count = 1
    else:
        doc = open_pdf(content)
        page_count = doc.page_count
        if page_count == 0:
            doc.close()
            raise ProcessingError("The uploaded PDF has no pages.")

        for index, page in enumerate(doc):
            if index > 0:
                word_doc.add_page_break()

            blocks = extract_page_blocks_ocr(page, language=lang)
            if not blocks:
                raw_text = extract_page_text_ocr(page, language=lang)
                for paragraph in [p.strip() for p in raw_text.split("\n\n") if p.strip()]:
                    word_doc.add_paragraph(paragraph)
            else:
                for block in blocks:
                    text = block["text"]
                    # If single short line, format as sub-heading or clean paragraph
                    if len(text) < 60 and "\n" not in text and block["height"] > 16:
                        p = word_doc.add_paragraph()
                        run = p.add_run(text)
                        run.bold = True
                    else:
                        word_doc.add_paragraph(text)

        doc.close()

    with temp_workspace() as workspace:
        out_path = workspace / output_name
        word_doc.save(str(out_path))
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        message=f"Converted {page_count} page{'s' if page_count != 1 else ''} to Word via OCR.",
    )
