"""Pydantic response schemas."""

from pydantic import BaseModel, Field


class DependencyStatus(BaseModel):
    label: str
    status: str
    available: bool


class ServerLimits(BaseModel):
    """Upload limits the frontend uses for instant client-side validation."""

    max_file_size_mb: int
    max_files: int


class ServerFeatures(BaseModel):
    """Optional binaries and engines the API can currently use."""

    office: bool
    ghostscript: bool
    pdf_engine: bool


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    dependencies: list[DependencyStatus]
    limits: ServerLimits = Field(default_factory=lambda: ServerLimits(max_file_size_mb=50, max_files=10))
    features: ServerFeatures = Field(
        default_factory=lambda: ServerFeatures(office=False, ghostscript=False, pdf_engine=True)
    )


class PageSize(BaseModel):
    page: int
    width: float
    height: float


class TextLayerInfo(BaseModel):
    text_pages: int
    total_pages_checked: int


class PdfInfoResponse(BaseModel):
    page_count: int
    file_size: int
    encrypted: bool
    text_layer: TextLayerInfo
    metadata: dict
    page_sizes: list[PageSize]


class ErrorResponse(BaseModel):
    error: str
    detail: str
    type: str
