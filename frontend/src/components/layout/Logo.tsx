import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

/**
 * Original mark: two offset document sheets with a folded corner and an accent
 * seam — reads clearly in grayscale and at 20px.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={cn('h-7 w-7', className)} aria-hidden="true" focusable="false">
      <rect
        x="4.6"
        y="6.4"
        width="12.4"
        height="16.4"
        rx="2.2"
        transform="rotate(-8 10.8 14.6)"
        className="fill-surface-muted stroke-ink/25"
        strokeWidth="1.4"
      />
      <path
        d="M11.4 3.6h7.6a3 3 0 0 1 3 3v12.4a3 3 0 0 1-1.05 2.28"
        className="fill-none stroke-ink"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11.4 3.6a3 3 0 0 0-3 3v2.1M18.95 21.28A3 3 0 0 1 16 22.6h-1.6"
        className="fill-none stroke-ink"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12.5 9.5h5.5" className="stroke-accent" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.5 13h4" className="stroke-ink/35" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.5 16.5h5.5" className="stroke-ink/35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5 rounded-md', className)}
      aria-label="MyPDFTools — home"
    >
      <LogoMark className="h-7 w-7 transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">
        MyPDF<span className="text-accent">Tools</span>
      </span>
    </Link>
  );
}
