import io
import zipfile

from fastapi import UploadFile

from tests.conftest import first_page_text, pdf_page_count
import pymupdf as fitz


def _post(client, path, files, data=None):
    return client.post(path, files=files, data=data or {})


def test_merge_multiple_pdfs(client, pdf_bytes, second_pdf_bytes):
    response = _post(
        client,
        "/api/pdf/merge",
        files=[
            ("pdfs", ("one.pdf", pdf_bytes, "application/pdf")),
            ("pdfs", ("two.pdf", second_pdf_bytes, "application/pdf")),
        ],
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert pdf_page_count(response.content) == 5


def test_split_single_page(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/split",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"mode": "page", "page": "2"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 1


def test_split_every_page_returns_zip(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/split",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"mode": "every", "ranges": ""},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        assert len(archive.namelist()) == 3


def test_split_ranges_returns_zip(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/split",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"mode": "ranges", "ranges": "1-2,3"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"


def test_split_invalid_page(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/split",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"mode": "page", "page": "99"},
    )
    assert response.status_code == 400


def test_rotate_all_pages(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/rotate",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"angle": "90", "pages": ""},
    )
    assert response.status_code == 200
    document = fitz.open(stream=response.content, filetype="pdf")
    assert all(page.rotation == 90 for page in document)
    document.close()


def test_rotate_selected_pages(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/rotate",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"angle": "180", "pages": "1"},
    )
    assert response.status_code == 200
    document = fitz.open(stream=response.content, filetype="pdf")
    assert document.load_page(0).rotation == 180
    assert document.load_page(1).rotation == 0
    document.close()


def test_extract_pages(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/extract",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"pages": "1,3"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 2


def test_delete_pages(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/delete-pages",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"pages": "2"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 2


def test_organize_pages(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/organize",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"order": "3,1,2"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3
    assert "Page 3" in first_page_text(response.content)


def test_watermark_text(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/watermark",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"text": "CONFIDENTIAL", "font_size": "40", "opacity": "0.3", "color": "#ff0000", "position": "diagonal"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3


def test_image_watermark(client, pdf_bytes, image_png_bytes):
    response = _post(
        client,
        "/api/pdf/image-watermark",
        files=[
            ("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf")),
            ("logo", ("logo.png", image_png_bytes, "image/png")),
        ],
        data={"size": "100", "opacity": "0.8", "position": "bottom-right"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3


def test_page_numbers(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/page-numbers",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"start": "10", "font_size": "14", "position": "bottom-center"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3


def test_compress_low(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/compress",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"level": "low"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3


def test_compress_medium(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/compress",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"level": "medium"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 3


def test_protect_pdf(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/protect",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"user_password": "pass123", "owner_password": "owner123"},
    )
    assert response.status_code == 200
    document = fitz.open(stream=response.content, filetype="pdf")
    assert document.needs_pass == 1
    assert document.authenticate("pass123")
    document.close()


def test_unlock_with_password(client, protected_pdf_bytes):
    response = _post(
        client,
        "/api/pdf/unlock",
        files=[("pdf_file", ("doc.pdf", protected_pdf_bytes, "application/pdf"))],
        data={"password": "secret123"},
    )
    assert response.status_code == 200
    document = fitz.open(stream=response.content, filetype="pdf")
    assert document.is_encrypted is False
    document.close()


def test_unlock_wrong_password(client, protected_pdf_bytes):
    response = _post(
        client,
        "/api/pdf/unlock",
        files=[("pdf_file", ("doc.pdf", protected_pdf_bytes, "application/pdf"))],
        data={"password": "nope"},
    )
    assert response.status_code == 400


def test_unlock_unprotected_pdf(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/unlock",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"password": "whatever"},
    )
    assert response.status_code == 400


def test_pdf_info(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/info",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
    )
    assert response.status_code == 200
    body = response.json()
    assert body["page_count"] == 3
    assert body["metadata"]["title"] == "First PDF"
    assert len(body["page_sizes"]) == 3


def test_metadata_edit(client, pdf_bytes):
    response = _post(
        client,
        "/api/pdf/metadata",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"title": "New Title", "author": "New Author"},
    )
    assert response.status_code == 200
    document = fitz.open(stream=response.content, filetype="pdf")
    assert document.metadata["title"] == "New Title"
    document.close()


def test_temporary_files_are_cleaned(client, pdf_bytes):
    import os
    from app.core.config import settings
    before = len(list(settings.temp_directory.glob("upload-*"))) if settings.temp_directory.exists() else 0
    _post(
        client,
        "/api/pdf/rotate",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"angle": "90", "pages": ""},
    )
    after = len(list(settings.temp_directory.glob("upload-*"))) if settings.temp_directory.exists() else 0
    assert after == before