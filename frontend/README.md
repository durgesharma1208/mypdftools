# myPDFtools — Frontend

React 18 + TypeScript + Vite + Tailwind single-page app.

## Stack

- **Vite 5** dev server with a `/api → http://localhost:8000` proxy (`vite.config.ts`)
- **react-router-dom** routes: home, `/tools/:slug`, `/about`, 404
- **pdf.js** (`pdfjs-dist` v4) for client-side page previews (view / select / reorder)
- **Tailwind** design tokens in `tailwind.config.js` (brand indigo/violet palette, dark mode via `.dark` class)

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Build & typecheck:

```bash
npm run typecheck
npm run build      # outputs to dist/
```

Pointing the frontend at a non-default API: copy `.env.example` to `.env` and set
`VITE_API_URL` (defaults to same-origin `/api`).

## Structure

```
src/
  lib/tools.ts          Single source of truth for all 20 tools (fields, params, preview mode)
  lib/pdf.ts            pdf.js worker setup + preview caps
  lib/utils.ts          cn(), formatBytes(), downloadBlob(), …
  services/api.ts       uploadForm() (XHR + progress), postFormJson(), fetchPdfInfo()
  hooks/                useTheme, usePdfDocument
  components/
    layout/             Header (search event), Footer, Logo, Layout
    ui/                 Button, Spinner, Badge, Dropzone, FileList, Field, LogoField, Alert, ResultPanel
    pdf/                PdfThumbnail, PagePreviewPanel
    tools/              ToolCard
  features/workspace/
    useWorkspace.ts     Client validation + upload state machine (idle→ready→uploading→preparing→done/error)
    Workspace.tsx       Standard / info / metadata tool modes + live preview UIs
  pages/                HomePage, ToolPage, AboutPage, NotFoundPage
  types/index.ts        Shared domain types
```

## How a tool page works

1. `tools.ts` describes the tool: endpoint, multipart `fileField`, params (select/range/color/…),
   preview mode (`view`, `select`, `order`, `first-pages`) and mode (`standard`/`info`/`metadata`).
2. `useWorkspace` validates files client-side (magic-extension checks, 50 MB, per-tool max count),
   assembles the `FormData` (auto-populating page selection/order params from the preview),
   then uploads with real progress.
3. Done → the returned blob is downloaded straight from memory; the temp file was already
   deleted server-side.

## Privacy

No tracking scripts, no cookies, no external calls except the backend API you point at.