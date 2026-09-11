import { useEffect, useState } from 'react';
import { Moon, Search, Sun, X, Menu, ShieldCheck } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../../lib/utils';

function scrollToTools(event: React.MouseEvent) {
  event.preventDefault();
  window.location.hash = '#tools';
  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
}

export function Header({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const performSearch = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('mypdftools:focus-search'));
    }, 60);
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white',
    );

  return (
    <header className="glass sticky top-0 z-40 border-b border-surface-line/80 dark:border-surface-line-dark/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <a href="#tools" onClick={scrollToTools} className={linkClasses({ isActive: false })}>
            Tools
          </a>
          <a href="#features" onClick={scrollToTools} className={linkClasses({ isActive: false })}>
            Features
          </a>
          <NavLink to="/about" className={linkClasses}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={performSearch}
            aria-label="Search tools"
            className="flex h-9 items-center gap-2 rounded-xl border border-surface-line bg-surface-panel px-3 text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:text-white md:w-48"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden md:inline">Search tools…</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-600 transition-colors hover:text-zinc-900 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-300 dark:hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-600 md:hidden dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-300"
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="animate-fade-in border-t border-surface-line bg-surface px-4 py-3 md:hidden dark:border-surface-line-dark dark:bg-surface-dark" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <a href="#tools" onClick={scrollToTools} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10">
              Tools
            </a>
            <NavLink to="/about" className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10">
              About
            </NavLink>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Files are processed privately and deleted after processing.
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}