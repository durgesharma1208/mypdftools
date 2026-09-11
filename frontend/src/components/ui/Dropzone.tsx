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
      tabIndex={0}
      aria-label={label}
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
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-200',
        dragging
          ? 'border-brand-500 bg-brand-500/5 scale-[1.01]'
          : 'border-surface-line bg-surface hover:border-brand-400/70 hover:bg-brand-500/[0.03] dark:border-surface-line-dark dark:bg-surface-dark',
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
      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200',
          dragging ? 'scale-110 bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
        )}
      >
        <UploadCloud className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{label}</p>
        {sublabel && <p className="text-sm text-zinc-500 dark:text-zinc-400">{sublabel}</p>}
        {hint && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
      </div>
    </div>
  );
}