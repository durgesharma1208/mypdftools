"""Tests for OCR endpoints."""

import io
from fastapi.testclient import TestClient
import pymupdf as fitz
import pytest

from app.main import app

client = TestClient(app)


def _create_sample_pdf(text: str = "Invoice #12345\nTotal: $500.00") -> bytes:
    doc = fitz.open()
    page = doc.new_page(width=300, height=200)
    page.insert_text((50, 50), text, fontsize=14)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def _create_sample_image() -> bytes:
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (300, 150), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((30, 50), "Scanned Document Header", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_ocr_languages():
    response = client.get("/api/ocr/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    assert any(lang["code"] == "eng" for lang in data["languages"])
    assert any(lang["code"] == "hin" for lang in data["languages"])


def test_ocr_detect_text_layer():
    pdf_bytes = _create_sample_pdf("This document has lots of digital text content already.")
    files = {"pdf_file": ("sample.pdf", pdf_bytes, "application/pdf")}
    response = client.post("/api/ocr/detect", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["has_text_layer"] is True
    assert data["total_pages"] == 1


def test_ocr_to_searchable_pdf():
    pdf_bytes = _create_sample_pdf("Page with text to make searchable")
    files = {"file": ("scanned.pdf", pdf_bytes, "application/pdf")}
    data = {"language": "eng"}
    response = client.post("/api/ocr/pdf", files=files, data=data)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment" in response.headers["content-disposition"]
    # Verify the output PDF is openable and contains text
    out_doc = fitz.open(stream=response.content, filetype="pdf")
    assert len(out_doc) == 1
    assert "Page with text" in out_doc[0].get_text()
    out_doc.close()


def test_ocr_to_text():
    pdf_bytes = _create_sample_pdf("Invoice #98765 Total Due")
    files = {"file": ("invoice.pdf", pdf_bytes, "application/pdf")}
    data = {"language": "eng"}
    response = client.post("/api/ocr/text", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "Invoice" in res["text"]
    assert res["pages"] == 1


def test_ocr_to_word():
    pdf_bytes = _create_sample_pdf("Contract Agreement Paragraph")
    files = {"file": ("contract.pdf", pdf_bytes, "application/pdf")}
    data = {"language": "eng"}
    response = client.post("/api/ocr/word", files=files, data=data)
    assert response.status_code == 200
    assert "wordprocessingml.document" in response.headers["content-type"]
    assert len(response.content) > 100


def test_ocr_image_support():
    img_bytes = _create_sample_image()
    files = {"file": ("scanned_receipt.png", img_bytes, "image/png")}
    data = {"language": "eng"}
    response = client.post("/api/ocr/text", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["pages"] == 1
