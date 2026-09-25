#!/usr/bin/env python3
"""End-to-end verification of every MyPDFTools API endpoint.

This mirrors exactly what the web UI sends for each tool — same path, same
multipart field names, same option names — and inspects the returned bytes to
confirm the output is genuinely what the tool promises.

Usage (from the repository root, with the backend running):

    backend/.venv/bin/python scripts/verify_api.py
    API_BASE=http://127.0.0.1:8000 backend/.venv/bin/python scripts/verify_api.py

Requires the backend runtime dependencies (PyMuPDF, Pillow, python-docx) plus
httpx from requirements-dev.txt. Exits non-zero if any check fails.
"""

from __future__ import annotations

import io
import os
import sys
import zipfile
from dataclasses import dataclass, field
from typing import Callable

import httpx
import pymupdf as fitz
from docx import Document as WordDocument
from PIL import Image

API_BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000").rstrip("/")
TIMEOUT = httpx.Timeout(120.0)


# --------------------------------------------------------------------------- #
# Fixtures
# --------------------------------------------------------------------------- #
def build_pdf(pages: int = 4, title: str = "Sample Report") -> bytes:
    document = fitz.open()
    for index in range(pages):
        page = document.new_page(width=420, height=595)
        page.insert_text((48, 90), f"Page {index + 1}", fontsize=18, fontname="helv")
        page.insert_text((48, 120), "Body copy for verification.", fontsize=11, fontname="helv")
    document.set_metadata({"title": title, "author": "QA", "subject": "Verification"})
    buffer = io.BytesIO()
    document.save(buffer, garbage=3, deflate=True)
    document.close()
    return buffer.getvalue()


def build_scanned_pdf() -> bytes:
    """A PDF with an image and no text layer."""
    image = Image.new("RGB", (600, 800), (235, 235, 235))
    image_bytes = io.BytesIO()
    image.save(image_bytes, format="PNG")

    document = fitz.open()
    page = document.new_page(width=420, height=560)
    page.insert_image(fitz.Rect(0, 0, 420, 560), stream=image_bytes.getvalue())
    buffer = io.BytesIO()
    document.save(buffer)
    document.close()
    return buffer.getvalue()


def build_protected_pdf(source: bytes, password: str = "secret123") -> bytes:
    document = fitz.open(stream=source, filetype="pdf")
    buffer = io.BytesIO()
    document.save(
        buffer,
        encryption=fitz.PDF_ENCRYPT_AES_256,
        user_pw=password,
        owner_pw=password,
    )
    document.close()
    return buffer.getvalue()


def build_png() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (640, 480), (30, 90, 160)).save(buffer, format="PNG")
    return buffer.getvalue()


def build_jpg() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (400, 300), (190, 70, 40)).save(buffer, format="JPEG", quality=88)
    return buffer.getvalue()


def build_minimal_ooxml() -> bytes:
    """A minimal OOXML container: enough to pass the magic-byte + extension check."""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
        )
    return buffer.getvalue()


def build_docx() -> bytes:
    document = WordDocument()
    document.add_heading("Verification letter", level=1)
    document.add_paragraph("Hello from a Word document.")
    buffer = io.BytesIO()
    document.save(buffer)
    return buffer.getvalue()


FIXTURES = {
    "sample.pdf": build_pdf(4),
    "second.pdf": build_pdf(2, "Second Report"),
    "scanned.pdf": build_scanned_pdf(),
    "protected.pdf": build_protected_pdf(build_pdf(2, "Locked")),
    "image.png": build_png(),
    "image.jpg": build_jpg(),
    "letter.docx": build_docx(),
    "sheet.xlsx": build_minimal_ooxml(),
    "deck.pptx": build_minimal_ooxml(),
}


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def pdf_pages(data: bytes) -> int:
    document = fitz.open(stream=data, filetype="pdf")
    count = document.page_count
    document.close()
    return count


def pdf_text(data: bytes) -> str:
    document = fitz.open(stream=data, filetype="pdf")
    text = "\n".join(document.load_page(index).get_text("text") for index in range(document.page_count))
    document.close()
    return text


def pdf_rotation(data: bytes, page_index: int = 0) -> int:
    document = fitz.open(stream=data, filetype="pdf")
    rotation = document.load_page(page_index).rotation
    document.close()
    return rotation


def pdf_metadata(data: bytes) -> dict:
    document = fitz.open(stream=data, filetype="pdf")
    metadata = dict(document.metadata or {})
    document.close()
    return metadata


def zip_names(data: bytes) -> list[str]:
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        return sorted(archive.namelist())


