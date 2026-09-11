"""Shared helpers for PyMuPDF-based PDF services."""

from dataclasses import dataclass

import pymupdf as fitz

from app.core.errors import ProcessingError


@dataclass
class ProcessingResult:
    data: bytes
    filename: str
    media_type: str
    message: str = ""


def open_pdf(content: bytes, password: str | None = None) -> fitz.Document:
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise ProcessingError(
            "This PDF appears to be corrupt, encrypted with an unknown scheme, or unsupported."
        ) from exc

    if doc.needs_pass:
        if password:
            if not doc.authenticate(password):
                raise ProcessingError("The password you supplied is incorrect.")
        else:
            raise ProcessingError("This PDF is password protected. Unlock it before processing.")
    return doc


def save_document(doc: fitz.Document, path, garbage: int = 3, deflate: bool = True) -> None:
    try:
        doc.save(path, garbage=garbage, deflate=deflate)
    except Exception as exc:
        raise ProcessingError("Failed to write the processed PDF.") from exc
    finally:
        doc.close()


def parse_page_list(raw: str, page_count: int) -> list[int]:
    """Parse a comma separated 1-based page list into 0-based indices."""
    if not raw or not raw.strip():
        return list(range(page_count))
    indices: list[int] = []
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            value = int(token)
        except ValueError:
            raise ProcessingError(f"'{token}' is not a valid page number.")
        if value < 1 or value > page_count:
            raise ProcessingError(f"Page {value} is out of range (1 to {page_count}).")
        indices.append(value - 1)
    return indices


def parse_ranges(raw: str, page_count: int) -> list[tuple[int, int]]:
    """Parse ranges like '1-3,5,7-9' into inclusive 1-based ranges."""
    ranges: list[tuple[int, int]] = []
    if not raw or not raw.strip():
        return [(1, page_count)]
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        if "-" in token:
            start_s, end_s = token.split("-", 1)
            try:
                start, end = int(start_s.strip()), int(end_s.strip())
            except ValueError:
                raise ProcessingError(f"'{token}' is not a valid page range.")
            if start < 1 or end > page_count or start > end:
                raise ProcessingError(f"Range '{token}' is out of bounds (1 to {page_count}).")
            ranges.append((start, end))
        else:
            try:
                page = int(token)
            except ValueError:
                raise ProcessingError(f"'{token}' is not a valid page number.")
            if page < 1 or page > page_count:
                raise ProcessingError(f"Page {page} is out of range (1 to {page_count}).")
            ranges.append((page, page))
    return ranges