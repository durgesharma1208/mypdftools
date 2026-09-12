import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as apiModule from '../../lib/api';
import { ApiError, uploadForm } from '../../lib/api';
import { getTool } from '../../lib/tools';
import { defaultParams } from '../../lib/validation';
import { useWorkspace } from './useWorkspace';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof apiModule>('../../lib/api');
  return { ...actual, uploadForm: vi.fn() };
});

const uploadMock = vi.mocked(uploadForm);

const LIMITS = { maxFileSizeMb: 50, maxFiles: 10 };

function pdf(name = 'doc.pdf'): File {
  return new File([new Uint8Array(2048)], name, { type: 'application/pdf' });
}

function toolOrThrow(slug: string) {
  const tool = getTool(slug);
  if (!tool) throw new Error(`Missing tool ${slug}`);
  return tool;
}

function setup(slug: string) {
  return renderHook(() => useWorkspace({ tool: toolOrThrow(slug), limits: LIMITS }));
}

beforeEach(() => {
  uploadMock.mockReset();
});

describe('file intake', () => {
  it('accepts a valid file and moves to the ready phase', async () => {
    const { result } = setup('compress');
    await act(async () => result.current.addFiles([pdf()]));

    expect(result.current.files).toHaveLength(1);
    expect(result.current.phase).toBe('ready');
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('reports an unsupported file without clearing existing selection', async () => {
    const { result } = setup('compress');
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.addFiles([new File(['x'], 'notes.txt', { type: 'text/plain' })]));

    expect(result.current.files).toHaveLength(1);
    expect(result.current.phase).toBe('error');
    expect(result.current.error).toContain('notes.txt');
  });

  it('enforces the multi-file ceiling from the server limits', async () => {
    const { result } = setup('merge');
    await act(async () =>
      result.current.addFiles(Array.from({ length: 4 }, (_, index) => pdf(`file-${index}.pdf`))),
    );
    expect(result.current.maxFiles).toBe(10);
    expect(result.current.files).toHaveLength(4);

    await act(async () =>
      result.current.addFiles(Array.from({ length: 8 }, (_, index) => pdf(`extra-${index}.pdf`))),
    );
    expect(result.current.files).toHaveLength(4);
    expect(result.current.error).toContain('up to 10 files');
  });

  it('reorders and removes files', async () => {
    const { result } = setup('merge');
    await act(async () => result.current.addFiles([pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]));

    const secondId = result.current.files[1]?.id ?? '';
    await act(async () => result.current.reorderFile(secondId, 'up'));
    expect(result.current.files.map((item) => item.file.name)).toEqual(['b.pdf', 'a.pdf', 'c.pdf']);

    await act(async () => result.current.removeFile(secondId));
    expect(result.current.files.map((item) => item.file.name)).toEqual(['a.pdf', 'c.pdf']);
  });

  it('clears every file and returns to idle', async () => {
    const { result } = setup('merge');
    await act(async () => result.current.addFiles([pdf('a.pdf')]));
    await act(async () => result.current.clearFiles());
    expect(result.current.files).toHaveLength(0);
    expect(result.current.phase).toBe('idle');
    expect(result.current.canSubmit).toBe(false);
  });
});

describe('submission', () => {
  it('blocks extract until pages are selected, without calling the API', async () => {
    const { result } = setup('extract');
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.submit());

    expect(uploadMock).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('Select at least one page to extract.');
  });

  it('sends the selected page list for extract', async () => {
    uploadMock.mockResolvedValue({ blob: new Blob(['x']), filename: 'extracted.pdf', size: 1 });
    const { result } = setup('extract');
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.setSelection([2, 4]));
    await act(async () => result.current.submit());

    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [endpoint, formData] = uploadMock.mock.calls[0] ?? [];
    expect(endpoint).toBe('/api/pdf/extract');
    expect((formData as FormData).get('pages')).toBe('2,4');
    expect((formData as FormData).get('pdf_file')).toBeInstanceOf(File);
  });

  it('includes multi-file payloads, checkbox values and the logo file', async () => {
    uploadMock.mockResolvedValue({ blob: new Blob(['x']), filename: 'out.pdf', size: 1 });
    const { result } = setup('image-watermark');
    await act(async () => result.current.addFiles([pdf('watermark-me.pdf')]));
    await act(async () => result.current.setLogo(new File([new Uint8Array(24)], 'logo.png', { type: 'image/png' })));
    await act(async () => result.current.setParam('opacity', 0.6));
    await act(async () => result.current.submit());

    const formData = uploadMock.mock.calls[0]?.[1] as FormData;
    expect(formData.get('pdf_file')).toBeInstanceOf(File);
    expect(formData.get('logo')).toBeInstanceOf(File);
    expect(formData.get('opacity')).toBe('0.6');
  });

  it('walks through upload → processing → done and keeps the result', async () => {
    uploadMock.mockImplementation(async (_path, _form, options) => {
      options?.onProgress?.(0.4);
      options?.onProgress?.(1);
      return { blob: new Blob(['result']), filename: 'merged.pdf', message: 'Merged 2 documents.', size: 6 };
    });

    const { result } = setup('merge');
    await act(async () => result.current.addFiles([pdf('a.pdf'), pdf('b.pdf')]));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.phase).toBe('done'));
    expect(result.current.busy).toBe(false);
    expect(result.current.result?.filename).toBe('merged.pdf');
    expect(result.current.originalSize).toBe(4096);
    expect(result.current.canSubmit).toBe(false);
  });

  it('surfaces API errors and lets the user retry', async () => {
    uploadMock.mockRejectedValueOnce(new ApiError('This PDF is password protected.', 400));
    const { result } = setup('compress');
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.submit());

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('This PDF is password protected.');

    uploadMock.mockResolvedValueOnce({ blob: new Blob(['x']), filename: 'compressed.pdf', size: 1 });
    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.phase).toBe('done'));
  });

  it('returns to the ready phase when a request is cancelled', async () => {
    uploadMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    const { result } = setup('compress');
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.submit());

    expect(result.current.phase).toBe('ready');
    expect(result.current.error).toBeNull();
    expect(result.current.busy).toBe(false);
  });

  it('reset clears the file, options and result', async () => {
    uploadMock.mockResolvedValue({ blob: new Blob(['x']), filename: 'out.pdf', size: 1 });
    const { result } = setup('watermark');
    await act(async () => result.current.setParam('text', 'CONFIDENTIAL'));
    await act(async () => result.current.addFiles([pdf()]));
    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.phase).toBe('done'));

    await act(async () => result.current.reset());
    expect(result.current.files).toHaveLength(0);
    expect(result.current.result).toBeNull();
    expect(result.current.params.text).toBe(defaultParams(toolOrThrow('watermark')).text);
    expect(result.current.phase).toBe('idle');
  });
});
