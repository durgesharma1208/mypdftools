import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Logo({ className, withText = true, to = '/' }: { className?: string; withText?: boolean; to?: string }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2.5', className)} aria-label="MyPDFTools home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm shadow-brand-500/30 transition-transform group-hover:scale-105">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      {withText && (
        <span className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-white">
          MyPDF<span className="text-brand-500 dark:text-brand-300">Tools</span>
        </span>
      )}
    </Link>
  );
}