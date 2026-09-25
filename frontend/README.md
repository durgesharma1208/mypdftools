# myPDFtools — Frontend

React 18 + TypeScript + Vite + Tailwind single-page app for the myPDFtools API.

## Stack

- **Vite 5** dev server with an `/api → http://localhost:8000` proxy (`vite.config.ts`)
- **react-router-dom 6** routes: `/`, `/tools`, `/tools/:slug`, `/about`, `/privacy`, `404`
- **pdf.js** (`pdfjs-dist` v4) for client-side page previews (view / select / reorder),
  loaded lazily so it never ships on the home page
- **Tailwind** design tokens in `tailwind.config.js` + CSS variables in `src/index.css`
  (warm off-white light theme, near-black dark theme, one accent, `.dark` class toggle)

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Scripts:

```bash
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint (flat config, TypeScript + react-hooks)
npm run build      # tsc -b && vite build → dist/
npm test           # vitest run (jsdom + Testing Library)
npm run preview    # serve the production build
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed — all variables are optional:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | empty (same origin) | Absolute API base, e.g. `http://localhost:8000` when not using the proxy |
| `VITE_DEV_PORT` | `5173` | Dev server port |
| `VITE_PREVIEW_PORT` | `4173` | `vite preview` port |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:8000` | Where `/api` is proxied in dev |
| `VITE_DEV_ALLOWED_HOSTS` | any host | Comma-separated `Host` allowlist for dev/preview |

## Structure

```
src/
  lib/tools.ts            Single source of truth for the 20 tools (endpoint, fields, params, preview mode)
  lib/api.ts              Central API client: uploadForm() (XHR + progress + cancel), postFormJson(), fetchPdfInfo()
  lib/validation.ts       Client-side file/param validation (magic-byte type checks, 50 MB, per-tool limits)
  lib/pdf.ts              pdf.js worker setup, thumbnail caps, page-number helpers
  lib/files.ts            File → ArrayBuffer helpers (reads via FileReader, keeps jsdom/older browsers happy)
  lib/utils.ts            cn(), formatBytes(), downloadBlob(), uniqueId(), …
  hooks/                  useTheme, useServerStatus, useToast, usePdfDocument
  components/
    layout/               Layout, Header (nav + mobile menu), Footer, Logo, ErrorBoundary, ServerStatusPill
    ui/                   Button/ButtonLink, Spinner, Badge, Alert, Dropzone, FileList, Field, ResultCard, EmptyState, LogoPicker
    pdf/                  PageGrid (view / select / order), PdfThumbnail
    tools/                ToolCard
  features/workspace/
    useWorkspace.ts       File + option state machine (idle → ready → uploading → processing → done/error)
    Workspace.tsx         Dispatches to ToolWorkspace / InspectorWorkspace / MetadataWorkspace
    ToolWorkspace.tsx     Standard upload → options → process → result flow
    OptionsPanel.tsx      Renders tool params (select, range, text, color, logo, page pickers)
    ActionPanel.tsx       Primary action, validation summary, blocked-reason messaging
    ProcessingPanel.tsx   Determinate upload progress + indeterminate server phase
    ToolFacts.tsx         "Tool details" panel: supported files, output, requirements
  pages/                  HomePage, ToolsPage, ToolPage, AboutPage, PrivacyPage, NotFoundPage
  types/index.ts          Shared domain types
```

## How a tool page works

1. `tools.ts` describes each tool: endpoint, multipart `fileField`, options (type, default,
   validation), preview mode (`view` / `select` / `order` / `first-pages`) and workspace kind.
2. `useWorkspace` validates files client-side (extension + magic bytes, 50 MB, per-tool count),
   derives page-selection/order params from the live preview, then uploads via `uploadForm()`.
3. Success renders a `ResultCard` with the operation message from the `X-Result-Message`
   response header, the output filename and the blob download; errors render human-readable
   copy from the API error envelope (`{error, detail, type}`) — never a stack trace.

## Tests

```bash
npm test
```

Vitest + jsdom + Testing Library. Coverage includes the API client (multipart payloads,
error mapping, blob downloads), tool catalog ↔ backend route contract, validation rules,
the upload state machine, the workspace UI, the tool library search/filter and the app shell.
