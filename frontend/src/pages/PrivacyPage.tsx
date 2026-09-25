import type { ReactNode } from 'react';
import { ServerStatusPill } from '../components/layout/ServerStatusPill';
import { ButtonLink } from '../components/ui/Button';

const SECTIONS: { title: string; body: ReactNode[] }[] = [
  {
    title: 'What is sent to the server',
    body: [
      'Only the files you choose, plus the options you set for that specific operation. There is no account, no profile and no session that links one request to the next.',
      'Nothing is uploaded until you press the tool’s action button. Previews, thumbnails, page counts and metadata tables are rendered locally in your browser with pdf.js.',
    ],
  },
  {
    title: 'How long your file exists',
    body: [
      'Uploads are read into memory, written into an isolated temporary workspace only when an operation needs a file on disk, and removed when the request finishes — including when processing fails.',
      'The API also sweeps the temporary directory on start-up and discards anything older than an hour, so interrupted requests cannot leave files behind.',
      'Results are streamed back to your browser. There is no download link that stays valid afterwards, and no history of your files.',
    ],
  },
  {
    title: 'What is stored in your browser',
    body: [
      'One localStorage entry records whether you prefer the light or dark theme. Nothing else is persisted: no analytics identifiers, no cookies, and no third-party scripts.',
      'The interface loads its typeface from the bundle it ships with, so opening a page does not contact a font CDN.',
    ],
  },
  {
    title: 'Limits and honesty',
    body: [
      'Uploads are capped by the server (50 MB per file and 10 files per request by default) and checked twice: in your browser for fast feedback, and again on the server, which also verifies file contents rather than trusting the file extension.',
      'If a tool depends on software the server does not have — for example LibreOffice for Office conversions — the tool page says so instead of failing after you upload.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-2 text-headline font-semibold text-ink">Short-lived files, no tracking</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted text-wrap-pretty">
          MyPDFTools is a document processor, not a data collection product. This page describes exactly what happens to
          a file, and what is kept afterwards.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title} className="border-t border-line pt-6">
            <h2 className="text-title font-semibold text-ink">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.body.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-ink-muted text-wrap-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 panel p-5">
        <p className="text-sm font-semibold text-ink">Current server status</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          Status is read from the API itself, so what you see here reflects the server you are actually talking to.
        </p>
        <div className="mt-3">
          <ServerStatusPill showDetails />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/tools" variant="primary">
          Browse the tools
        </ButtonLink>
        <ButtonLink to="/about" variant="secondary">
          Read about the project
        </ButtonLink>
      </div>
    </div>
  );
}
