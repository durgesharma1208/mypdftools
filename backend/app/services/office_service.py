"""Convert Word/Excel/PowerPoint files to PDF using LibreOffice headless mode."""

import logging
import subprocess
import time
from pathlib import Path

from app.core.config import settings
from app.core.errors import DependencyUnavailableError, ProcessingError
from app.core.security import safe_basename
from app.services.discovery import find_libreoffice
from app.services.pdf_base import ProcessingResult
from app.utils.cleanup import temp_workspace

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {
    "word": {".doc", ".docx"},
    "excel": {".xls", ".xlsx", ".csv", ".ods"},
    "powerpoint": {".ppt", ".pptx", ".odp"},
}

OFFICE_INSTRUCTIONS = (
    "LibreOffice is required for office document conversion but was not found. "
    "Install LibreOffice from https://www.libreoffice.org and restart the server, "
    "or set LIBREOFFICE_PATH in backend/.env to the soffice executable."
)


def convert_to_pdf(content: bytes, original_name: str, kind: str, output_name: str = "converted.pdf") -> ProcessingResult:
    if kind not in SUPPORTED_EXTENSIONS:
        raise ProcessingError("Unsupported office document type.")

    soffice = find_libreoffice()
    if not soffice:
        raise DependencyUnavailableError(OFFICE_INSTRUCTIONS)

    output_stem = Path(output_name).stem or "converted"
    with temp_workspace() as workspace:
        source = workspace / safe_basename(original_name)
        source.write_bytes(content)

        profile = workspace / "profile"
        profile.mkdir(exist_ok=True)
        profile_uri = "file:///" + str(profile).replace("\\", "/")

        command = [
            soffice,
            "--headless",
            "--norestore",
            "--nolockcheck",
            f"-env:UserInstallation={profile_uri}",
            "--convert-to",
            "pdf",
            "--outdir",
            str(workspace),
            str(source),
        ]

        try:
            started = time.monotonic()
            result = subprocess.run(
                command,
                capture_output=True,
                timeout=settings.request_timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise ProcessingError(
                "LibreOffice timed out while converting the file. The document may be too complex."
            ) from exc
        except OSError as exc:
            raise DependencyUnavailableError(OFFICE_INSTRUCTIONS) from exc

        converted = workspace / f"{source.stem}.pdf"
        if result.returncode != 0 or not converted.exists():
            logger.warning("LibreOffice conversion failed: %s", result.stderr.decode(errors="replace")[:2000])
            raise ProcessingError(
                "LibreOffice could not convert this file. The source may be corrupt or a format LibreOffice cannot read."
            )

        logger.info("LibreOffice conversion took %.1fs", time.monotonic() - started)
        data = converted.read_bytes()

    return ProcessingResult(
        data=data,
        filename=output_name,
        media_type="application/pdf",
        message="Converted to PDF with LibreOffice.",
    )