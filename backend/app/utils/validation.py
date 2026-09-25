"""Upload validation using magic bytes so file content is never trusted by name alone."""

from pathlib import Path

from app.core.config import settings
from app.core.errors import FileTooLargeError, UnsupportedFileError
from app.core.security import sanitize_file_name

ALLOWED_EXTENSIONS = {
    "pdf": ".pdf",
    "image": {".jpg", ".jpeg", ".png"},
    "word": {".doc", ".docx"},
    "excel": {".xls", ".xlsx"},
    "powerpoint": {".ppt", ".pptx"},
}


def detect_kind(head_bytes: bytes) -> str | None:
    if head_bytes.startswith(b"%PDF"):
        return "pdf"
    if head_bytes.startswith(b"\xff\xd8\xff"):
        return "image"
    if head_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image"
    if head_bytes.startswith(b"\xd0\xcf\x11\xe0"):
        return "ole"
    if head_bytes.startswith(b"PK\x03\x04"):
        return "zip"
    return None


def _ext_in(filename: str, kind: str) -> bool:
    suffix = Path(filename).suffix.lower()
    allowed = ALLOWED_EXTENSIONS.get(kind)
    if not allowed:
        return False
    if isinstance(allowed, set):
        return suffix in allowed
    return suffix == allowed


def validate_file(filename: str, content: bytes, allowed: set[str]) -> None:
    if not filename:
        raise UnsupportedFileError("A file name is required.")
    sanitize_file_name(filename)

    if settings.max_file_size_bytes > 0 and len(content) > settings.max_file_size_bytes:
        raise FileTooLargeError(
            f"This file exceeds the maximum supported size of {settings.max_file_size_mb} MB."
        )

    if len(content) < 4:
        raise UnsupportedFileError("The uploaded file is empty or invalid.")

    kind = detect_kind(content[:16])

    if "pdf" in allowed and kind == "pdf" and _ext_in(filename, "pdf"):
        return

    if "image" in allowed and kind == "image" and _ext_in(filename, "image"):
        return

    office_kinds = {"word": "a .doc or .docx file", "excel": "an .xls or .xlsx file", "powerpoint": "a .ppt or .pptx file"}
    for office_kind in ("word", "excel", "powerpoint"):
        if office_kind in allowed and kind in {"ole", "zip"} and _ext_in(filename, office_kind):
            return

    if allowed == {"pdf"}:
        raise UnsupportedFileError("This file type isn't supported. Please upload a PDF.")
    elif allowed == {"image"}:
        raise UnsupportedFileError("This file type isn't supported. Please upload a JPG or PNG image.")
    elif "pdf" in allowed and "image" in allowed:
        raise UnsupportedFileError("This file type isn't supported. Please upload a PDF or an image (JPG, PNG).")

    for office_kind, friendly in office_kinds.items():
        if office_kind in allowed:
            raise UnsupportedFileError(f"This file type isn't supported. Please upload {friendly}.")

    raise UnsupportedFileError("This file type isn't supported.")