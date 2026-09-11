"""Split a PDF into one, several, or per-page documents."""

from pathlib import Path

import pymupdf as fitz

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document, parse_ranges
from app.utils.file_utils import request_workspace
from app.utils.cleanup import temp_workspace


def split_pdf(content: bytes, mode: str, page: int | None, ranges: str, output_name: str = "split") -> ProcessingResult:
    if mode not in {"page", "every", "ranges"}:
        raise ProcessingError("Split mode must be one of: page, every, ranges.")

    doc = open_pdf(content)
    page_count = doc.page_count
    base_stem = Path(output_name).stem

    if mode == "page":
        if page is None:
            raise ProcessingError("A page number is required for single-page split.")
        if page < 1 or page > page_count:
            raise ProcessingError(f"Page {page} is out of range (1 to {page_count}).")
        with temp_workspace() as workspace:
            target = fitz.open()
            target.insert_pdf(doc, from_page=page - 1, to_page=page - 1)
            out_path = workspace / "part.pdf"
            save_document(target, out_path)
            data = out_path.read_bytes()
        return ProcessingResult(
            data=data,
            filename=f"{base_stem}_page_{page}.pdf",
            media_type="application/pdf",
            message="Page extracted successfully.",
        )

    if mode == "every":
        with temp_workspace() as workspace:
            paths: list[Path] = []
            for index in range(page_count):
                target = fitz.open()
                target.insert_pdf(doc, from_page=index, to_page=index)
                part = workspace / f"page_{index + 1}.pdf"
                save_document(target, part)
                paths.append(part)
            data = _zip_parts(paths, f"{base_stem}_pages", workspace)
        return ProcessingResult(
            data=data,
            filename=f"{base_stem}_pages.zip",
            media_type="application/zip",
            message=f"Split into {page_count} files.",
        )

    parsed = parse_ranges(ranges, page_count)
    with temp_workspace() as workspace:
        paths = []
        for index, (start, end) in enumerate(parsed, start=1):
            target = fitz.open()
            target.insert_pdf(doc, from_page=start - 1, to_page=end - 1)
            part = workspace / f"part_{index}.pdf"
            save_document(target, part)
            paths.append(part)
        data = _zip_parts(paths, f"{base_stem}_ranges", workspace)
    return ProcessingResult(
        data=data,
        filename=f"{base_stem}_ranges.zip",
        media_type="application/zip",
        message=f"Split into {len(parsed)} part{'s' if len(parsed) != 1 else ''}.",
    )


def _zip_parts(paths: list[Path], archive_stem: str, workspace: Path) -> bytes:
    import zipfile

    archive = workspace / f"{archive_stem}.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in paths:
            zf.write(path, arcname=path.name)
    return archive.read_bytes()