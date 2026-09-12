import { Link } from 'react-router-dom';
import { ArrowRight, Info, ShieldCheck } from 'lucide-react';
import type { Tool } from '../../types';
import { Alert } from '../../components/ui/Alert';
import { relatedTools } from '../../lib/tools';
import { acceptedSummary, maxFilesFor, type UploadLimits } from '../../lib/validation';

interface ToolFactsProps {
  tool: Tool;
  limits: UploadLimits;
  /** False when the server reported the required binary is missing. */
  dependencyAvailable: boolean | null;
}

export function ToolFacts({ tool, limits, dependencyAvailable }: ToolFactsProps) {
  const dependencyMissing = tool.requires === 'office' && dependencyAvailable === false;
  const related = relatedTools(tool, 3);

  return (
    <div className="space-y-4">
      {dependencyMissing && (
        <Alert tone="warning" title="Not available on this server">
          This tool needs LibreOffice installed on the processing server. Everything else continues to work — the button
          stays disabled until the server reports it is ready.
        </Alert>
      )}

      <section className="panel p-4" aria-labelledby="tool-details">
        <h2 id="tool-details" className="text-sm font-semibold text-ink">
          Tool details
        </h2>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-subtle">Accepts</dt>
            <dd className="text-right text-ink">{tool.inputLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-subtle">Produces</dt>
            <dd className="text-right text-ink">{tool.outputLabel}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-subtle">Per request</dt>
            <dd className="text-right text-ink tabular">{maxFilesFor(tool, limits)} file{maxFilesFor(tool, limits) === 1 ? '' : 's'}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-subtle">Size limit</dt>
            <dd className="text-right text-ink tabular">{limits.maxFileSizeMb} MB each</dd>
          </div>
        </dl>
        <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-subtle">{acceptedSummary(tool, limits)}</p>
      </section>

      {tool.notes && tool.notes.length > 0 && (
        <section className="panel p-4" aria-labelledby="tool-notes">
          <h2 id="tool-notes" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Info className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
            Good to know
          </h2>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-muted">
            {tool.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-line-strong" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel p-4" aria-labelledby="tool-privacy">
        <h2 id="tool-privacy" className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-positive" aria-hidden="true" />
          Handling
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Your file is validated, processed in an isolated temporary workspace, and deleted as soon as the response is
          generated. Nothing is stored and no account is required.
        </p>
      </section>

      {related.length > 0 && (
        <section className="panel p-4" aria-labelledby="tool-related">
          <h2 id="tool-related" className="text-sm font-semibold text-ink">
            Works well with
          </h2>
          <ul className="mt-3 space-y-1">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  to={`/tools/${item.slug}`}
                  className="group flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                  <span className="flex-1 truncate">{item.name}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-ink-subtle transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
