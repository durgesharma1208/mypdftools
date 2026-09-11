"""Convert between images and PDFs."""

import zipfile
from pathlib import Path

import pymupdf as fitz

from app.core.errors import ProcessingError
from app.services.pdf_base import ProcessingResult, open_pdf, save_document
from app.utils.cleanup import temp_workspace

A4_PORTRAIT = (595.28, 841.89)
A4_LANDSCAPE = (841.89, 595.28)


def _paper_dimensions(orientation: str, image_width: int, image_height: int) -> tuple[float, float]:
    if orientation == "auto":
        orientation = "landscape" if image_width > image_height else "portrait"
    if orientation == "landscape":
        return A4_LANDSCAPE
    return A4_PORTRAIT


def images_to_pdf(
    images: list[tuple[str, bytes]],
    page_size: str,
    orientation: str,
    output_name: str = "images.pdf",
) -> ProcessingResult:
    if not images:
        raise ProcessingError("Select at least one image to convert.")
    if page_size not in {"auto", "a4"}:
        raise ProcessingError("Page size must be 'auto' or 'a4'.")
    if orientation not in {"auto", "portrait", "landscape"}:
        raise ProcessingError("Orientation must be 'auto', 'portrait' or 'landscape'.")

    doc = fitz.open()
    try:
        for _, content in images:
            try:
                pix = fitz.Pixmap(content)
            except Exception as exc:
                raise ProcessingError("One of the uploaded images is invalid or unsupported.") from exc
            width, height = pix.width, pix.height
            if width <= 0 or height <= 0:
                raise ProcessingError("One of the uploaded images has invalid dimensions.")

            if page_size == "a4":
                page_w, page_h = _paper_dimensions(orientation, width, height)
            else:
                page_w, page_h = width, height

            page = doc.new_page(width=page_w, height=page_h)
            scale = min(page_w / width, page_h / height, 1.0) * 0.98
            draw_w, draw_h = width * scale, height * scale
            x, y = (page_w - draw_w) / 2, (page_h - draw_h) / 2
            page.insert_image(fitz.Rect(x, y, x + draw_w, y + draw_h), stream=content)

        with temp_workspace() as workspace:
            out_path = workspace / "result.pdf"
            save_document(doc, out_path, garbage=4, deflate=True)
            data = out_path.read_bytes()
    except Exception:
        doc.close()
        raise

    return ProcessingResult(
        data=data,
        filename=str(Path(output_name).name),
        media_type="application/pdf",
        message=f"Converted {len(images)} image{'s' if len(images) != 1 else ''} to PDF at full resolution.",
    )


def pdf_to_images(content: bytes, dpi: int, fmt: str, output_name: str = "images") -> ProcessingResult:
    if fmt not in {"jpg", "png"}:
        raise ProcessingError("Output format must be 'jpg' or 'png'.")
    dpi = max(72, min(400, int(dpi)))
    zoom = dpi / 72.0

    doc = open_pdf(content)
    with temp_workspace() as workspace:
        paths: list[Path] = []
        for index in range(doc.page_count):
            page = doc.load_page(index)
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
            extension = "jpg" if fmt == "jpg" else "png"
            image_path = workspace / f"page_{index + 1}.{extension}"
            pix.save(image_path, jpg_quality=92)
            paths.append(image_path)
        doc.close()

        archive = workspace / f"{Path(output_name).stem}_images.zip"
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
            for path in paths:
                zf.write(path, arcname=path.name)
        data = archive.read_bytes()

    return ProcessingResult(
        data=data,
        filename=f"{Path(output_name).stem}_images.zip",
        media_type="application/zip",
        message=f"Rendered {len(paths)} page{'s' if len(paths) != 1 else ''} at {dpi} DPI.",
    )