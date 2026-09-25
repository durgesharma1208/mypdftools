import { useCallback, useId, useRef, useState } from 'react';
import { FileUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  compact?: boolean;
  onFiles: (files: File[]) => void;
  onRejected?: (message: string) => void;
}

/**
 * Accessible upload target.
 *
 * The control is a real `<input type="file">` paired with a `<label>`, so the
 * click, keyboard and screen-reader behaviour come from the platform. Drag and
 * drop is layered on top with a visual highlight.
 */
export function Dropzone({
  accept,
  multiple = false,
  label,
  hint,
  disabled = false,
  compact = false,
  onFiles,
}: DropzoneProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const emit = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      const files = Array.from(list);
      onFiles(multiple ? files : files.slice(0, 1));
    },
    [multiple, onFiles],
  );

  const isActive = dragging && !disabled;

  return (
<<<<<<< HEAD
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
=======
    <div className="relative">
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        className="peer sr-only"
        onChange={(event) => {
          emit(event.target.files);
          // Allow re-selecting the same file straight after a reset.
          event.target.value = '';
        }}
      />

<<<<<<< HEAD
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
=======
      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) event.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (disabled) return;
          emit(event.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center',
          'transition-colors duration-150 ease-out',
          compact ? 'px-4 py-5' : 'px-6 py-10 sm:py-12',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
          isActive
            ? 'border-accent bg-accent-soft'
            : 'border-line-strong bg-surface hover:border-accent/60 hover:bg-surface-muted',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-md border transition-colors duration-150',
            compact ? 'h-9 w-9' : 'h-11 w-11',
            isActive ? 'border-accent bg-accent text-accent-fg' : 'border-line bg-surface-muted text-ink-muted',
          )}
          aria-hidden="true"
        >
          <FileUp className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>

        <span className="space-y-1">
          <span className={cn('block font-medium text-ink', compact ? 'text-sm' : 'text-[15px]')}>
            {label} <span className="text-ink-muted">or drop it here</span>
          </span>
          {hint && (
            <span id={hintId} className="block text-xs text-ink-subtle">
              {hint}
            </span>
          )}
        </span>
      </label>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    </div>
  );
}
