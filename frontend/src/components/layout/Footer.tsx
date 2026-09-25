import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Github } from 'lucide-react';
import { Logo } from './Logo';
import { ServerStatusPill } from './ServerStatusPill';
import { CATEGORIES, POPULAR_TOOLS } from '../../lib/tools';

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
<<<<<<< HEAD
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
=======
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted text-wrap-pretty">
              A focused PDF toolbox. Uploads are validated, processed in an isolated workspace, and deleted immediately
              after your download completes.
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
            </p>
            <ServerStatusPill showDetails />
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

<<<<<<< HEAD
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
=======
          <nav aria-labelledby="footer-tools">
            <h2 id="footer-tools" className="eyebrow">
              Popular tools
            </h2>
            <ul className="mt-4 space-y-2.5">
              {POPULAR_TOOLS.slice(0, 6).map((tool) => (
                <li key={tool.slug}>
                  <Link to={`/tools/${tool.slug}`} className="text-sm text-ink-muted transition-colors hover:text-accent">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-categories">
            <h2 id="footer-categories" className="eyebrow">
              Categories
            </h2>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((category) => (
                <li key={category.key}>
                  <Link
                    to={`/tools?category=${category.key}`}
                    className="text-sm text-ink-muted transition-colors hover:text-accent"
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
                  >
                    {category.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

<<<<<<< HEAD
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
=======
          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className="eyebrow">
              Product
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/tools" className="text-sm text-ink-muted transition-colors hover:text-accent">
                  All tools
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-ink-muted transition-colors hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-ink-muted transition-colors hover:text-accent">
                  Privacy
                </Link>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
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
          </nav>
        </div>

<<<<<<< HEAD
        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-surface-line pt-6 sm:flex-row dark:border-surface-line-dark">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} MyPDFTools. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Designed for privacy. Engineered for speed.
          </p>
=======
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MyPDFTools. No accounts, no stored files.</p>
          <p>Built with FastAPI, React, TypeScript and Tailwind CSS.</p>
>>>>>>> 5d0f9ee86c7ec7d9c5a0815445eb7297e97c22eb
        </div>
      </div>
    </footer>
  );
}
