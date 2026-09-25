import { useEffect, useRef, useState } from 'react';
import { Moon, Search, Sun, X, Menu, ShieldCheck } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../../lib/utils';

function scrollToTools(event: React.MouseEvent) {
  event.preventDefault();
  window.location.hash = '#tools';
  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures(event: React.MouseEvent) {
  event.preventDefault();
  window.location.hash = '#features';
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
}

export function Header({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

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
      'relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
      isActive
        ? 'text-brand-600 dark:text-brand-400'
        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-200',
        scrolled
          ? 'border-surface-line/80 bg-surface/90 shadow-soft backdrop-blur-xl dark:border-surface-line-dark/80 dark:bg-surface-dark/90'
          : 'border-transparent bg-transparent backdrop-blur-sm',
      )}
      ref={menuRef}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          <a
            href="#tools"
            onClick={scrollToTools}
            className={linkClasses({ isActive: false })}
          >
            Tools
          </a>
          <a
            href="#features"
            onClick={scrollToFeatures}
            className={linkClasses({ isActive: false })}
          >
            Features
          </a>
          <NavLink to="/about" className={linkClasses}>
            About
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Search button */}
          <button
            type="button"
            onClick={performSearch}
            aria-label="Search tools"
            className="group flex h-9 items-center gap-2 rounded-xl border border-surface-line bg-surface-panel px-3 text-sm text-zinc-400 transition-all duration-150 hover:border-brand-300 hover:text-zinc-700 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-500 dark:hover:border-brand-500/50 dark:hover:text-zinc-300 md:w-44"
          >
            <Search className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
            <span className="hidden md:inline">Search tools…</span>
            <kbd className="ml-auto hidden rounded-md border border-surface-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 dark:border-surface-line-dark dark:bg-surface-dark md:inline">
              /
            </kbd>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-500 transition-all duration-150 hover:border-brand-300 hover:text-zinc-800 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:border-brand-500/50 dark:hover:text-zinc-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-500 transition-all duration-150 hover:text-zinc-900 md:hidden dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:text-white"
          >
            {menuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="animate-fade-down border-t border-surface-line bg-surface/98 px-4 py-3 backdrop-blur-xl md:hidden dark:border-surface-line-dark dark:bg-surface-dark/98"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <a
              href="#tools"
              onClick={(e) => { scrollToTools(e); setMenuOpen(false); }}
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/8 dark:hover:text-white"
            >
              Tools
            </a>
            <a
              href="#features"
              onClick={(e) => { scrollToFeatures(e); setMenuOpen(false); }}
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/8 dark:hover:text-white"
            >
              Features
            </a>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/8 text-brand-600 dark:text-brand-400'
                    : 'text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/8',
                )
              }
            >
              About
            </NavLink>

            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/8 px-3 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Files are processed privately and deleted immediately after.
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}