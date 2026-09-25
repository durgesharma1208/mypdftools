<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
import { Moon, Search, Sun, X, Menu, ShieldCheck } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
=======
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { POPULAR_TOOLS } from '../../lib/tools';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  to: string;
  /** Category filter the link applies, used for active-state detection. */
  category?: string;
}

<<<<<<< HEAD
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
=======
const NAV_ITEMS: NavItem[] = [
  { label: 'All tools', to: '/tools' },
  { label: 'Organise', to: '/tools?category=organise', category: 'organise' },
  { label: 'Convert', to: '/tools?category=convert-to', category: 'convert-to' },
  { label: 'Security', to: '/tools?category=security', category: 'security' },
  { label: 'About', to: '/about' },
];

function isActive(item: NavItem, pathname: string, category: string | null): boolean {
  if (item.to === '/about') return pathname === '/about';
  if (item.to === '/tools') return pathname === '/tools' && category === null;
  return pathname === '/tools' && category === item.category;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const category = new URLSearchParams(location.search).get('category');
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

<<<<<<< HEAD
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
=======
  const openSearch = useCallback(() => {
    const focus = () => {
      const input = document.getElementById('tool-search');
      if (input instanceof HTMLInputElement) {
        input.focus();
        input.select();
      }
    };
    if (location.pathname === '/tools') {
      focus();
      return;
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
    }
    void navigate('/tools');
    window.setTimeout(focus, 120);
  }, [location.pathname, navigate]);

<<<<<<< HEAD
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
=======
  // ⌘K / Ctrl+K and "/" jump straight to tool search.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openSearch]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo />

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, location.pathname, category);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm transition-colors',
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-sm text-ink-subtle transition-colors hover:border-line-strong hover:text-ink lg:w-52 lg:justify-start"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">Search tools</span>
            <kbd className="ml-auto hidden rounded-xs border border-line bg-surface-muted px-1.5 py-0.5 font-sans text-2xs text-ink-subtle lg:inline">
              ⌘K
            </kbd>
            <span className="sr-only">Search tools</span>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
          </button>

          {/* Theme toggle */}
          <button
            type="button"
<<<<<<< HEAD
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-500 transition-all duration-150 hover:border-brand-300 hover:text-zinc-800 dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:border-brand-500/50 dark:hover:text-zinc-200"
=======
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={theme === 'dark'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 transition-transform duration-200 hover:rotate-45" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 transition-transform duration-200 hover:-rotate-12" aria-hidden="true" />
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
<<<<<<< HEAD
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-line bg-surface-panel text-zinc-500 transition-all duration-150 hover:text-zinc-900 md:hidden dark:border-surface-line-dark dark:bg-surface-panel-dark dark:text-zinc-400 dark:hover:text-white"
=======
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:text-ink lg:hidden"
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
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
<<<<<<< HEAD
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
=======
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-16 z-0 cursor-default bg-ink/20 lg:hidden"
          />
          <div
            id="mobile-menu"
            ref={menuRef}
            tabIndex={-1}
            className="relative z-10 border-t border-line bg-surface px-4 pb-6 pt-4 shadow-pop outline-none lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item, location.pathname, category);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-3 text-sm transition-colors',
                      active ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-surface-muted',
                    )}
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-ink-subtle">
                      →
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mx-auto mt-5 max-w-6xl">
              <p className="eyebrow px-3">Popular right now</p>
              <ul className="mt-2 grid grid-cols-2 gap-1.5">
                {POPULAR_TOOLS.slice(0, 4).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink transition-colors hover:border-line-strong"
                    >
                      <tool.icon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mx-auto mt-5 max-w-6xl px-3">
              <Button variant="secondary" full onClick={openSearch} icon={<Search className="h-4 w-4" aria-hidden="true" />}>
                Search all tools
              </Button>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
            </div>
          </div>
        </>
      )}
    </header>
  );
}
