"""Filesystem helpers for uploads and output generation."""

import tempfile
import uuid
from pathlib import Path

from app.core.config import settings
from app.core.security import safe_basename


def request_workspace(prefix: str = "upload") -> Path:
    settings.ensure_directories()
    return Path(tempfile.mkdtemp(prefix=f"{prefix}-{uuid.uuid4().hex[:8]}-", dir=settings.temp_directory))


def unique_output_path(directory: Path, stem: str, suffix: str) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    return directory / f"{safe_basename(stem) or 'result'}-{uuid.uuid4().hex[:10]}{suffix}"


def safe_output_name(original_name: str, desired_stem: str | None, suffix: str) -> str:
    base = Path(original_name).stem
    stem = safe_basename(desired_stem) if desired_stem else safe_basename(base)
    return f"{stem}{suffix}"


def format_bytes(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f} {unit}" if unit != "B" else f"{int(value)} {unit}"
        value /= 1024
    return f"{value:.1f} GB"