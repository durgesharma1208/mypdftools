# myPDFtools

A self-contained PDF toolbox: merge, split, rotate, extract, reorder, compress,
watermark, protect, unlock and inspect PDFs, plus Office/image conversions.

Modern rebuild of the original Express app as a full-stack application:

- **Backend** — Python **FastAPI** (PyMuPDF + pikepdf, LibreOffice for Office→PDF)
- **Frontend** — **React + TypeScript + Vite + Tailwind CSS** with pdf.js page previews

## Feature list

| Category | Tools |
| --- | --- |
| Organization | Merge, Split, Compress, Organize (drag-and-drop page ordering) |
| Editing | Rotate, Extract, Delete pages, Text watermark, Logo watermark, Page numbers, Edit metadata |
| Security | Protect (AES-256), Unlock |
| Conversion | Word→PDF, Excel→PDF, PowerPoint→PDF (LibreOffice), PDF→Word |
| Images | JPG/PNG→PDF, PDF→JPG/PNG |
| Utility | PDF Inspector (page count, sizes, metadata, text layer, encryption) |

## Project structure

```
backend/           FastAPI application
  app/             Settings, services, API routes, utilities
  tests/           pytest suite (36 tests)
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

## Tests

```bash
cd backend
.\.venv\Scripts\python.exe -m pytest          # Windows
python -m pytest                              # macOS/Linux
```

## Privacy by design

Uploads are validated (magic bytes, size limits), processed in isolated
temporary workspaces, and deleted automatically after each download. No
accounts, no database, no long-term storage.

See `backend/README.md` and `frontend/README.md` for component details.