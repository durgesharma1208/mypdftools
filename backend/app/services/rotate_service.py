"""Rotate all or selected pages of a PDF."""

from pathlib import Path

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, parse_page_list, save_document
from app.utils.cleanup import temp_workspace


def rotate_pdf(content: bytes, angle: int, pages: str, output_name: str = "rotated.pdf") -> ProcessingResult:
    if angle not in {90, 180, 270, 360}:
        raise ProcessingError("Rotation angle must be 90, 180, 270 or 360 degrees.")

    doc = open_pdf(content)
    if doc.page_count == 0:
        raise ProcessingError("The PDF has no pages to rotate.")

    indices = parse_page_list(pages, doc.page_count) if pages and pages.strip() else list(range(doc.page_count))

    for index in indices:
        page = doc.load_page(index)
        current = page.rotation or 0
        page.set_rotation((current + angle) % 360)

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message=f"Rotated {len(indices)} page{'s' if len(indices) != 1 else ''} by {angle} degrees.",
    )