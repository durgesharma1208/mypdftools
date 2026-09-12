import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dropzone } from './Dropzone';

function pdf(name = 'report.pdf'): File {
  return new File([new Uint8Array(32)], name, { type: 'application/pdf' });
}

describe('Dropzone', () => {
  it('is a real labelled file input, so keyboard and screen readers work', () => {
    render(<Dropzone accept=".pdf" label="Choose a PDF file" hint="PDF · up to 50 MB" onFiles={() => undefined} />);

    const input = screen.getByLabelText(/Choose a PDF file/);
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.pdf');
    expect(input).not.toBeDisabled();
    expect(input).toHaveAccessibleDescription('PDF · up to 50 MB');
  });

  it('forwards selected files', async () => {
    const onFiles = vi.fn();
    render(<Dropzone accept=".pdf" label="Choose a PDF file" onFiles={onFiles} />);

    await userEvent.upload(screen.getByLabelText(/Choose a PDF file/), pdf());
    expect(onFiles).toHaveBeenCalledTimes(1);
    expect((onFiles.mock.calls[0]?.[0] as File[])[0]?.name).toBe('report.pdf');
  });

  it('passes every dropped file when multiple selection is enabled', async () => {
    const onFiles = vi.fn();
    render(<Dropzone accept=".pdf" multiple label="Choose PDF files" onFiles={onFiles} />);

    await userEvent.upload(screen.getByLabelText(/Choose PDF files/), [pdf('a.pdf'), pdf('b.pdf')]);
    expect((onFiles.mock.calls[0]?.[0] as File[]).map((file) => file.name)).toEqual(['a.pdf', 'b.pdf']);
  });

  it('keeps only the first file for single-file tools', async () => {
    const onFiles = vi.fn();
    render(<Dropzone accept=".pdf" label="Choose a PDF file" onFiles={onFiles} />);

    await userEvent.upload(screen.getByLabelText(/Choose a PDF file/), [pdf('a.pdf'), pdf('b.pdf')]);
    expect((onFiles.mock.calls[0]?.[0] as File[]).map((file) => file.name)).toEqual(['a.pdf']);
  });

  it('accepts files dropped onto the drop zone', async () => {
    const onFiles = vi.fn();
    render(<Dropzone accept=".pdf" label="Choose a PDF file" onFiles={onFiles} />);

    const target = screen.getByText(/Choose a PDF file/).closest('label');
    expect(target).not.toBeNull();
    const file = pdf('dropped.pdf');
    await userEvent.upload(target as HTMLElement, file);
    expect(onFiles).toHaveBeenCalled();
  });

  it('disables the control while processing', async () => {
    const onFiles = vi.fn();
    render(<Dropzone accept=".pdf" label="Choose a PDF file" disabled onFiles={onFiles} />);

    expect(screen.getByLabelText(/Choose a PDF file/)).toBeDisabled();
    await userEvent.upload(screen.getByLabelText(/Choose a PDF file/), pdf());
    expect(onFiles).not.toHaveBeenCalled();
  });
});
