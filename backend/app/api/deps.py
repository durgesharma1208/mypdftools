"""Shared helpers for API routes."""

from typing import Iterable
from urllib.parse import quote

from fastapi import Response, UploadFile

from app.core.config import settings
from app.core.errors import FileTooLargeError, ValidationError
from app.services.pdf_base import ProcessingResult


async def read_upload(file: UploadFile) -> bytes:
    data = await file.read(settings.max_file_size_bytes + 1)
    if len(data) > settings.max_file_size_bytes:
        raise FileTooLargeError(
            f"This file exceeds the maximum supported size of {settings.max_file_size_mb} MB."
        )
    return data


def enforce_file_count(files: Iterable, max_files: int | None = None) -> None:
    limit = max_files or settings.max_files
    listed = list(files)
    if not listed:
        raise ValidationError("No files were uploaded.")
    if len(listed) > limit:
        raise ValidationError(f"Maximum {limit} files allowed per request.")


def _content_disposition(filename: str) -> str:
    ascii_name = filename.encode("ascii", "ignore").decode() or "download"
    return f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(filename)}"


def file_response(result: ProcessingResult) -> Response:
    headers = {"Content-Disposition": _content_disposition(result.filename)}
    if result.message:
        headers["X-Result-Message"] = result.message
    return Response(content=result.data, media_type=result.media_type, headers=headers)