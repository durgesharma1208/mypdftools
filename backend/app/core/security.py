"""Security helpers for handling untrusted uploads."""

import re
from pathlib import Path

from app.core.errors import ValidationError

_SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]")


def safe_basename(filename: str) -> str:
    name = Path(filename or "").name
    name = _SAFE_NAME_RE.sub("_", name)
    name = name.strip(" .")
    return name or "file"


def sanitize_file_name(filename: str) -> str:
    return safe_basename(filename)


def is_within_directory(root: Path, target: Path) -> bool:
    try:
        target.relative_to(root)
        return True
    except ValueError:
        return False


def validate_no_path_traversal(filename: str) -> str:
    name = Path(filename or "").name
    if not name or name in {".", ".."}:
        raise ValidationError("Invalid file name.")
    return name