import io

import pymupdf as fitz
import pytest
from docx import Document as WordDocument
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


def build_pdf(pages: int = 3, title: str = "Test PDF") -> bytes:
    document = fitz.open()
    for index in range(pages):
        page = document.new_page(width=300, height=400)
        page.insert_text((40, 80 + index * 40), f"Page {index + 1}", fontsize=14, fontname="helv")
    document.set_metadata({"title": title, "author": "pytest"})
    buffer = io.BytesIO()
    document.save(buffer, garbage=3, deflate=True)
    document.close()
    return buffer.getvalue()


@pytest.fixture(scope="session")
def pdf_bytes() -> bytes:
    return build_pdf(3, "First PDF")


@pytest.fixture(scope="session")
def second_pdf_bytes() -> bytes:
    return build_pdf(2, "Second PDF")


@pytest.fixture(scope="session")
def image_png_bytes() -> bytes:
    image = Image.new("RGB", (200, 150), (220, 40, 40))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture(scope="session")
def image_jpg_bytes() -> bytes:
    image = Image.new("RGB", (120, 90), (40, 120, 220))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    return buffer.getvalue()


@pytest.fixture(scope="session")
def protected_pdf_bytes(pdf_bytes) -> bytes:
    document = fitz.open(stream=pdf_bytes, filetype="pdf")
    buffer = io.BytesIO()
    document.save(
        buffer,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw="secret123",
        owner_pw="secret123",
    )
    document.close()
    return buffer.getvalue()


@pytest.fixture(scope="session")
def docx_bytes() -> bytes:
    document = WordDocument()
    document.add_paragraph("Hello from a Word document")
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


def pdf_page_count(data: bytes) -> int:
    document = fitz.open(stream=data, filetype="pdf")
    count = document.page_count
    document.close()
    return count


def first_page_text(data: bytes) -> str:
    document = fitz.open(stream=data, filetype="pdf")
    text = document.load_page(0).get_text("text")
    document.close()
    return text