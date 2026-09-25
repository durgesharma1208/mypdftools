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

<<<<<<< HEAD
const inputClasses =
  'w-full rounded-xl border border-surface-line bg-surface-panel px-3 py-2.5 text-sm text-zinc-900 shadow-none transition-all duration-150 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/15 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-400';

const labelClasses = 'block text-sm font-medium text-zinc-700 dark:text-zinc-200';
const descClasses = 'mt-1 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500';

=======
/** Renders one tool parameter as an accessible, theme-aware control. */
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
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
<<<<<<< HEAD
          'flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-surface-line bg-surface-panel px-4 py-3 transition-colors duration-150 select-none',
          'hover:border-brand-300/60 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:hover:border-brand-500/30',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className={labelClasses}>{param.label}</span>
        <span
          className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 data-[checked=true]:bg-brand-600 bg-zinc-300 dark:bg-zinc-700"
          data-checked={Boolean(value)}
        >
=======
          'flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2.5',
          'transition-colors hover:border-line-strong',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <span className="text-sm font-medium text-ink">{param.label}</span>
        <span className="relative inline-flex shrink-0 items-center">
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
          />
<<<<<<< HEAD
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
=======
          <span className="flex h-5 w-9 items-center rounded-full border border-line-strong bg-surface-muted px-0.5 transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out peer-checked:translate-x-4" />
          </span>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
        </span>
      </label>
    );
  }

  if (param.type === 'select') {
<<<<<<< HEAD
    const activeDescription = param.options?.find((opt) => opt.value === value)?.description;
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={labelClasses}>{param.label}</label>
        <div className="relative">
          <select
            id={id}
            className={cn(inputClasses, 'appearance-none pr-8 cursor-pointer')}
            value={String(value)}
=======
    const selected = param.options?.find((option) => option.value === String(value));
    return (
      <FieldShell label={param.label} htmlFor={id} hint={selected?.description ?? description}>
        <span className="relative block">
          <select
            id={id}
            className={cn(CONTROL, 'appearance-none pr-9')}
            value={String(value ?? '')}
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
<<<<<<< HEAD
          {/* Custom chevron */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        {activeDescription && (
          <p className={descClasses}>{activeDescription}</p>
        )}
      </div>
=======
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
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    );
  }

  if (param.type === 'range') {
    const numeric = Number(value);
    return (
<<<<<<< HEAD
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={labelClasses}>{param.label}</span>
          <span className="rounded-md border border-surface-line bg-surface-panel px-2 py-0.5 font-mono text-xs font-semibold text-brand-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-brand-300">
            {value}
          </span>
        </div>
=======
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
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
        <input
          id={id}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={Number.isFinite(numeric) ? numeric : Number(param.min ?? 0)}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
<<<<<<< HEAD
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>{param.min}</span>
          <span>{param.max}</span>
        </div>
      </div>
=======
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-accent"
        />
      </FieldShell>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    );
  }

  if (param.type === 'color') {
    return (
<<<<<<< HEAD
      <div className="space-y-1.5">
        <span className={labelClasses}>{param.label}</span>
        <div className="flex items-center gap-3">
          <label
            htmlFor={id}
            className="relative cursor-pointer overflow-hidden rounded-lg border-2 border-surface-line transition-colors hover:border-brand-300 dark:border-surface-line-dark"
          >
            <input
              id={id}
              type="color"
              value={String(value)}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
              className="h-9 w-12 cursor-pointer border-0 bg-transparent p-0 opacity-0 absolute inset-0"
            />
            <span
              className="block h-9 w-12 rounded-md"
              style={{ background: String(value) }}
              aria-hidden="true"
            />
          </label>
          <span className="rounded-lg border border-surface-line bg-surface-panel px-3 py-2 font-mono text-xs text-zinc-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-300">
            {String(value).toUpperCase()}
          </span>
        </div>
      </div>
=======
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
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
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
<<<<<<< HEAD
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClasses}>{param.label}</label>
=======
    <FieldShell label={param.label} htmlFor={id} hint={description}>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
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
<<<<<<< HEAD
      {param.description && <p className={descClasses}>{param.description}</p>}
    </div>
  );
}

export function LogoField({
  param,
  disabled,
  onPick,
}: {
  param: ToolParam;
  disabled?: boolean;
  onPick: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <span className={labelClasses}>{param.label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-line bg-surface-panel px-4 py-3 text-sm font-medium text-zinc-500 transition-all duration-150 hover:border-brand-400/60 hover:text-brand-600 disabled:opacity-50 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M18.75 11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        Choose logo image
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
=======
    </FieldShell>
  );
}
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
