"""Discovery of external executables (LibreOffice, Ghostscript).

Search order for each tool:
1. Explicitly configured environment variable
2. PATH lookup
3. Well-known install locations (Windows / macOS / Linux)
"""

import logging
import shutil
import sys
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)

WINDOWS_SOFFICE_CANDIDATES = [
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
]
MAC_SOFFICE_CANDIDATES = [
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
]
LINUX_SOFFICE_CANDIDATES = [
    "/usr/bin/soffice",
    "/usr/local/bin/soffice",
    "/opt/libreoffice/program/soffice",
]

WINDOWS_GS_CANDIDATES = [
    r"C:\Program Files\gs\gs*\bin\gswin64c.exe",
    r"C:\Program Files (x86)\gs\gs*\bin\gswin64c.exe",
]


def _find_candidates(candidates: list[str]) -> str | None:
    for candidate in candidates:
        try:
            matches = sorted(Path(candidate).parent.glob(Path(candidate).name))
        except OSError:
            matches = []
        for match in matches:
            if match.is_file():
                return str(match)
    return None


def find_libreoffice() -> str | None:
    configured = settings.libreoffice_path.strip()
    if configured:
        path = Path(configured)
        if path.exists():
            return str(path)
        logger.warning("LIBREOFFICE_PATH configured but not found: %s", configured)

    if executable := shutil.which("soffice") or shutil.which("soffice.exe"):
        return executable

    candidates: list[str] = []
    if sys.platform == "win32":
        candidates = WINDOWS_SOFFICE_CANDIDATES
    elif sys.platform == "darwin":
        candidates = MAC_SOFFICE_CANDIDATES
    else:
        candidates = LINUX_SOFFICE_CANDIDATES
    return _find_candidates(candidates)


def find_ghostscript() -> str | None:
    configured = settings.ghostscript_path.strip()
    if configured:
        path = Path(configured)
        if path.exists():
            return str(path)
        logger.warning("GHOSTSCRIPT_PATH configured but not found: %s", configured)

    if executable := shutil.which("gswin64c") or shutil.which("gswin32c") or shutil.which("gs"):
        return executable

    if sys.platform == "win32":
        return _find_candidates(WINDOWS_GS_CANDIDATES)
    return None


def libreoffice_available() -> bool:
    return find_libreoffice() is not None


def ghostscript_available() -> bool:
    return find_ghostscript() is not None