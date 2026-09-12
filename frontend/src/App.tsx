import { lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

const HomePage = lazy(() => import('./pages/HomePage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/** Keeps older `/tool/<slug>` links working. */
function LegacyToolRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/tools/${slug ?? ''}`} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:slug" element={<ToolPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/tool/:slug" element={<LegacyToolRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
