# myPDFtools — Backend

FastAPI application implementing every PDF operation. Dependencies:

- **PyMuPDF** (`pymupdf`) — page rendering, extraction, watermarking, page numbers, image export, info
- **pikepdf** — lossless merge/split/rotate/compress, protection, metadata
- **python-docx** — PDF→Word text export
- **LibreOffice** (optional) — Word/Excel/PowerPoint→PDF

## Layout

```
app/
  core/config.py        Pydantic-settings config (.env aware)
  core/errors.py        PDFToolError hierarchy (ProcessingError → 400)
  core/security.py      Safe filenames, path traversal guard
  utils/validation.py   Magic-byte checks for PDF/JPG/PNG/OLE/ZIP
  utils/file_utils.py   Safe helper for reading uploads
  utils/cleanup.py      temp_workspace() context + startup sweeper
  services/             One module per feature (merge, split, compress, …)
  api/routes/           REST endpoints: pdf.py, conversion.py, health.py
  api/deps.py           Upload helpers, file responses, file-count guard
  main.py               App factory, CORS, error handlers, lifespan cleanup
tests/                  pytest suite (needs requirements-dev.txt)
```

## Run

```bash
cd backend
python -m venv .venv
# activate venv (see root README)
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000
```

## API

Interactive docs: http://localhost:8000/docs (OpenAPI JSON at `/openapi.json`).

All 22 endpoints return files as binary responses with RFC 5987
`Content-Disposition` filenames and an `X-Result-Message` header (used by the
frontend for feedback like compression savings). Errors use the shape:

```json
{ "error": "Human readable message", "detail": "…", "type": "error_type" }
```

Dependency-aware health: `GET /api/health` reports PDF engine, LibreOffice and
Ghostscript availability without leaking system details.

## Available endpoints

- `POST /api/pdf/merge|split|rotate|extract|delete-pages|organize|watermark|image-watermark|page-numbers|compress|protect|unlock|info|metadata`
- `POST /api/convert/word-to-pdf|excel-to-pdf|ppt-to-pdf|pdf-to-word|jpg-to-pdf|pdf-to-jpg`

## Tests

```bash
python -m pytest
```

Fixtures in `tests/conftest.py` build in-memory 2–3 page PDFs, images, an
AES-protected PDF (`secret123`) and a .docx, so the suite runs with no system
dependencies. Run `python -m pytest -q` for a quieter run.