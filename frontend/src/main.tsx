import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/inter/wght.css';
import './index.css';
import App from './App';
import { ThemeProvider } from './hooks/useTheme';
import { ServerStatusProvider } from './hooks/useServerStatus';
import { ToastProvider } from './hooks/useToast';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <ServerStatusProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </ServerStatusProvider>
    </ThemeProvider>
  </StrictMode>,
);