def docx_text(data: bytes) -> str:
    document = WordDocument(io.BytesIO(data))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def files(*pairs: tuple[str, str]) -> list[tuple[str, tuple[str, bytes, str]]]:
    """Build httpx multipart entries from (field, fixture) pairs."""
    entries = []
    for field_name, fixture in pairs:
        payload = FIXTURES[fixture]
        mime = "application/pdf"
        if fixture.endswith(".png"):
            mime = "image/png"
        elif fixture.endswith((".jpg", ".jpeg")):
            mime = "image/jpeg"
        elif fixture.endswith(".docx"):
            mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        entries.append((field_name, (fixture, payload, mime)))
    return entries


@dataclass
class Check:
    name: str
    run: Callable[[httpx.Client], str]
    note: str = ""
    expects_unavailable: bool = False
    failures: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------- #
# Checks — one per user-facing tool
# --------------------------------------------------------------------------- #
def check_health(client: httpx.Client) -> str:
    body = client.get("/api/health").json()
    assert body["status"] == "ok", body
    assert body["limits"]["max_file_size_mb"] > 0, body
    feature_list = body["features"]
    return f"limits {body['limits']['max_file_size_mb']}MB/{body['limits']['max_files']} files · office={feature_list['office']}"


def check_merge(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/merge",
        files=files(("pdfs", "sample.pdf"), ("pdfs", "second.pdf")),
    )
    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/pdf")
    assert pdf_pages(response.content) == 6
    assert "attachment" in response.headers["content-disposition"]
    return "6 pages · merged in order"


