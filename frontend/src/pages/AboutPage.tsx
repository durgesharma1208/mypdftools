import { Link } from 'react-router-dom';
import { Boxes, FileWarning, Gauge, ScanText, ServerCog, ShieldCheck } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../lib/tools';
import { ButtonLink } from '../components/ui/Button';

const STACK = [
  { label: 'Interface', value: 'React 18 · TypeScript · Vite · Tailwind CSS' },
  { label: 'Page previews', value: 'pdf.js, rendered locally in your browser' },
  { label: 'API', value: 'FastAPI with PyMuPDF, pikepdf, python-docx' },
  { label: 'OCR & AI', value: 'Tesseract OCR engine & provider-agnostic LLM integration' },
  { label: 'Optional binary', value: 'LibreOffice & Ghostscript, for Office → PDF and high compression' },
];

const PRINCIPLES = [
  {
    icon: ScanText,
    title: 'Preview before processing',
    body: 'Page tools render real thumbnails first, so selecting, reordering and checking a document is a visual task rather than a guess at page numbers.',
  },
  {
    icon: Gauge,
    title: 'No invented numbers',
    body: 'Uploads show genuine transfer progress. Compression reports the bytes it actually saved. When a value cannot be known, the interface does not pretend otherwise.',
  },
  {
    icon: ShieldCheck,
    title: 'Temporary by default',
    body: 'Uploads are validated by content, processed in a scoped workspace and deleted when the response is ready. Nothing is queued for later.',
  },
  {
    icon: ServerCog,
    title: 'Honest about dependencies',
    body: 'The API reports which optional binaries it can see. Tools that depend on a missing one are marked unavailable instead of failing after upload.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">About</p>
        <h1 className="mt-2 text-headline font-semibold text-ink">A small, complete PDF toolbox</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted text-wrap-pretty">
          MyPDFTools collects the document operations people actually need — {TOOLS.length} of them across{' '}
          {CATEGORIES.length} categories — and gives each one a calm, consistent workspace: add a file, choose the
          options, download the result.
        </p>
      </header>

      <section className="mt-10 border-t border-line pt-6" aria-labelledby="principles">
        <h2 id="principles" className="text-title font-semibold text-ink">
          Design principles
        </h2>
        <ul className="mt-5 grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <principle.icon className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
              <h3 className="mt-3 text-[15px] font-semibold text-ink">{principle.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted text-wrap-pretty">{principle.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-line pt-6" aria-labelledby="built-with">
        <h2 id="built-with" className="text-title font-semibold text-ink">
          How it is built
        </h2>
        <dl className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
          {STACK.map((row) => (
            <div key={row.label} className="grid gap-1 bg-surface p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-subtle">{row.label}</dt>
              <dd className="text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 border-t border-line pt-6" aria-labelledby="limitations">
        <h2 id="limitations" className="flex items-center gap-2 text-title font-semibold text-ink">
          <FileWarning className="h-4.5 w-4.5 text-caution" aria-hidden="true" />
          Real limitations
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
          <li className="flex gap-2.5">
            <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <span>
              <strong className="font-medium text-ink">Office conversion</strong> requires LibreOffice on the machine
              running the API. Without it, Word, Excel and PowerPoint tools stay disabled.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <span>
              <strong className="font-medium text-ink">PDF to Word</strong> exports the text layer only. Layout, tables and
              images are not reconstructed, and scanned PDFs have no text to export.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <span>
              <strong className="font-medium text-ink">Scanned documents</strong> need the OCR tools to generate a selectable
              searchable text layer before text export or search can function.
            </span>
          </li>
          <li className="flex gap-2.5">
            <Boxes className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
            <span>
              <strong className="font-medium text-ink">Compression is not magic.</strong> Savings depend on the original
              file; already optimised PDFs may shrink very little.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          More detail on how files are handled is on the{' '}
          <Link to="/privacy" className="link">
            privacy page
          </Link>
          .
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink to="/tools" variant="primary">
          Explore the tools
        </ButtonLink>
        <ButtonLink to="/privacy" variant="secondary">
          How files are handled
        </ButtonLink>
      </div>
    </div>
  );
}
