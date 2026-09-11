"""Aggregated API router."""

from fastapi import APIRouter

from app.api.routes import conversion, health, pdf

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(pdf.router)
api_router.include_router(conversion.router)