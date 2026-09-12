import { useId, useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { ToolParam } from '../../types';
import { cn } from '../../lib/utils';

const CONTROL =
  'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-ink-subtle hover:border-line-strong focus:border-accent focus:outline-none';

interface FieldShellProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  aside?: ReactNode;
  children: ReactNode;
}

export function FieldShell({ label, htmlFor, hint, error, aside, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-ink-subtle">{hint}</p>}
      {error && <p className="text-xs font-medium leading-relaxed text-critical">{error}</p>}
    </div>
  );
}

const COLOR_PRESETS = ['#9CA3AF', '#1F2937', '#B91C1C', '#1D4ED8', '#15803D'];

interface FieldProps {
  param: ToolParam;
  value: string | number | boolean;
  disabled?: boolean;
  onChange: (value: string | number | boolean) => void;
}

/** Renders one tool parameter as an accessible, theme-aware control. */
export function Field({ param, value, disabled, onChange }: FieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const description = param.description;

  if (param.type === 'checkbox') {
    const checked = Boolean(value);
    return (
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2.5',
          'transition-colors hover:border-line-strong',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className="text-sm font-medium text-ink">{param.label}</span>
        <span className="relative inline-flex shrink-0 items-center">
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="flex h-5 w-9 items-center rounded-full border border-line-strong bg-surface-muted px-0.5 transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out peer-checked:translate-x-4" />
          </span>
        </span>
      </label>
    );
  }

  if (param.type === 'select') {
    const selected = param.options?.find((option) => option.value === String(value));
    return (
      <FieldShell label={param.label} htmlFor={id} hint={selected?.description ?? description}>
        <span className="relative block">
          <select
            id={id}
            className={cn(CONTROL, 'appearance-none pr-9')}
            value={String(value ?? '')}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </FieldShell>
    );
  }

  if (param.type === 'range') {
    const numeric = Number(value);
    return (
      <FieldShell
        label={param.label}
        htmlFor={id}
        hint={description}
        aside={
          <output htmlFor={id} className="rounded-sm border border-line bg-surface-muted px-1.5 py-0.5 text-xs text-ink-muted tabular">
            {numeric}
            {param.unit ? ` ${param.unit}` : ''}
          </output>
        }
      >
        <input
          id={id}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={Number.isFinite(numeric) ? numeric : Number(param.min ?? 0)}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-accent"
        />
      </FieldShell>
    );
  }

  if (param.type === 'color') {
    return (
      <FieldShell label={param.label} htmlFor={id} hint={description}>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={String(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="h-9 w-11 cursor-pointer rounded-md border border-line bg-surface p-1"
          />
          <input
            type="text"
            aria-label={`${param.label} hex value`}
            value={String(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className={cn(CONTROL, 'w-28 font-mono uppercase')}
          />
          <div className="flex items-center gap-1.5 pl-1">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Use ${preset}`}
                onClick={() => onChange(preset)}
                style={{ backgroundColor: preset }}
                className={cn(
                  'h-4 w-4 rounded-full border border-line-strong transition-transform hover:scale-110',
                  String(value).toUpperCase() === preset && 'ring-2 ring-accent ring-offset-1 ring-offset-surface',
                )}
              />
            ))}
          </div>
        </div>
      </FieldShell>
    );
  }

  if (param.type === 'password') {
    return (
      <FieldShell label={param.label} htmlFor={id} hint={description}>
        <span className="relative block">
          <input
            id={id}
            type={revealed ? 'text' : 'password'}
            value={String(value ?? '')}
            placeholder={param.placeholder}
            required={param.required}
            disabled={disabled}
            autoComplete="new-password"
            onChange={(event) => onChange(event.target.value)}
            className={cn(CONTROL, 'pr-10')}
          />
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1.5 text-ink-subtle transition-colors hover:text-ink"
          >
            {revealed ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </span>
      </FieldShell>
    );
  }

  const isNumber = param.type === 'number';

  return (
    <FieldShell label={param.label} htmlFor={id} hint={description}>
      <input
        id={id}
        type={isNumber ? 'number' : 'text'}
        inputMode={isNumber ? 'numeric' : undefined}
        min={isNumber ? param.min : undefined}
        max={isNumber ? param.max : undefined}
        value={String(value ?? '')}
        placeholder={param.placeholder}
        required={param.required}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(isNumber ? (raw === '' ? '' : Number(raw)) : raw);
        }}
        className={cn(CONTROL, isNumber && 'tabular')}
      />
    </FieldShell>
  );
}
