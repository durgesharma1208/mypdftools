"""Delete selected pages from a PDF."""

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, parse_page_list, save_document
from app.utils.cleanup import temp_workspace


def delete_pages(content: bytes, pages: str, output_name: str = "deleted.pdf") -> ProcessingResult:
    if not pages or not pages.strip():
        raise ProcessingError("Select at least one page to delete.")

    doc = open_pdf(content)
    to_delete = parse_page_list(pages, doc.page_count)

    keep = [i for i in range(doc.page_count) if i not in to_delete]
    if not keep:
        raise ProcessingError("You cannot delete every page in the document.")

    doc.select(keep)

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message=f"Deleted {len(to_delete)} page{'s' if len(to_delete) != 1 else ''}.",
    )