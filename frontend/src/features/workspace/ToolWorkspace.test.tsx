import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolWorkspace } from './ToolWorkspace';
import { renderWithProviders } from '../../test/renderWithProviders';
import type * as apiModule from '../../lib/api';
import { ApiError, uploadForm } from '../../lib/api';
import { getTool } from '../../lib/tools';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof apiModule>('../../lib/api');
  return { ...actual, uploadForm: vi.fn() };
});

const uploadMock = vi.mocked(uploadForm);

function pdf(name = 'quarterly.pdf'): File {
  return new File([new Uint8Array(4096)], name, { type: 'application/pdf' });
}

function toolOrThrow(slug: string) {
  const tool = getTool(slug);
  if (!tool) throw new Error(`Missing tool ${slug}`);
  return tool;
}

beforeEach(() => {
  uploadMock.mockReset();
  uploadMock.mockResolvedValue({
    blob: new Blob(['result-bytes'], { type: 'application/pdf' }),
    filename: 'quarterly-compressed.pdf',
    message: 'Reduced from 4.0 KB to 2.0 KB (50% smaller).',
    size: 12,
  });
});

describe('standard tool workspace', () => {
  it('starts with an upload target and no dead actions', () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('compress')} />);

    expect(screen.getByLabelText(/Choose pdf file/i)).toBeInTheDocument();
    const action = screen.getByRole('button', { name: 'Compress PDF' });
    expect(action).toBeDisabled();
    expect(screen.getByText(/Add PDF file to continue/i)).toBeInTheDocument();
    expect(screen.getByText('Tool details')).toBeInTheDocument();
  });

  it('runs the compress workflow end to end and offers the download', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('compress')} />);

    await userEvent.upload(screen.getByLabelText(/Choose pdf file/i), pdf());
    expect(await screen.findByText('Selected file')).toBeInTheDocument();
    expect(screen.getAllByText('quarterly.pdf').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: 'Compress PDF' }));
    expect(uploadMock).toHaveBeenCalledTimes(1);

    expect(await screen.findByText('Your file is ready')).toBeInTheDocument();
    expect(screen.getByText('quarterly-compressed.pdf')).toBeInTheDocument();
    expect(screen.getByText(/50% smaller/)).toBeInTheDocument();

    // The result panel offers a download and a reset that returns to the drop zone.
    await userEvent.click(screen.getByRole('button', { name: 'Process another file' }));
    expect(screen.getByLabelText(/Choose pdf file/i)).toBeInTheDocument();
  });

  it('shows a human readable error with a retry instead of a stack trace', async () => {
    uploadMock.mockRejectedValueOnce(new ApiError('This PDF is password protected. Unlock it before processing.', 400));
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('compress')} />);

    await userEvent.upload(screen.getByLabelText(/Choose pdf file/i), pdf());
    await userEvent.click(await screen.findByRole('button', { name: 'Compress PDF' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This PDF is password protected.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });

  it('validates a rejected file type before any request is made', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('compress')} />);

    const input = screen.getByLabelText(/Choose pdf file/i);
    // applyAccept: false sends the file through even though it fails the accept
    // filter, which is how a drag-and-drop or a renamed file behaves.
    await userEvent.upload(input, new File(['x'], 'notes.txt', { type: 'text/plain' }), { applyAccept: false });

    expect(await screen.findByText(/is not a supported file/)).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('keeps the primary action within reach on small screens', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('compress')} />);
    await userEvent.upload(screen.getByLabelText(/Choose pdf file/i), pdf());

    expect(await screen.findByRole('button', { name: 'Run' })).toBeInTheDocument();
  });

  it('blocks Office conversions when the server reports no LibreOffice, and explains why', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('word-to-pdf')} />);

    expect(await screen.findByText('Not available on this server')).toBeInTheDocument();
    const action = screen.getByRole('button', { name: 'Unavailable' });
    expect(action).toBeDisabled();
    expect(screen.getByText(/does not have LibreOffice installed/)).toBeInTheDocument();

    await userEvent.upload(screen.getByLabelText(/Choose word document/i), new File(['x'], 'letter.docx'));
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });

  it('groups multiple files and allows reordering for merge', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('merge')} />);

    await userEvent.upload(screen.getByLabelText(/Choose pdf files/i), [pdf('one.pdf'), pdf('two.pdf')]);
    expect(await screen.findByText('Files in order')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Move two.pdf up' }));
    const names = screen.getAllByText(/\.pdf$/).map((node) => node.textContent);
    expect(names.slice(0, 2)).toEqual(['two.pdf', 'one.pdf']);
  });

  it('warns when a page-level tool is submitted without selecting pages', async () => {
    renderWithProviders(<ToolWorkspace tool={toolOrThrow('delete-pages')} />);

    await userEvent.upload(screen.getByLabelText(/Choose pdf file/i), pdf());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete pages' })).toBeEnabled());

    await userEvent.click(screen.getByRole('button', { name: 'Delete pages' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Select at least one page to delete.');
    expect(uploadMock).not.toHaveBeenCalled();
  });
});
