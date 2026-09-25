import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Github } from 'lucide-react';
import { Logo } from './Logo';
import { CATEGORIES } from '../../lib/tools';

function scrollTo(id: string) {
  return (event: React.MouseEvent) => {
    event.preventDefault();
    if (window.location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };
}

export function Footer() {
  return (
    <footer className="border-t border-surface-line bg-surface dark:border-surface-line-dark dark:bg-surface-dark">
      {/* Privacy banner */}
      <div className="border-b border-surface-line dark:border-surface-line-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 text-center sm:flex-row sm:text-left sm:px-6 md:gap-12">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-900 dark:text-white">Privacy guaranteed.</strong>{' '}
              Files are processed in isolated workspaces and deleted immediately after download.
            </p>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-900 dark:text-white">No sign-up needed.</strong>{' '}
              All tools are completely free to use.
            </p>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.75fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Every PDF tool you need, in one place. Fast, free and private — files never leave your machine beyond a single processing request.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-line text-zinc-400 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-surface-line-dark dark:hover:border-brand-500/50 dark:hover:text-brand-300"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Categories column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">Categories</h3>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category.key}>
                  <a
                    href={`/#tools`}
                    onClick={scrollTo('tools')}
                    className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
                  >
                    {category.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">Product</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/#tools"
                  onClick={scrollTo('tools')}
                  className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
                >
                  All Tools
                </a>
              </li>
              <li>
                <a
                  href="/#features"
                  onClick={scrollTo('features')}
                  className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300"
                >
                  Features
                </a>
              </li>
              <li>
                <Link to="/about" className="text-sm text-zinc-500 transition-colors hover:text-brand-600 dark:text-zinc-400 dark:hover:text-brand-300">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Built with column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">Built with</h3>
            <ul className="space-y-2.5">
              {['FastAPI', 'PyMuPDF', 'React', 'TypeScript', 'Tailwind CSS'].map((tech) => (
                <li key={tech}>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{tech}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-surface-line pt-6 sm:flex-row dark:border-surface-line-dark">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} MyPDFTools. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Designed for privacy. Engineered for speed.
          </p>
        </div>
      </div>
    </footer>
  );
}