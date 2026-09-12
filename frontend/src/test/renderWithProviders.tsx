import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/useTheme';
import { ServerStatusProvider } from '../hooks/useServerStatus';
import { ToastProvider } from '../hooks/useToast';

function Providers({ children, route = '/' }: { children: ReactNode; route?: string }) {
  return (
    <ThemeProvider>
      <ServerStatusProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {children}
          </MemoryRouter>
        </ToastProvider>
      </ServerStatusProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(ui: ReactElement, route = '/') {
  return render(ui, { wrapper: ({ children }) => <Providers route={route}>{children}</Providers> });
}
