"""Reorder the pages of a PDF."""

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, parse_page_list, save_document
from app.utils.cleanup import temp_workspace


def organize_pdf(content: bytes, order: str, output_name: str = "organized.pdf") -> ProcessingResult:
    if not order or not order.strip():
        raise ProcessingError("Provide a page order for the organized PDF.")

    doc = open_pdf(content)
    indices = parse_page_list(order, doc.page_count)

    if set(indices) != set(range(doc.page_count)):
        raise ProcessingError("The page order must include every page exactly once.")

    doc.select(indices)

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message="Pages reordered successfully.",
    )