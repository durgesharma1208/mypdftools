"""Protect a PDF with a password and unlock already-protected PDFs."""

from pathlib import Path

import pymupdf as fitz

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, save_document
from app.utils.cleanup import temp_workspace


def protect_pdf(
    content: bytes,
    user_password: str,
    owner_password: str | None,
    allow_print: bool,
    allow_copy: bool,
    allow_modify: bool,
    output_name: str = "protected.pdf",
) -> ProcessingResult:
    if not user_password:
        raise ProcessingError("A user password is required to protect the PDF.")

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise ProcessingError("This PDF appears to be corrupt or unsupported.") from exc

    permissions = -4
    if not allow_print:
        permissions -= fitz.PDF_PERM_PRINT
    if not allow_copy:
        permissions -= fitz.PDF_PERM_COPY
    if not allow_modify:
        permissions -= fitz.PDF_PERM_MODIFY

    try:
        with temp_workspace() as workspace:
            out_path = workspace / "result.pdf"
            doc.save(
                out_path,
                encryption=fitz.PDF_ENCRYPT_AES_256,
                user_pw=user_password,
                owner_pw=owner_password or user_password,
                permissions=permissions,
            )
            doc.close()
            data = out_path.read_bytes()
    except Exception as exc:
        raise ProcessingError("Failed to apply password protection.") from exc

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message="Password protection applied with AES-256 encryption.",
    )


def unlock_pdf(content: bytes, password: str | None, output_name: str = "unlocked.pdf") -> ProcessingResult:
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        raise ProcessingError("This PDF appears to be corrupt or unsupported.") from exc

    try:
        encrypted = bool(doc.needs_pass)
    except AttributeError:
        encrypted = doc.is_encrypted

    if not encrypted:
        doc.close()
        raise ProcessingError("This PDF is not password protected.")

    if password:
        if not doc.authenticate(password):
            doc.close()
            raise ProcessingError("The password you supplied is incorrect.")
    elif not doc.authenticate(""):
        doc.close()
        raise ProcessingError("A password is required to unlock this PDF.")

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        doc.save(out_path, encryption=fitz.PDF_ENCRYPT_NONE)
        doc.close()
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message="Password protection removed. The file is now unlocked.",
    )