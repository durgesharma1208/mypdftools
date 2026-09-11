"""Add page numbers to a PDF."""

from pathlib import Path

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

POSITIONS = {"bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"}


def page_numbers(
    content: bytes,
    start: int,
    font_size: float,
    position: str,
    output_name: str = "numbered.pdf",
) -> ProcessingResult:
    if position not in POSITIONS:
        raise ProcessingError(f"Page number position must be one of: {', '.join(sorted(POSITIONS))}.")
    start = max(1, int(start))
    font_size = max(6.0, min(72.0, float(font_size)))

    doc = open_pdf(content)
    for index, page in enumerate(doc):
        width, height = page.rect.width, page.rect.height
        margin = 24.0
        label = str(start + index)

        if "top" in position:
            y = height - margin - font_size
        else:
            y = margin

        if "left" in position:
            x = margin
        elif "right" in position:
            x = width - margin - font_size * 0.6 * len(label)
        else:
            x = (width - font_size * 0.6 * len(label)) / 2

        page.insert_text((x, y), label, fontsize=font_size, fontname="helv")

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message=f"Page numbers added starting at {start}.",
    )