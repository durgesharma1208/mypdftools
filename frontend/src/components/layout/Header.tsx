import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

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
    }
    void navigate('/tools');
    window.setTimeout(focus, 120);
  }, [location.pathname, navigate]);

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
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-pressed={theme === 'dark'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink-muted transition-colors hover:text-ink lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
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
            </div>
          </div>
        </>
      )}
    </header>
  );
}
