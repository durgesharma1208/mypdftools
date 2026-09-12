"""Health and external-dependency status endpoint."""

import pymupdf as fitz
import pikepdf

from app.core.config import settings
from app.schemas.responses import (
    DependencyStatus,
    HealthResponse,
    ServerFeatures,
    ServerLimits,
)
from app.services.discovery import find_ghostscript, find_libreoffice

from fastapi import APIRouter

router = APIRouter(tags=["health"])


def _pdf_engine_available() -> bool:
    try:
        import pymupdf  # noqa: F401
        import pikepdf  # noqa: F401

        return True
    except Exception:
        return False


def _py_pdf_engine_status() -> DependencyStatus:
    try:
        fitz_version = fitz.VersionBind if hasattr(fitz, "VersionBind") else "unknown"
        pikepdf_version = pikepdf.__version__
        return DependencyStatus(
            label=f"pdf_engine (PyMuPDF {fitz_version} + pikepdf {pikepdf_version})",
            status="ok",
            available=True,
        )
    except Exception:
        return DependencyStatus(label="pdf_engine", status="unavailable", available=False)


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    libreoffice = find_libreoffice()
    ghostscript = find_ghostscript()
    pdf_engine = _pdf_engine_available()

    return HealthResponse(
        status="ok",
        service="mypdftools-api",
        version=settings.app_env,
        environment=settings.app_env,
        dependencies=[
            DependencyStatus(label="python", status="ok", available=True),
            _py_pdf_engine_status(),
            DependencyStatus(
                label="libreoffice",
                status="ok" if libreoffice else "unavailable",
                available=bool(libreoffice),
            ),
            DependencyStatus(
                label="ghostscript",
                status="ok" if ghostscript else "unavailable",
                available=bool(ghostscript),
            ),
        ],
        limits=ServerLimits(
            max_file_size_mb=settings.max_file_size_mb,
            max_files=settings.max_files,
        ),
        features=ServerFeatures(
            office=bool(libreoffice),
            ghostscript=bool(ghostscript),
            pdf_engine=pdf_engine,
        ),
    )
