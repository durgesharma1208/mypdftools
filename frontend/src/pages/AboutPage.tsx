import { LineChart, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../lib/tools';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    body: 'No accounts, no analytics, no storage. Every file lives in a temporary workspace that is deleted automatically shortly after your download is produced.',
    color: 'emerald',
  },
  {
    icon: Zap,
    title: 'Local-first processing',
    body: 'The engine runs PyMuPDF and pikepdf directly on your hardware (or your own server). Nothing is sent to a third-party cloud service.',
    color: 'sky',
  },
  {
    icon: LineChart,
    title: 'Honest results',
    body: 'Compression reports real space saved, office conversions surface clear messages when a dependency is missing, and scanned PDFs are labelled honestly.',
    color: 'violet',
  },
];

const PILLAR_COLORS: Record<string, { icon: string; number: string }> = {
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    number: 'text-emerald-500',
  },
  sky: {
    icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    number: 'text-sky-500',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    number: 'text-violet-500',
  },
};

const TECH_STACK = [
  { name: 'FastAPI', description: 'REST API backend' },
  { name: 'PyMuPDF', description: 'PDF rendering & manipulation' },
  { name: 'Tesseract OCR', description: 'Searchable PDF & text recognition' },
  { name: 'AI Engine', description: 'Grounded summarization & Q&A' },
  { name: 'pikepdf', description: 'Low-level PDF operations' },
  { name: 'python-docx', description: 'Word document generation' },
  { name: 'LibreOffice', description: 'Office → PDF conversion' },
  { name: 'React 18', description: 'Frontend framework' },
  { name: 'TypeScript', description: 'Type-safe code' },
  { name: 'Tailwind CSS', description: 'Utility-first styling' },
  { name: 'pdf.js', description: 'In-browser PDF previews' },
];


export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      {/* Hero section */}
      <section className="max-w-3xl">
        <span className="section-label">About MyPDFTools</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          A PDF toolbox that treats your documents like your PII.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
          myPDFtools is a self-contained PDF utility suite — {TOOLS.length} tools for merging, splitting,
          editing, securing, converting and inspecting PDFs — rebuilt from the ground up as a modern
          web app with a FastAPI engine and a React interface.
        </p>
      </section>

      {/* Pillars */}
      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon;
          const colors = PILLAR_COLORS[pillar.color];
          return (
            <div
              key={pillar.title}
              className="animate-fade-up rounded-2xl border border-surface-line bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card dark:border-surface-line-dark dark:bg-surface-dark"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors?.icon ?? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{pillar.body}</p>
            </div>
          );
        })}
      </section>

      {/* What's in the box */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            What's in the box
          </h2>
          <span className="chip">{TOOLS.length} tools</span>
        </div>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <li key={tool.slug}>
                <Link
                  to={`/tools/${tool.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-surface-line bg-surface px-4 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-soft dark:border-surface-line-dark dark:bg-surface-dark dark:hover:border-brand-500/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/8 text-brand-600 transition-all duration-150 group-hover:bg-brand-gradient group-hover:text-white dark:text-brand-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-zinc-800 group-hover:text-zinc-900 dark:text-zinc-200 dark:group-hover:text-white">
                      {tool.name}
                    </span>
                    <span className="block truncate text-xs text-zinc-400 dark:text-zinc-500">
                      {tool.short}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-zinc-600" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Tech stack */}
      <section className="mt-14">
        <div className="rounded-2xl border border-surface-line bg-surface p-6 dark:border-surface-line-dark dark:bg-surface-dark">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Open tech stack</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Built with open-source tools you can inspect and trust.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-3 rounded-xl border border-surface-line bg-surface-panel px-4 py-3 dark:border-surface-line-dark dark:bg-surface-panel-dark"
              >
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{tech.name}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}