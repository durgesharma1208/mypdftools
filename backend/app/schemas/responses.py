"""Pydantic response schemas."""

from pydantic import BaseModel


class DependencyStatus(BaseModel):
    label: str
    status: str
    available: bool


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    dependencies: list[DependencyStatus]


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