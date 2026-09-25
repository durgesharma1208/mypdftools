import { useId, useRef } from 'react';
import type { ToolParam } from '../../types';
import { cn } from '../../lib/utils';

interface FieldProps {
  param: ToolParam;
  value: string | number | boolean;
  disabled?: boolean;
  onChange: (value: string | number | boolean) => void;
}

const inputClasses =
  'w-full rounded-xl border border-surface-line bg-surface-panel px-3 py-2.5 text-sm text-zinc-900 shadow-none transition-all duration-150 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/15 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-brand-400';

const labelClasses = 'block text-sm font-medium text-zinc-700 dark:text-zinc-200';
const descClasses = 'mt-1 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500';

export function Field({ param, value, disabled, onChange }: FieldProps) {
  const id = useId();

  if (param.type === 'checkbox') {
    return (
      <label
        htmlFor={id}
        className={cn(
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
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={Boolean(value)}
            onChange={() => onChange(!value)}
          />
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
        </span>
      </label>
    );
  }

  if (param.type === 'select') {
    const activeDescription = param.options?.find((opt) => opt.value === value)?.description;
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={labelClasses}>{param.label}</label>
        <div className="relative">
          <select
            id={id}
            className={cn(inputClasses, 'appearance-none pr-8 cursor-pointer')}
            value={String(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
    );
  }

  if (param.type === 'range') {
    const numeric = Number(value);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={labelClasses}>{param.label}</span>
          <span className="rounded-md border border-surface-line bg-surface-panel px-2 py-0.5 font-mono text-xs font-semibold text-brand-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-brand-300">
            {value}
          </span>
        </div>
        <input
          id={id}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={numeric}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-brand-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
          <span>{param.min}</span>
          <span>{param.max}</span>
        </div>
      </div>
    );
  }

  if (param.type === 'color') {
    return (
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
    );
  }

  const isPassword = param.type === 'password';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClasses}>{param.label}</label>
      <input
        id={id}
        type={isPassword ? 'password' : 'text'}
        inputMode={param.type === 'number' ? 'numeric' : undefined}
        min={param.type === 'number' ? param.min : undefined}
        max={param.type === 'number' ? param.max : undefined}
        value={String(value ?? '')}
        placeholder={param.placeholder}
        required={param.required}
        disabled={disabled}
        onChange={(event) => {
          const raw = event.target.value;
          if (param.type === 'number') {
            onChange(raw === '' ? '' : Number(raw));
          } else {
            onChange(raw);
          }
        }}
        className={inputClasses}
      />
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