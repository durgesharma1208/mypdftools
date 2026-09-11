import io
import zipfile

from tests.conftest import pdf_page_count


def test_jpg_to_pdf(client, image_jpg_bytes):
    response = client.post(
        "/api/convert/jpg-to-pdf",
        files=[
            ("images", ("photo.jpg", image_jpg_bytes, "image/jpeg")),
            ("images", ("photo2.jpg", image_jpg_bytes, "image/jpeg")),
        ],
        data={"page_size": "auto", "orientation": "auto"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
    assert pdf_page_count(response.content) == 2


def test_png_to_pdf(client, image_png_bytes):
    response = client.post(
        "/api/convert/jpg-to-pdf",
        files=[("images", ("drawing.png", image_png_bytes, "image/png"))],
        data={"page_size": "a4", "orientation": "portrait"},
    )
    assert response.status_code == 200
    assert pdf_page_count(response.content) == 1


def test_pdf_to_jpg_zip(client, pdf_bytes):
    response = client.post(
        "/api/convert/pdf-to-jpg",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"dpi": "72", "format": "jpg"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    with zipfile.ZipFile(io.BytesIO(response.content)) as archive:
        names = archive.namelist()
        assert len(names) == 3
        assert all(name.startswith("page_") and name.endswith(".jpg") for name in names)


def test_pdf_to_word(client, pdf_bytes):
    response = client.post(
        "/api/convert/pdf-to-word",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/vnd.openxmlformats")
    assert response.content[:2] == b"PK"


def test_word_to_pdf_unavailable_without_libreoffice(client, docx_bytes):
    response = client.post(
        "/api/convert/word-to-pdf",
        files=[("file", ("doc.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))],
    )
    if response.status_code == 200:
        return  # LibreOffice installed in this environment
    assert response.status_code == 503
    assert "LibreOffice" in response.json()["error"]


def test_invalid_file_rejected_as_pdf(client):
    response = client.post(
        "/api/pdf/rotate",
        files=[("pdf_file", ("not_a_pdf.txt", b"plain text", "text/plain"))],
        data={"angle": "90", "pages": ""},
    )
    assert response.status_code == 400
    assert "PDF" in response.json()["error"]


def test_invalid_image_rejected(client):
    response = client.post(
        "/api/convert/jpg-to-pdf",
        files=[("images", ("fake.jpg", b"not an image", "image/jpeg"))],
    )
    assert response.status_code in (400, 422)


def test_oversized_file_rejected(client, pdf_bytes, monkeypatch):
    from app.core.config import settings
    monkeypatch.setattr(settings, "max_file_size_mb", 1)
    oversized = pdf_bytes + b"A" * (2 * 1024 * 1024)
    response = client.post(
        "/api/pdf/rotate",
        files=[("pdf_file", ("big.pdf", oversized, "application/pdf"))],
        data={"angle": "90", "pages": ""},
    )
    assert response.status_code == 400
    assert "maximum supported size" in response.json()["error"]


def test_missing_file_returns_422(client):
    response = client.post("/api/pdf/merge")
    assert response.status_code == 422


def test_error_response_shape_is_consistent(client, pdf_bytes):
    response = client.post(
        "/api/pdf/split",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"mode": "page", "page": "99"},
    )
    body = response.json()
    assert {"error", "detail", "type"} <= set(body)


def test_download_headers_include_filename(client, pdf_bytes):
    response = client.post(
        "/api/pdf/rotate",
        files=[("pdf_file", ("doc.pdf", pdf_bytes, "application/pdf"))],
        data={"angle": "90", "pages": ""},
    )
    assert "content-disposition" in response.headers
    assert "attachment" in response.headers["content-disposition"]