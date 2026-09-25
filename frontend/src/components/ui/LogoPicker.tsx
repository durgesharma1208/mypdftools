import { useEffect, useId, useRef, useState } from 'react';
import { ImageOff, ImagePlus, X } from 'lucide-react';
import type { ToolParam } from '../../types';
import { cn, formatBytes } from '../../lib/utils';
import { Button } from './Button';
import { FieldShell } from './Field';

interface LogoPickerProps {
  param: ToolParam;
  value: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}

/** Image picker with a live preview, used by the image-watermark tool. */
export function LogoPicker({ param, value, disabled, onChange }: LogoPickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <FieldShell label={param.label} htmlFor={id} hint={param.description}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
          event.target.value = '';
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-md border border-line bg-surface p-2.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface-muted">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <ImageOff className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink" title={value.name}>
              {value.name}
            </span>
            <span className="mt-0.5 block text-xs text-ink-subtle tabular">{formatBytes(value.size)}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-ink-subtle hover:text-critical"
              aria-label="Remove logo"
              onClick={() => onChange(null)}
              disabled={disabled}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </span>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line-strong bg-surface px-3 py-3 text-sm font-medium text-ink-muted',
            'transition-colors hover:border-accent/60 hover:text-accent disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Choose a logo image
        </button>
      )}
    </FieldShell>
  );
}
