"""Extract a subset of pages into a new PDF."""

import pymupdf as fitz

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, parse_page_list, save_document
from app.utils.cleanup import temp_workspace


def extract_pages(content: bytes, pages: str, output_name: str = "extracted.pdf") -> ProcessingResult:
    if not pages or not pages.strip():
        raise ProcessingError("Select at least one page to extract.")

    doc = open_pdf(content)
    indices = parse_page_list(pages, doc.page_count)

    with temp_workspace() as workspace:
        target = fitz.open()
        try:
            for index in indices:
                target.insert_pdf(doc, from_page=index, to_page=index)
        except Exception as exc:
            target.close()
            raise ProcessingError(f"Failed to extract pages. {exc}") from exc
        out_path = workspace / "result.pdf"
        save_document(target, out_path)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message=f"Extracted {len(indices)} page{'s' if len(indices) != 1 else ''}.",
    )