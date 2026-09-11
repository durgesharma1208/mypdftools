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
  'w-full rounded-xl border border-surface-line bg-surface-panel px-3 py-2 text-sm text-zinc-900 shadow-none transition-colors placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-white dark:placeholder:text-zinc-500';

export function Field({ param, value, disabled, onChange }: FieldProps) {
  const id = useId();

  if (param.type === 'checkbox') {
    return (
      <label
        htmlFor={id}
        className={cn('flex cursor-pointer items-center justify-between gap-3 select-none', disabled && 'pointer-events-none opacity-60')}
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{param.label}</span>
        <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-zinc-300 transition-colors data-[checked=true]:bg-brand-600 dark:bg-zinc-700" data-checked={Boolean(value)}>
          <input
            id={id}
            type="checkbox"
            className="peer sr-only"
            checked={Boolean(value)}
            onChange={() => onChange(!value)}
          />
          <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
        </span>
      </label>
    );
  }

  if (param.type === 'select') {
    return (
      <label className="block space-y-1.5">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{param.label}</span>
        <select id={id} className={cn(inputClasses, 'appearance-none')} value={String(value)} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {param.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {param.options?.find((option) => option.value === value)?.description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{param.options.find((option) => option.value === value)?.description}</p>
        )}
      </label>
    );
  }

  if (param.type === 'range') {
    const numeric = Number(value);
    return (
      <label className="block space-y-1.5">
        <span className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <span>{param.label}</span>
          <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 font-mono text-xs text-brand-600 dark:text-brand-300">{value}</span>
        </span>
        <input
          id={id}
          type="range"
          min={param.min}
          max={param.max}
          step={param.step}
          value={numeric}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-brand-600"
        />
      </label>
    );
  }

  if (param.type === 'color') {
    return (
      <label className="block space-y-1.5">
        <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{param.label}</span>
        <span className="flex items-center gap-2">
          <input
            type="color"
            value={String(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-surface-line bg-transparent dark:border-surface-line-dark"
          />
          <span className="rounded-lg border border-surface-line px-2.5 py-1.5 font-mono text-xs text-zinc-500 dark:border-surface-line-dark dark:text-zinc-400">{String(value)}</span>
        </span>
      </label>
    );
  }

  const isPassword = param.type === 'password';

  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{param.label}</span>
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
      {param.description && <p className="text-xs text-zinc-400 dark:text-zinc-500">{param.description}</p>}
    </label>
  );
}

export function LogoField({ param, disabled, onPick }: { param: ToolParam; disabled?: boolean; onPick: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">{param.label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-line bg-surface-panel px-3 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-50 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-300 dark:hover:border-brand-400 dark:hover:text-brand-300"
      >
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