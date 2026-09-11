"""Inspect PDF information and edit PDF metadata."""

from pathlib import Path

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

_PAGE_SCAN_CAP = 200


def get_pdf_info(content: bytes, password: str | None = None) -> dict:
    doc = open_pdf(content, password)
    page_count = doc.page_count

    meta = {key: value for key, value in (doc.metadata or {}).items() if value}

    page_sizes: list[dict[str, float]] = []
    text_pages = 0
    for index in range(min(page_count, _PAGE_SCAN_CAP)):
        page = doc.load_page(index)
        page_sizes.append({"page": index + 1, "width": round(page.rect.width, 2), "height": round(page.rect.height, 2)})
        try:
            if page.get_text("text").strip():
                text_pages += 1
        except Exception:
            pass

    try:
        encrypted = bool(doc.needs_pass) or bool(doc.is_encrypted)
    except AttributeError:
        encrypted = False
    doc.close()

    return {
        "page_count": page_count,
        "file_size": len(content),
        "encrypted": encrypted,
        "text_layer": {"text_pages": text_pages, "total_pages_checked": min(page_count, _PAGE_SCAN_CAP)},
        "metadata": meta,
        "page_sizes": page_sizes,
    }


def edit_metadata(
    content: bytes,
    title: str | None,
    author: str | None,
    subject: str | None,
    keywords: str | None,
    creator: str | None,
    producer: str | None,
    output_name: str = "metadata.pdf",
) -> ProcessingResult:
    doc = open_pdf(content)
    updates = {}
    for key, value in (
        ("title", title),
        ("author", author),
        ("subject", subject),
        ("keywords", keywords),
        ("creator", creator),
        ("producer", producer),
    ):
        if value is not None:
            updates[key] = value

    if updates:
        doc.set_metadata(updates)
    else:
        doc.close()
        raise ProcessingError("Provide at least one metadata field to update.")

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message="Metadata updated successfully.",
    )