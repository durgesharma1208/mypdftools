"""File conversion endpoints."""

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import enforce_file_count, file_response, read_upload
from app.services import image_service, office_service, pdf_to_word_service
from app.utils.validation import validate_file

router = APIRouter(tags=["conversion"])

PDF_ONLY = {"pdf"}


@router.post("/convert/jpg-to-pdf")
async def images_to_pdf(
    images: list[UploadFile] = File(...),
    page_size: str = Form("auto"),
    orientation: str = Form("auto"),
):
    enforce_file_count(images)
    uploaded = []
    for image in images:
        content = await read_upload(image)
        validate_file(image.filename or "", content, {"image"})
        uploaded.append((image.filename or "image.jpg", content))
    result = image_service.images_to_pdf(uploaded, page_size, orientation)
    return file_response(result)


@router.post("/convert/pdf-to-jpg")
async def pdf_to_images(
    pdf_file: UploadFile = File(...),
    dpi: int = Form(150),
    format: str = Form("jpg"),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = image_service.pdf_to_images(content, dpi, format, pdf_file.filename or "images.zip")
    return file_response(result)


@router.post("/convert/pdf-to-png")
async def pdf_to_png(
    pdf_file: UploadFile = File(...),
    dpi: int = Form(150),
):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = image_service.pdf_to_images(content, dpi, "png", pdf_file.filename or "images.zip")
    return file_response(result)


@router.post("/convert/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    content = await read_upload(file)
    validate_file(file.filename or "", content, {"word"})
    result = office_service.convert_to_pdf(content, file.filename or "document.docx", "word", "converted.pdf")
    return file_response(result)


@router.post("/convert/excel-to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    content = await read_upload(file)
    validate_file(file.filename or "", content, {"excel"})
    result = office_service.convert_to_pdf(content, file.filename or "spreadsheet.xlsx", "excel", "converted.pdf")
    return file_response(result)


@router.post("/convert/ppt-to-pdf")
async def ppt_to_pdf(file: UploadFile = File(...)):
    content = await read_upload(file)
    validate_file(file.filename or "", content, {"powerpoint"})
    result = office_service.convert_to_pdf(content, file.filename or "presentation.pptx", "powerpoint", "converted.pdf")
    return file_response(result)


@router.post("/convert/pdf-to-word")
async def pdf_to_word(pdf_file: UploadFile = File(...)):
    content = await read_upload(pdf_file)
    validate_file(pdf_file.filename or "", content, PDF_ONLY)
    result = pdf_to_word_service.pdf_to_word(content, "converted.docx")
    return file_response(result)