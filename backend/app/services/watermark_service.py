"""Add text or image watermarks to a PDF."""

import io
from pathlib import Path

import pymupdf as fitz
from PIL import Image

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

POSITIONS = {"top-left", "top-center", "top-right", "center", "bottom-left", "bottom-center", "bottom-right", "diagonal"}


def _parse_color(hex_color: str) -> tuple[float, float, float]:
    value = (hex_color or "#808080").lstrip("#")
    if len(value) != 6:
        raise ProcessingError("Watermark color must use the #RRGGBB format.")
    try:
        r, g, b = (int(value[i : i + 2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        raise ProcessingError("Watermark color must use the #RRGGBB format.") from None
    return r, g, b


def _align_for(position: str) -> int:
    if "left" in position:
        return fitz.TEXT_ALIGN_LEFT
    if "right" in position:
        return fitz.TEXT_ALIGN_RIGHT
    return fitz.TEXT_ALIGN_CENTER


def _placement_rect(page_rect: fitz.Rect, font_size: float, margin: float, position: str) -> tuple[fitz.Rect, int]:
    width, height = page_rect.width, page_rect.height
    line_height = font_size * 1.4

    if position == "top-left":
        rect = fitz.Rect(margin, margin, width * 0.6, margin + line_height)
        return rect, fitz.TEXT_ALIGN_LEFT
    if position == "top-center":
        rect = fitz.Rect(width * 0.1, margin, width * 0.9, margin + line_height)
        return rect, fitz.TEXT_ALIGN_CENTER
    if position == "top-right":
        rect = fitz.Rect(width * 0.4, margin, width - margin, margin + line_height)
        return rect, fitz.TEXT_ALIGN_RIGHT
    if position == "bottom-left":
        rect = fitz.Rect(margin, height - margin - line_height, width * 0.6, height - margin)
        return rect, fitz.TEXT_ALIGN_LEFT
    if position == "bottom-center":
        rect = fitz.Rect(width * 0.1, height - margin - line_height, width * 0.9, height - margin)
        return rect, fitz.TEXT_ALIGN_CENTER
    if position == "bottom-right":
        rect = fitz.Rect(width * 0.4, height - margin - line_height, width - margin, height - margin)
        return rect, fitz.TEXT_ALIGN_RIGHT
    if position == "diagonal":
        inset = min(width, height) * 0.18
        return fitz.Rect(inset, inset, width - inset, height - inset), fitz.TEXT_ALIGN_CENTER
    return fitz.Rect(width * 0.1, height * 0.4, width * 0.9, height * 0.6), fitz.TEXT_ALIGN_CENTER


def text_watermark(
    content: bytes,
    text: str,
    font_size: float,
    opacity: float,
    color: str,
    position: str,
    output_name: str = "watermarked.pdf",
) -> ProcessingResult:
    if not text or not text.strip():
        raise ProcessingError("Watermark text cannot be empty.")
    if position not in POSITIONS:
        raise ProcessingError(f"Watermark position must be one of: {', '.join(sorted(POSITIONS))}.")
    opacity = max(0.05, min(1.0, float(opacity)))
    font_size = max(8.0, min(200.0, float(font_size)))
    rgb = _parse_color(color)

    doc = open_pdf(content)
    margin = 32.0
    for page in doc:
        rect, align = _placement_rect(page.rect, font_size, margin, position)
        kwargs: dict = {
            "fontsize": font_size,
            "fontname": "helv",
            "color": rgb,
            "fill_opacity": opacity,
            "align": align,
        }
        if position == "diagonal":
            center = fitz.Point(page.rect.width / 2, page.rect.height / 2)
            kwargs["morph"] = (center, fitz.Matrix(45))
        page.insert_textbox(rect, text, **kwargs)

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message="Watermark applied to every page.",
    )


def image_watermark(
    content: bytes,
    logo: bytes,
    size: float,
    opacity: float,
    position: str,
    output_name: str = "watermarked.pdf",
) -> ProcessingResult:
    if position not in POSITIONS or position == "diagonal":
        raise ProcessingError("Image watermark position must be a corner or edge placement.")
    opacity = max(0.05, min(1.0, float(opacity)))
    size = max(16.0, min(600.0, float(size)))

    logo_stream = _apply_logo_opacity(logo, opacity)
    pix = fitz.Pixmap(logo_stream)
    if pix.width <= 0 or pix.height <= 0:
        raise ProcessingError("The logo image appears to be invalid.")
    aspect = pix.width / pix.height

    doc = open_pdf(content)
    margin = 24.0
    for page in doc:
        width, height = page.rect.width, page.rect.height
        w = size
        h = w / aspect
        if h > height * 0.85 or w > width * 0.85:
            scale = min((width * 0.85) / w, (height * 0.85) / h)
            w *= scale
            h *= scale
        x, y = _image_position(position, width, height, w, h, margin)
        page.insert_image(fitz.Rect(x, y, x + w, y + h), stream=logo_stream)

    with temp_workspace() as workspace:
        out_path = workspace / "result.pdf"
        save_document(doc, out_path, garbage=3, deflate=True)
        data = out_path.read_bytes()

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message="Logo watermark applied to every page.",
    )


def _apply_logo_opacity(logo: bytes, opacity: float) -> bytes:
    try:
        image = Image.open(io.BytesIO(logo))
        image.load()
    except Exception as exc:
        raise ProcessingError("The logo image could not be read.") from exc

    if image.mode not in ("RGBA", "LA"):
        image = image.convert("RGBA")
    r, g, b = image.getchannel("R"), image.getchannel("G"), image.getchannel("B")
    alpha = image.getchannel("A") if "A" in image.getbands() else Image.new("L", image.size, 255)
    alpha = alpha.point(lambda value: int(value * opacity))
    composited = Image.merge("RGBA", (r, g, b, alpha))

    buffer = io.BytesIO()
    composited.save(buffer, format="PNG")
    return buffer.getvalue()


def _image_position(position: str, page_w: float, page_h: float, w: float, h: float, margin: float) -> tuple[float, float]:
    positions: dict[str, tuple[float, float]] = {
        "top-left": (margin, margin),
        "top-center": ((page_w - w) / 2, margin),
        "top-right": (page_w - w - margin, margin),
        "center": ((page_w - w) / 2, (page_h - h) / 2),
        "bottom-left": (margin, page_h - h - margin),
        "bottom-center": ((page_w - w) / 2, page_h - h - margin),
        "bottom-right": (page_w - w - margin, page_h - h - margin),
    }
    x, y = positions.get(position, positions["center"])
    return x, y