"""Health and external-dependency status endpoint."""

import pymupdf as fitz
import pikepdf

from app.core.config import settings
from app.schemas.responses import DependencyStatus, HealthResponse
from app.services.discovery import find_ghostscript, find_libreoffice

from fastapi import APIRouter

router = APIRouter(tags=["health"])


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
    )