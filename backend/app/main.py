"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.errors import PDFToolError
from app.utils.cleanup import cleanup_old_files

logger = logging.getLogger("app")
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.ensure_directories()
    removed = cleanup_old_files(3600)
    if removed:
        logger.info("Removed %s stale temporary file(s) on startup.", removed)
    yield


def create_app() -> FastAPI:
    application = FastAPI(
        title="MyPDFTools API",
        version="2.0.0",
        description="Production-ready PDF utilities: merge, split, rotate, compress, convert and secure PDFs.",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Content-Disposition", "X-Result-Message"],
    )

    application.include_router(api_router)

    @application.exception_handler(PDFToolError)
    async def pdf_tool_exception_handler(_: Request, exc: PDFToolError):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "detail": exc.detail,
                "type": exc.__class__.__name__,
            },
        )

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "Invalid request",
                "detail": _summarize_validation_error(exc),
                "type": "validation_error",
            },
        )

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(_: Request, exc: Exception):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Something went wrong while processing your PDF. Please try again.",
                "detail": "An unexpected server error occurred.",
                "type": "internal_error",
            },
        )

    return application


def _summarize_validation_error(exc: RequestValidationError) -> str:
    messages = []
    for error in exc.errors():
        location = ".".join(str(part) for part in error.get("loc", []) if part != "body")
        messages.append(f"{location or 'file'}: {error.get('msg', 'invalid')}")
    return "; ".join(messages)


app = create_app()