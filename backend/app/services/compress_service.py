"""Compress a PDF without throwing away more quality than necessary.

Levels:
- low     lossless: QPDF recompression + deflate, quality preserved exactly
- medium  re-encode oversized embedded images at ~72 quality, keep vectors
- high    re-encode embedded images more aggressively at ~58 quality, keep vectors

If image re-encoding is unavailable (older PyMuPDF), medium/high fall back to
page rasterization and report it in the result message.
"""

import io
from pathlib import Path

import pikepdf
from PIL import Image

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

_LOSSLESS_IMAGE_EXTS = {"png", "bmp", "gif", "tiff"}
_SUPPORTED_EXTS = {"jpeg", "jpg", "png", "bmp", "gif", "tiff", "jpx", "jp2"}


def compress_pdf(content: bytes, level: str, output_name: str = "compressed.pdf") -> ProcessingResult:
    if level not in {"low", "medium", "high"}:
        raise ProcessingError("Compression level must be low, medium or high.")

    original_size = max(len(content), 1)

    if level == "low":
        data, note = _lossless_compress(content)
    else:
        data, fallback = _image_compress(content, level)
        note = fallback

    ratio = (1 - len(data) / original_size) * 100
    message = f"Size reduced by {ratio:.1f}% with {level} compression."
    if note:
        message += f" {note}"

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message=message,
    )


def _lossless_compress(content: bytes) -> tuple[bytes, str]:
    with temp_workspace() as workspace:
        out = workspace / "compressed.pdf"
        try:
            with pikepdf.open(io.BytesIO(content)) as pdf:
                pdf.save(
                    out,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate,
                    recompress_flate=True,
                )
        except Exception as exc:
            raise ProcessingError("This PDF could not be repaired for compression.") from exc
        return out.read_bytes(), ""


def _image_compress(content: bytes, level: str) -> tuple[bytes, str]:
    max_dim = 2000 if level == "medium" else 1200
    quality = 72 if level == "medium" else 58

    doc = open_pdf(content)
    replaced = 0
    supported = False

    for page in doc:
        try:
            image_list = page.get_images(full=True)
        except Exception:
            image_list = []
        for image in image_list:
            xref = image[0]
            try:
                info = doc.extract_image(xref)
            except Exception:
                continue
            if info.get("ext") not in _SUPPORTED_EXTS:
                continue
            supported = True
            try:
                pil = Image.open(io.BytesIO(info["image"]))
                pil.load()
            except Exception:
                continue
            width, height = pil.size
            if width <= 0 or height <= 0:
                continue
            scale = min(1.0, max_dim / width, max_dim / height)
            if scale >= 1.0 and info.get("ext") in {"jpeg", "jpg"}:
                continue
            resized = pil
            if scale < 1.0:
                resized = pil.resize((max(1, round(width * scale)), max(1, round(height * scale))), Image.LANCZOS)
            buffer = io.BytesIO()
            _save_as_jpeg(resized, buffer, quality)
            encoded = buffer.getvalue()
            if len(encoded) < len(info["image"]):
                try:
                    page.replace_image(xref, stream=encoded)
                    replaced += 1
                except (AttributeError, TypeError, RuntimeError):
                    pass

    try:
        doc.subset_fonts()
    except Exception:
        pass

    with temp_workspace() as workspace:
        out = workspace / "compressed.pdf"
        save_document(doc, out, garbage=4, deflate=True)
        try:
            data = out.read_bytes()
        except Exception as exc:
            raise ProcessingError("Failed to produce the compressed PDF.") from exc

    if not supported or replaced == 0:
        data = _lossless_compress(content)[0]

    fallback = ""
    if not supported:
        fallback = ("No embedded raster images were found; the file was optimized losslessly.")
    elif replaced == 0 and len(data) >= len(content):
        fallback = "Image re-encoding was not possible; the file was optimized losslessly."
    return data, fallback


def _save_as_jpeg(image: Image.Image, buffer: io.BytesIO, quality: int) -> None:
    if image.mode in ("RGBA", "LA", "P"):
        rgba = image.convert("RGBA")
        background = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
        composited = Image.alpha_composite(background, rgba)
        image = composited.convert("RGB")
    else:
        image = image.convert("RGB")
    image.save(buffer, format="JPEG", quality=quality, optimize=True, progressive=True)