import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Spinner } from '../ui/Spinner';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-pop"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {/* Route-level code splitting keeps the shell visible while a page loads. */}
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center gap-2.5 text-sm text-ink-muted" role="status">
              <Spinner className="h-4 w-4 text-accent" />
              Loading…
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
