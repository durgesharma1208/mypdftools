import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import ToolsPage from './ToolsPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { TOOLS } from '../lib/tools';

describe('tool library', () => {
  it('renders every tool grouped by category', () => {
    renderWithProviders(<ToolsPage />, '/tools');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(String(TOOLS.length));
    expect(screen.getByRole('link', { name: /Merge PDF/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Protect PDF/ })).toBeInTheDocument();
    expect(screen.getByText(`${TOOLS.length} of ${TOOLS.length} tools`)).toBeInTheDocument();
  });

  it('filters by search term and reports an empty state for nonsense queries', async () => {
    renderWithProviders(<ToolsPage />, '/tools');
    const input = screen.getByLabelText('Search tools');

    await userEvent.type(input, 'merge');
    expect(screen.getByRole('link', { name: /Merge PDF/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Compress PDF/ })).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'zzzz');
    expect(screen.getByText(/No tools match/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('link', { name: /Merge PDF/ })).toBeInTheDocument();
  });

  it('filters by category using accessible toggle buttons', async () => {
    renderWithProviders(<ToolsPage />, '/tools');

    const security = screen.getByRole('button', { name: /PDF security/ });
    await userEvent.click(security);
    expect(security).toHaveAttribute('aria-pressed', 'true');

    expect(screen.getByRole('link', { name: /Protect PDF/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Merge PDF/ })).not.toBeInTheDocument();

    await userEvent.click(security);
    expect(security).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('link', { name: /Merge PDF/ })).toBeInTheDocument();
  });

  it('reads the category filter from the URL so links stay shareable', () => {
    renderWithProviders(<ToolsPage />, '/tools?category=convert-from');

    const group = screen.getByRole('region', { name: /Convert from PDF/ });
    expect(within(group).getByRole('link', { name: /PDF to JPG/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Merge PDF/ })).not.toBeInTheDocument();
  });

  it('combines search and category filters', async () => {
    renderWithProviders(<ToolsPage />, '/tools');
    await userEvent.click(screen.getByRole('button', { name: /Organise PDF/ }));
    await userEvent.type(screen.getByLabelText('Search tools'), 'shrink');

    expect(screen.getByRole('link', { name: /Compress PDF/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Merge PDF/ })).not.toBeInTheDocument();
  });
});
