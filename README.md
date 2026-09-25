# myPDFtools

A self-contained PDF toolbox: merge, split, rotate, extract, reorder, compress,
watermark, protect, unlock and inspect PDFs, plus Office/image conversions.

Modern rebuild of the original Express app as a full-stack application:

- **Backend** — Python **FastAPI** (PyMuPDF + pikepdf, LibreOffice for Office→PDF)
- **Frontend** — **React + TypeScript + Vite + Tailwind CSS** with pdf.js page previews

## Feature list

| Category | Tools |
| --- | --- |
| Organization | Merge, Split, Compress, Organize (drag-and-drop or keyboard page ordering) |
| Editing | Rotate, Extract, Delete pages, Text watermark, Logo watermark, Page numbers, Edit metadata |
| Security | Protect (AES-256), Unlock |
| Conversion | Word→PDF, Excel→PDF, PowerPoint→PDF (LibreOffice), PDF→Word |
| Images | JPG/PNG→PDF, PDF→JPG/PNG |
| Utility | PDF Inspector (page count, sizes, metadata, text layer, encryption) |
| OCR | OCR to PDF (searchable PDF), OCR to Text, OCR to Word (.docx) |
| AI | PDF Summary (grounded structured summary), Ask Questions with PDF (cited Q&A) |


## Project structure

```
backend/           FastAPI application
  app/             Settings, services, API routes, utilities
  tests/           pytest suite (39 tests)
  requirements.txt Runtime dependencies
frontend/          React + TypeScript + Vite SPA
scripts/           setup.ps1 / dev.ps1 (Windows)
docker/            Dockerfiles + nginx config
docker-compose.yml Two-container deployment (api + web)
```

## Quick start (Windows)

> Requirements: **Python 3.10+** and **Node.js 20+** on `PATH`.
> Office→PDF tools additionally need [LibreOffice](https://www.libreoffice.org)
> (optional — other tools work without it).

```powershell
# 1. One-time setup: Python venv + dependencies + frontend install
.\scripts\setup.ps1

# 2. Run both servers and open the app
.\scripts\dev.ps1
```

- App: http://localhost:5173
- API + Swagger docs: http://localhost:8000/docs

To quit, close the two background processes (or restart your terminal).

## Manual run (any OS)

**Backend:**

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate   |   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt    # only needed for tests
uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:8000`, so the frontend works with no
environment configuration. To talk to a backend on another host, create
`frontend/.env` with `VITE_API_URL=http://host:port` (see `frontend/.env.example`).

## Docker

```bash
docker compose up --build
```

The nginx container serves the built SPA on http://localhost:8080 and proxies
`/api` to the API container (which ships LibreOffice for Office→PDF). The API is
also exposed directly on http://localhost:8001/docs.

## Configuration

Backend settings come from environment variables or a `backend/.env` file
(see `backend/.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `MAX_FILE_SIZE_MB` | `50` | Per-file upload limit |
| `MAX_FILES` | `10` | Max files per multi-file request |
| `LIBREOFFICE_PATH` | auto-detect | Override LibreOffice executable |
| `GHOSTSCRIPT_PATH` | auto-detect | Override Ghostscript executable |
| `TEMP_DIR` / `OUTPUT_DIR` | `temp` / `output` | Runtime workspace locations |
| `TESSDATA_DIR` | `tessdata` | Tesseract language models directory |
| `API_KEY` | *(empty)* | Server-side key for AI intelligence (OpenAI / Groq / OpenRouter) |
| `AI_MODEL` | `gpt-4o-mini` | Model identifier for summaries and Q&A |
| `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible completions endpoint |
| `MAX_AI_DOCUMENT_PAGES` | `100` | Maximum pages processed per AI request |

## OCR Features

Native optical character recognition powered by PyMuPDF and Tesseract models without requiring GPU:

- **OCR to PDF**: Generates a searchable PDF by layering an invisible, selectable text layer over the exact original visual layout.
- **OCR to Text**: Extracts plain text structured by page boundaries (`--- Page 1 ---`, etc.) with one-click copy and `.txt` download.
- **OCR to Word**: Reconstructs paragraphs, headings, and page breaks into an editable Microsoft Word (`.docx`) file.
- **Supported Languages**: Built-in support for English (`eng`) and Hindi (`hin`), extensible via `.traineddata` files placed in `backend/tessdata/`.
- **Intelligent Pre-Check**: Warns users if a PDF already contains selectable digital text before running heavy OCR.
- **Limitations**: Extremely low-resolution scans, handwritten text, and multi-column tabular data may have degraded recognition quality.

## AI Document Intelligence

Provider-agnostic document analysis using strictly server-side keys:

- **PDF Summary**: Produces structured executive overviews, key takeaways, primary topics, and actionable items. Automatically triggers OCR if the document is scanned.
- **Ask Questions with PDF**: Conversational Q&A system grounded strictly in document excerpts with page number citations (`Page 2`, `Page 5`). If information cannot be found, it explicitly responds that it could not be found rather than hallucinating.
- **Privacy & Security**: Uploads are processed in temporary in-memory sessions (auto-expired after 15 minutes) and never saved permanently to disk or database. Prompts contain strict injection guardrails treating document text as untrusted content.
- **Configuration**: Set `API_KEY` in `backend/.env`. When `API_KEY` is not configured, the rest of the application functions normally and the AI tools display a helpful setup card.

## Tests

```bash
# Backend unit/integration tests (39 tests)
cd backend
.\.venv\Scripts\python.exe -m pytest          # Windows (49 tests)
python -m pytest                              # macOS/Linux

# Frontend typecheck, lint, unit tests and production build (100 tests)
cd ../frontend
npm run typecheck
npm run lint
npm test
npm run build
```

`scripts/verify_api.py` drives a running API end to end (real uploads, real
downloads, error cases) and reports per-checks pass/fail:

```bash
cd backend && ./.venv/bin/python ../scripts/verify_api.py   # API_BASE overrides http://127.0.0.1:8000
```

## Privacy by design

Uploads are validated (magic bytes, size limits), processed in isolated
temporary workspaces, and deleted automatically after each download. No
accounts, no database, no long-term storage.


See `backend/README.md` and `frontend/README.md` for component details.