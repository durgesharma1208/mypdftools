"""OCR endpoints for searchable PDF, plain text, and Word document conversion."""

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import file_response, read_upload
from app.schemas.ocr import (
    OcrDetectionResponse,
    OcrLanguagesResponse,
    OcrTextResponse,
)
from app.services.ocr.service import (
    detect_text_layer,
    get_supported_languages,
    ocr_to_searchable_pdf,
    ocr_to_text,
    ocr_to_word,
)
from app.utils.validation import validate_file

router = APIRouter(prefix="/ocr", tags=["ocr"])

PDF_OR_IMAGE = {"pdf", "image"}
PDF_ONLY = {"pdf"}


@router.get("/languages", response_model=OcrLanguagesResponse)
async def get_ocr_languages():
    """Return available OCR languages."""
    languages = get_supported_languages()
    return OcrLanguagesResponse(languages=languages, default="eng")


@router.post("/detect", response_model=OcrDetectionResponse)
async def detect_document_text_layer(pdf_file: UploadFile = File(...)):
    """Inspect whether a PDF contains an existing text layer or is scanned/image-based."""
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "document.pdf", content, PDF_ONLY)
    result = detect_text_layer(content)
    return OcrDetectionResponse(**result)


@router.post("/pdf")
async def convert_to_searchable_pdf(
    file: UploadFile = File(...),
    language: str = Form("eng"),
):
    """Convert a scanned PDF or image into a searchable PDF with selectable text layer."""
    content = await read_upload(file)
    validate_file(file.filename or "document.pdf", content, PDF_OR_IMAGE)
    result = ocr_to_searchable_pdf(content, file.filename or "document.pdf", language=language)
    return file_response(result)


@router.post("/text", response_model=OcrTextResponse)
async def convert_to_text(
    file: UploadFile = File(...),
    language: str = Form("eng"),
):
    """Extract recognized text from a scanned PDF or image."""
    content = await read_upload(file)
    validate_file(file.filename or "document.pdf", content, PDF_OR_IMAGE)
    data = ocr_to_text(content, file.filename or "document.pdf", language=language)
    return OcrTextResponse(**data)


@router.post("/word")
async def convert_to_word(
    file: UploadFile = File(...),
    language: str = Form("eng"),
):
    """Convert a scanned PDF or image into an editable Word (.docx) document via OCR."""
    content = await read_upload(file)
    validate_file(file.filename or "document.pdf", content, PDF_OR_IMAGE)
    result = ocr_to_word(content, file.filename or "document.pdf", language=language)
    return file_response(result)
