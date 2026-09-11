"""Merge multiple PDFs into a single document."""

import pymupdf as fitz

from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace


def merge_pdfs(files: list[tuple[str, bytes]], output_name: str = "merged.pdf") -> ProcessingResult:
    result = fitz.open()
    try:
        for name, content in files:
            source = open_pdf(content)
            result.insert_pdf(source)
            source.close()
    except Exception:
        result.close()
        raise

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(result, out_path)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message=f"Merged {len(files)} PDF file{'s' if len(files) != 1 else ''}.",
    )