"""Aggregated API router."""

from fastapi import APIRouter

from app.api.routes import ai, conversion, health, ocr, pdf

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(pdf.router)
api_router.include_router(conversion.router)
api_router.include_router(ocr.router)
api_router.include_router(ai.router)