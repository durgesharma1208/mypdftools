export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '—';
  if (size < 1024) return `${Math.round(size)} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unit = units[0];
  for (let i = 1; i < units.length && value >= 1024; i += 1) {
    value /= 1024;
    unit = units[i];
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function uniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function fileIconColor(kind: 'pdf' | 'image' | 'word' | 'excel' | 'ppt'): string {
  switch (kind) {
    case 'pdf':
      return 'bg-rose-500/10 text-rose-500';
    case 'image':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'word':
      return 'bg-sky-500/10 text-sky-500';
    case 'excel':
      return 'bg-green-600/10 text-green-600';
    case 'ppt':
      return 'bg-orange-500/10 text-orange-500';
  }
}