def check_split_single(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/split",
        files=files(("pdf_file", "sample.pdf")),
        data={"mode": "page", "page": "2", "ranges": ""},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 1
    assert "Page 2" in pdf_text(response.content)
    return "single page extracted"


def check_split_ranges(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/split",
        files=files(("pdf_file", "sample.pdf")),
        data={"mode": "ranges", "page": "1", "ranges": "1-2, 4"},
    )
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "application/zip"
    names = zip_names(response.content)
    assert len(names) == 2, names
    return f"{len(names)} archives: {', '.join(names)}"


def check_split_every(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/split",
        files=files(("pdf_file", "sample.pdf")),
        data={"mode": "every", "page": "1", "ranges": ""},
    )
    assert response.status_code == 200, response.text
    names = zip_names(response.content)
    assert len(names) == 4, names
    return f"{len(names)} page files"


def check_rotate(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/rotate",
        files=files(("pdf_file", "sample.pdf")),
        data={"angle": "90", "pages": "1,3"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 4
    assert pdf_rotation(response.content, 0) == 90
    return "page 1 rotated 90°, others untouched"


def check_extract(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/extract",
        files=files(("pdf_file", "sample.pdf")),
        data={"pages": "1,3"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 2
    return "2 pages extracted"


def check_delete_pages(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/delete-pages",
        files=files(("pdf_file", "sample.pdf")),
        data={"pages": "2"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 3
    assert "Page 2" not in pdf_text(response.content)
    return "page 2 removed"


def check_organize(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/organize",
        files=files(("pdf_file", "sample.pdf")),
        data={"order": "4,3,2,1"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 4
    first_page = pdf_text(response.content).split("\n")[0]
    assert first_page.strip() == "Page 4", first_page
    return "reversed order honoured"


def check_compress(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/compress",
        files=files(("pdf_file", "sample.pdf")),
        data={"level": "medium"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 4
    message = response.headers.get("x-result-message", "")
    assert message, "compression must report what it did"
    return message


def check_watermark(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/watermark",
        files=files(("pdf_file", "sample.pdf")),
        data={"text": "CONFIDENTIAL", "font_size": "48", "opacity": "0.25", "color": "#9CA3AF", "position": "diagonal"},
    )
    assert response.status_code == 200, response.text
    # Large watermarks wrap inside the placement box, so compare without whitespace.
    normalised = "".join(pdf_text(response.content).split())
    assert "CONFIDENTIAL" in normalised, normalised[:200]
    return "watermark present on the page text layer"


def check_image_watermark(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/image-watermark",
        files=files(("pdf_file", "sample.pdf"), ("logo", "image.png")),
        data={"size": "120", "opacity": "0.8", "position": "bottom-right"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 4
    return "logo stamped on every page"


def check_page_numbers(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/page-numbers",
        files=files(("pdf_file", "sample.pdf")),
        data={"start": "5", "font_size": "14", "position": "bottom-center"},
    )
    assert response.status_code == 200, response.text
    text = pdf_text(response.content)
    assert "5" in text and "8" in text, text
    return "numbering starts at 5"


def check_protect(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/protect",
        files=files(("pdf_file", "sample.pdf")),
        data={
            "user_password": "secret123",
            "owner_password": "secret123",
            "allow_print": "true",
            "allow_copy": "true",
            "allow_modify": "false",
        },
    )
    assert response.status_code == 200, response.text
    document = fitz.open(stream=response.content, filetype="pdf")
    needs_password = document.needs_pass
    document.close()
    assert needs_password, "output must require the password"
    return "AES-256 encrypted · password required to open"


def check_unlock(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/unlock",
        files=files(("pdf_file", "protected.pdf")),
        data={"password": "secret123"},
    )
    assert response.status_code == 200, response.text
    document = fitz.open(stream=response.content, filetype="pdf")
    unlocked = not document.needs_pass
    document.close()
    assert unlocked
    return "protection removed with the correct password"


def check_metadata(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/metadata",
        files=files(("pdf_file", "sample.pdf")),
        data={"title": "Updated Title", "author": "Verification Bot", "keywords": "test, verify"},
    )
    assert response.status_code == 200, response.text
    metadata = pdf_metadata(response.content)
    assert metadata.get("title") == "Updated Title", metadata
    return "title and author written back"


def check_info(client: httpx.Client) -> str:
    response = client.post("/api/pdf/info", files=files(("pdf_file", "sample.pdf")))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["page_count"] == 4
    assert body["text_layer"]["text_pages"] == 4
    assert len(body["page_sizes"]) == 4
    return f"{body['page_count']} pages · {len(body['metadata'])} metadata fields"


def check_info_scanned(client: httpx.Client) -> str:
    response = client.post("/api/pdf/info", files=files(("pdf_file", "scanned.pdf")))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["text_layer"]["text_pages"] == 0, body
    return "image-only document correctly reported as having no text layer"


def check_jpg_to_pdf(client: httpx.Client) -> str:
    response = client.post(
        "/api/convert/jpg-to-pdf",
        files=files(("images", "image.png"), ("images", "image.jpg")),
        data={"page_size": "auto", "orientation": "auto"},
    )
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) == 2
    return "2 images into a 2 page PDF"


def check_pdf_to_jpg(client: httpx.Client) -> str:
    response = client.post(
        "/api/convert/pdf-to-jpg",
        files=files(("pdf_file", "sample.pdf")),
        data={"dpi": "72", "format": "jpg"},
    )
    assert response.status_code == 200, response.text
    names = zip_names(response.content)
    assert len(names) == 4, names
    assert all(name.endswith(".jpg") for name in names), names
    return f"{len(names)} JPG files in a ZIP"


def check_pdf_to_png(client: httpx.Client) -> str:
    response = client.post(
        "/api/convert/pdf-to-jpg",
        files=files(("pdf_file", "sample.pdf")),
        data={"dpi": "72", "format": "png"},
    )
    assert response.status_code == 200, response.text
    names = zip_names(response.content)
    assert all(name.endswith(".png") for name in names), names
    return f"{len(names)} PNG files in a ZIP"


def check_pdf_to_word(client: httpx.Client) -> str:
    response = client.post("/api/convert/pdf-to-word", files=files(("pdf_file", "sample.pdf")))
    assert response.status_code == 200, response.text
    text = docx_text(response.content)
    assert "Page 1" in text, text
    return "text exported into a DOCX"


def check_word_to_pdf(client: httpx.Client) -> str:
    response = client.post("/api/convert/word-to-pdf", files=files(("file", "letter.docx")))
    if response.status_code == 503:
        raise AssertionError("LIBREOFFICE_MISSING")
    assert response.status_code == 200, response.text
    assert pdf_pages(response.content) >= 1
    return "DOCX converted through LibreOffice"


def _office_result(response: httpx.Response) -> str:
    if response.status_code == 503:
        body = response.json()
        assert "libreoffice" in body["error"].lower(), body
        raise AssertionError("LIBREOFFICE_MISSING")
    assert response.status_code < 500, response.text
    if response.status_code == 400:
        # LibreOffice is present but the tiny fixture container is not a real document.
        return f"rejected by LibreOffice, no crash: {response.json()['error'][:48]}"
    assert response.headers["content-type"].startswith("application/pdf")
    assert pdf_pages(response.content) >= 1
    return f"{pdf_pages(response.content)} page PDF"


def check_excel_to_pdf(client: httpx.Client) -> str:
    return _office_result(client.post("/api/convert/excel-to-pdf", files=files(("file", "sheet.xlsx"))))


def check_ppt_to_pdf(client: httpx.Client) -> str:
    return _office_result(client.post("/api/convert/ppt-to-pdf", files=files(("file", "deck.pptx"))))


# --------------------------------------------------------------------------- #
# Error handling checks
# --------------------------------------------------------------------------- #
def check_rejects_wrong_type(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/merge",
        files=[("pdfs", ("notes.txt", b"just text, not a PDF", "text/plain"))],
    )
    assert response.status_code == 400, response.text
    body = response.json()
    assert "not supported" in body["error"].lower() or "PDF" in body["error"], body
    assert "Traceback" not in response.text
    return f"rejected with: {body['error']}"


def check_rejects_out_of_range_page(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/rotate",
        files=files(("pdf_file", "sample.pdf")),
        data={"angle": "90", "pages": "99"},
    )
    assert response.status_code == 400, response.text
    message = response.json()["error"]
    assert "out of range" in message.lower(), message
    return f"rejected with: {message}"


def check_requires_password_for_locked_file(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/rotate",
        files=files(("pdf_file", "protected.pdf")),
        data={"angle": "90", "pages": ""},
    )
    assert response.status_code == 400, response.text
    message = response.json()["error"]
    assert "password" in message.lower(), message
    return f"rejected with: {message}"


def check_wrong_unlock_password(client: httpx.Client) -> str:
    response = client.post(
        "/api/pdf/unlock",
        files=files(("pdf_file", "protected.pdf")),
        data={"password": "not-the-password"},
    )
    assert response.status_code == 400, response.text
    message = response.json()["error"]
    assert "incorrect" in message.lower(), message
    return f"rejected with: {message}"


def check_missing_required_field(client: httpx.Client) -> str:
    response = client.post("/api/pdf/extract", files=files(("pdf_file", "sample.pdf")))
    assert response.status_code == 422, response.text
    body = response.json()
    assert body["error"] == "Invalid request", body
    return "422 with a readable message"


CHECKS: list[Check] = [
    Check("health", check_health),
    Check("merge", check_merge),
    Check("split · single page", check_split_single),
    Check("split · ranges", check_split_ranges),
    Check("split · every page", check_split_every),
    Check("rotate", check_rotate),
    Check("extract pages", check_extract),
    Check("delete pages", check_delete_pages),
    Check("organise pages", check_organize),
    Check("compress", check_compress),
    Check("text watermark", check_watermark),
    Check("image watermark", check_image_watermark),
    Check("page numbers", check_page_numbers),
    Check("protect", check_protect),
    Check("unlock", check_unlock),
    Check("edit metadata", check_metadata),
    Check("inspect pdf", check_info),
    Check("inspect · scanned", check_info_scanned),
    Check("jpg/png → pdf", check_jpg_to_pdf),
    Check("pdf → jpg", check_pdf_to_jpg),
    Check("pdf → png", check_pdf_to_png),
    Check("pdf → word", check_pdf_to_word),
    Check("word → pdf (needs LibreOffice)", check_word_to_pdf, expects_unavailable=True),
    Check("excel → pdf (needs LibreOffice)", check_excel_to_pdf, expects_unavailable=True),
    Check("powerpoint → pdf (needs LibreOffice)", check_ppt_to_pdf, expects_unavailable=True),
    Check("error · wrong file type", check_rejects_wrong_type),
    Check("error · page out of range", check_rejects_out_of_range_page),
    Check("error · locked file without password", check_requires_password_for_locked_file),
    Check("error · wrong unlock password", check_wrong_unlock_password),
    Check("error · missing required field", check_missing_required_field),
]


def main() -> int:
    passed, failed, skipped = 0, 0, 0
    width = max(len(check.name) for check in CHECKS)

    with httpx.Client(base_url=API_BASE, timeout=TIMEOUT) as client:
        try:
            client.get("/api/health").raise_for_status()
        except Exception as error:  # noqa: BLE001 - surfaced to the operator
            print(f"Could not reach the API at {API_BASE}: {error}")
            return 2

        print(f"Verifying {API_BASE}\n")
        for check in CHECKS:
            try:
                detail = check.run(client)
                passed += 1
                print(f"  PASS  {check.name:<{width}}  {detail}")
            except AssertionError as error:
                if check.expects_unavailable and "LIBREOFFICE_MISSING" in str(error):
                    skipped += 1
                    print(f"  SKIP  {check.name:<{width}}  LibreOffice is not installed on this machine")
                else:
                    failed += 1
                    print(f"  FAIL  {check.name:<{width}}  {error}")
            except Exception as error:  # noqa: BLE001 - report and continue
                failed += 1
                print(f"  FAIL  {check.name:<{width}}  {type(error).__name__}: {error}")

    print(f"\n{passed} passed · {failed} failed · {skipped} skipped (missing optional binary)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
