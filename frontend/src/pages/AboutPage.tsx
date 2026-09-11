import { LineChart, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../lib/tools';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    body: 'No accounts, no analytics, no storage. Every file lives in a temporary workspace that is deleted automatically shortly after your download is produced.',
  },
  {
    icon: Zap,
    title: 'Local-first processing',
    body: 'The engine runs PyMuPDF and pikepdf directly on your hardware (or your own server). Nothing is sent to a third-party cloud service.',
  },
  {
    icon: LineChart,
    title: 'Honest results',
    body: 'Compression reports real space saved, office conversions surface clear messages when a dependency is missing, and scanned PDFs are labelled honestly.',
  },
];

function Pillar({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-surface-line bg-surface p-6 dark:border-surface-line-dark dark:bg-surface-dark">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{body}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          A PDF toolbox that treats your documents like your PII.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          myPDFtools is a self-contained PDF utility suite: {TOOLS.length} tools for merging, splitting, editing, securing,
          converting and inspecting PDFs — rebuilt from the ground up as a modern web app with a FastAPI engine and a
          React interface.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Pillar key={pillar.title} {...pillar} />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">What is in the box</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                to={`/tools/${tool.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-surface-line bg-surface px-4 py-3 transition-colors hover:border-brand-300 dark:border-surface-line-dark dark:bg-surface-dark dark:hover:border-brand-500/50"
              >
                <tool.icon className="h-4 w-4 shrink-0 text-brand-500 dark:text-brand-400" aria-hidden="true" />
                <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 dark:text-zinc-200 dark:group-hover:text-white">
                  {tool.name}
                </span>
                <span className="ml-auto hidden truncate pl-4 text-xs text-zinc-400 dark:text-zinc-500 sm:block">{tool.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-surface-line bg-surface p-6 dark:border-surface-line-dark dark:bg-surface-dark">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Open data contract</h2>
        <p className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-panel px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-surface-panel dark:text-zinc-400">
            FastAPI · REST API
          </span>
          <span className="rounded-full bg-surface-panel px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-surface-panel dark:text-zinc-400">
            PyMuPDF · pikepdf · python-docx
          </span>
          <span className="rounded-full bg-surface-panel px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-surface-panel dark:text-zinc-400">
            LibreOffice for Office → PDF
          </span>
          <span className="rounded-full bg-surface-panel px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-surface-panel dark:text-zinc-400">
            React · TypeScript · Tailwind · pdf.js previews
          </span>
        </p>
      </section>
    </div>
  );
}