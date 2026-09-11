"""PDF manipulation endpoints."""

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import enforce_file_count, file_response, read_upload
from app.core.config import settings
from app.schemas.responses import PdfInfoResponse
from app.services import (
    compress_service,
    delete_service,
    extract_service,
    info_service,
    merge_service,
    organize_service,
    page_number_service,
    protection_service,
    rotate_service,
    split_service,
    watermark_service,
)
from app.utils.validation import validate_file

router = APIRouter(tags=["pdf"])

PDF_ONLY = {"pdf"}


@router.post("/pdf/merge")
async def merge(pdfs: list[UploadFile] = File(...)):
    enforce_file_count(pdfs)
    files = []
    for upload in pdfs:
        content = await read_upload(upload)
        validate_file(upload.filename or "", content, PDF_ONLY)
        files.append((upload.filename or "file.pdf", content))
    result = merge_service.merge_pdfs(files)
    return file_response(result)


@router.post("/pdf/split")
async def split(
    pdf_file: UploadFile = File(...),
    mode: str = Form("page"),
    page: int | None = Form(None),
    ranges: str = Form(""),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = split_service.split_pdf(content, mode, page, ranges, pdf_file.filename or "split.pdf")
    return file_response(result)


@router.post("/pdf/rotate")
async def rotate(
    pdf_file: UploadFile = File(...),
    angle: int = Form(90),
    pages: str = Form(""),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = rotate_service.rotate_pdf(content, angle, pages, pdf_file.filename or "rotated.pdf")
    return file_response(result)


@router.post("/pdf/extract")
async def extract(
    pdf_file: UploadFile = File(...),
    pages: str = Form(...),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = extract_service.extract_pages(content, pages, pdf_file.filename or "extracted.pdf")
    return file_response(result)


@router.post("/pdf/delete-pages")
async def delete_pages(
    pdf_file: UploadFile = File(...),
    pages: str = Form(...),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = delete_service.delete_pages(content, pages, pdf_file.filename or "deleted.pdf")
    return file_response(result)


@router.post("/pdf/organize")
async def organize(
    pdf_file: UploadFile = File(...),
    order: str = Form(...),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = organize_service.organize_pdf(content, order, pdf_file.filename or "organized.pdf")
    return file_response(result)


@router.post("/pdf/watermark")
async def text_watermark(
    pdf_file: UploadFile = File(...),
    text: str = Form(...),
    font_size: float = Form(48),
    opacity: float = Form(0.25),
    color: str = Form("#9ca3af"),
    position: str = Form("diagonal"),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = watermark_service.text_watermark(
        content, text, font_size, opacity, color, position, pdf_file.filename or "watermarked.pdf"
    )
    return file_response(result)


@router.post("/pdf/image-watermark")
async def image_watermark(
    pdf_file: UploadFile = File(...),
    logo: UploadFile = File(...),
    size: float = Form(120),
    opacity: float = Form(0.8),
    position: str = Form("bottom-right"),
):
    pdf_content = await read_upload(pdf_file)
    logo_content = await read_upload(logo)
    validate_file(pdf_file.filename or "", pdf_content, PDF_ONLY)
    validate_file(logo.filename or "", logo_content, {"image"})
    result = watermark_service.image_watermark(
        pdf_content, logo_content, size, opacity, position, pdf_file.filename or "watermarked.pdf"
    )
    return file_response(result)


@router.post("/pdf/page-numbers")
async def add_page_numbers(
    pdf_file: UploadFile = File(...),
    start: int = Form(1),
    font_size: float = Form(14),
    position: str = Form("bottom-center"),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = page_number_service.page_numbers(content, start, font_size, position, pdf_file.filename or "numbered.pdf")
    return file_response(result)


@router.post("/pdf/compress")
async def compress(
    pdf_file: UploadFile = File(...),
    level: str = Form("medium"),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = compress_service.compress_pdf(content, level, pdf_file.filename or "compressed.pdf")
    return file_response(result)


@router.post("/pdf/protect")
async def protect(
    pdf_file: UploadFile = File(...),
    user_password: str = Form(...),
    owner_password: str | None = Form(None),
    allow_print: bool = Form(True),
    allow_copy: bool = Form(True),
    allow_modify: bool = Form(False),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = protection_service.protect_pdf(
        content, user_password, owner_password, allow_print, allow_copy, allow_modify,
        pdf_file.filename or "protected.pdf",
    )
    return file_response(result)


@router.post("/pdf/unlock")
async def unlock(
    pdf_file: UploadFile = File(...),
    password: str | None = Form(None),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = protection_service.unlock_pdf(content, password, pdf_file.filename or "unlocked.pdf")
    return file_response(result)


@router.post("/pdf/info", response_model=PdfInfoResponse)
async def pdf_info(pdf_file: UploadFile = File(...)):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    return info_service.get_pdf_info(content)


@router.post("/pdf/metadata")
async def edit_metadata(
    pdf_file: UploadFile = File(...),
    title: str | None = Form(None),
    author: str | None = Form(None),
    subject: str | None = Form(None),
    keywords: str | None = Form(None),
    creator: str | None = Form(None),
    producer: str | None = Form(None),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = info_service.edit_metadata(
        content, title, author, subject, keywords, creator, producer,
        pdf_file.filename or "metadata.pdf",
    )
    return file_response(result)