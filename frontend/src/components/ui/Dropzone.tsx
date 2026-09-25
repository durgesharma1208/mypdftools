import { useCallback, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropzoneProps {
  accept: string;
  label: string;
  sublabel?: string;
  hint?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}

export function Dropzone({ accept, label, sublabel, hint, multiple, disabled, onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || disabled) return;
      onFiles(Array.from(list));
    },
    [disabled, onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        // Only clear dragging state if leaving the element entirely
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-200',
        dragging
          ? 'border-brand-500 bg-brand-500/5 scale-[1.01] shadow-glow-sm'
          : 'border-surface-line bg-surface hover:border-brand-400/60 hover:bg-brand-500/[0.02] dark:border-surface-line-dark dark:bg-surface-dark dark:hover:border-brand-500/40',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {/* Icon */}
      <span
        className={cn(
          'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200',
          dragging
            ? 'scale-110 bg-brand-500 text-white shadow-lg shadow-brand-500/30'
            : 'bg-brand-500/8 text-brand-600 group-hover:scale-105 dark:text-brand-400',
        )}
      >
        <UploadCloud className="h-8 w-8" aria-hidden="true" />
      </span>

      {/* Text */}
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-zinc-900 dark:text-white">
          {dragging ? 'Drop to upload' : label}
        </p>
        {sublabel && !dragging && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{sublabel}</p>
        )}
        {hint && !dragging && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
        )}
        {dragging && (
          <p className="text-sm text-brand-600 dark:text-brand-400">Release to upload your file</p>
        )}
      </div>

      {/* Click indicator */}
      {!dragging && (
        <span className="inline-flex h-8 items-center rounded-lg border border-surface-line bg-surface-panel px-3 text-xs font-medium text-zinc-500 transition-colors group-hover:border-brand-300 group-hover:text-brand-600 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:group-hover:border-brand-500/40 dark:group-hover:text-brand-300">
          Browse files
        </span>
      )}
    </div>
  );
}