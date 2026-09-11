"""Convert a PDF to an editable Word document (text-first, layout is not preserved)."""

from pathlib import Path

from docx import Document as WordDocument

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf
from app.utils.cleanup import temp_workspace


def _paragraphs_from_lines(lines: list[str]) -> list[str]:
    paragraphs: list[str] = []
    current: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue
        current.append(stripped)
    if current:
        paragraphs.append(" ".join(current))
    return paragraphs


def pdf_to_word(content: bytes, output_name: str = "converted.docx") -> ProcessingResult:
    doc = open_pdf(content)
    document = WordDocument()
    text_pages = 0

    for index, page in enumerate(doc):
        text = page.get_text("text")
        if not text.strip():
            continue
        text_pages += 1
        if index > 0:
            document.add_page_break()
        for paragraph in _paragraphs_from_lines(text.splitlines()):
            document.add_paragraph(paragraph)

    doc.close()

    if text_pages == 0:
        raise ProcessingError(
            "No extractable text was found. This PDF appears to be scanned or image-based, "
            "and OCR is not available locally. Please use a tool with OCR support."
        )

    with temp_workspace() as workspace:
        out_path = workspace / "result.docx"
        document.save(str(out_path))
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        message=f"Converted text from {text_pages} page{'s' if text_pages != 1 else ''}. Images, tables and layout are not preserved.",
    )