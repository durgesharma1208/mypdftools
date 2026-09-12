import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/renderWithProviders';

/** Integration pass over the real router, providers and lazy routes. */
describe('application shell', () => {
  it('renders the home page with navigation, hero and popular tools', async () => {
    renderWithProviders(<App />, '/');

    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: /quietly powerful/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /MyPDFTools — home/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Merge PDF/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('opens a tool page with its workspace', async () => {
    renderWithProviders(<App />, '/tools/merge');

    expect(await screen.findByRole('heading', { level: 1, name: 'Merge PDF' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose pdf files/i)).toBeInTheDocument();
    expect(screen.getByText('Tool details')).toBeInTheDocument();
  });

  it('shows the tool library at /tools', async () => {
    renderWithProviders(<App />, '/tools');

    expect(await screen.findByRole('heading', { level: 1, name: /document tools/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Search tools')).toBeInTheDocument();
  });

  it('renders the 404 page for unknown routes and keeps navigation usable', async () => {
    renderWithProviders(<App />, '/does-not-exist');

    expect(await screen.findByRole('heading', { level: 1, name: /does not exist/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all tools' })).toBeInTheDocument();
  });

  it('switches between light and dark themes and remembers the choice', async () => {
    renderWithProviders(<App />, '/');
    await screen.findByRole('heading', { level: 1 });

    const toggle = screen.getByRole('button', { name: /Switch to dark theme/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement).not.toHaveClass('dark');

    await userEvent.click(toggle);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(window.localStorage.getItem('mypdftools.theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /Switch to light theme/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('exposes the API status reported by the server', async () => {
    renderWithProviders(<App />, '/');
    expect(await screen.findAllByText(/Processing server online/i)).not.toHaveLength(0);
  });
});
