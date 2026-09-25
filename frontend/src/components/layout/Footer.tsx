import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ServerStatusPill } from './ServerStatusPill';
import { CATEGORIES, POPULAR_TOOLS } from '../../lib/tools';

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted text-wrap-pretty">
              A focused PDF toolbox. Uploads are validated, processed in an isolated workspace, and deleted immediately
              after your download completes.
            </p>
            <ServerStatusPill showDetails />
          </div>

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
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

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
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MyPDFTools. No accounts, no stored files.</p>
          <p>Built with FastAPI, React, TypeScript and Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
