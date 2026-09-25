import { describe, expect, it } from 'vitest';
import { getTool, TOOLS } from './tools';
import {
  acceptedSummary,
  defaultParams,
  isValidRangeExpression,
  maxFilesFor,
  partitionFiles,
  validateFile,
  validateSubmission,
  visibleParams,
  type SubmissionInput,
} from './validation';

function pdf(name = 'sample.pdf', size = 1024): File {
  return new File([new Uint8Array(size)], name, { type: 'application/pdf' });
}

function tool(slug: string) {
  const found = getTool(slug);
  if (!found) throw new Error(`Missing tool ${slug}`);
  return found;
}

function input(overrides: Partial<SubmissionInput> = {}): SubmissionInput {
  return {
    files: [pdf()],
    params: defaultParams(tool('merge')),
    selection: [],
    logo: null,
    pageCount: 3,
    ...overrides,
  };
}

describe('file validation', () => {
  it('accepts files whose extension matches the tool input kind', () => {
    expect(validateFile(tool('merge'), pdf())).toBeNull();
    expect(validateFile(tool('jpg-to-pdf'), new File(['x'], 'photo.PNG', { type: 'image/png' }))).toBeNull();
    expect(validateFile(tool('word-to-pdf'), new File(['x'], 'letter.docx'))).toBeNull();
  });

  it('rejects unsupported extensions with a helpful message', () => {
    const problem = validateFile(tool('merge'), new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(problem).toContain('notes.txt');
    expect(problem).toContain('PDF');
  });

  it('rejects formats the backend does not implement', () => {
    // .ods and .csv are not supported by the API validator, so the UI must not claim them.
    expect(validateFile(tool('excel-to-pdf'), new File(['x'], 'sheet.ods'))).not.toBeNull();
    expect(validateFile(tool('ppt-to-pdf'), new File(['x'], 'deck.odp'))).not.toBeNull();
  });

  it('rejects files above the server limit and empty files', () => {
    const limits = { maxFileSizeMb: 1, maxFiles: 10 };
    expect(validateFile(tool('merge'), pdf('big.pdf', 2 * 1024 * 1024), limits)).toContain('1 MB');
    expect(validateFile(tool('merge'), new File([], 'empty.pdf'))).toContain('empty');
  });

  it('honours per-tool and per-server file counts', () => {
    const merge = tool('merge');
    expect(maxFilesFor(merge, { maxFileSizeMb: 50, maxFiles: 4 })).toBe(4);
    expect(maxFilesFor(merge, { maxFileSizeMb: 50, maxFiles: 50 })).toBe(10);
    expect(maxFilesFor(tool('compress'), { maxFileSizeMb: 50, maxFiles: 50 })).toBe(1);
  });

  it('stops a batch that would exceed the tool limit and reports nothing accepted', () => {
    const result = partitionFiles(tool('compress'), [pdf('a.pdf'), pdf('b.pdf')], 0);
    expect(result.accepted).toEqual([]);
    expect(result.error).toContain('one file at a time');

    const overflow = partitionFiles(tool('merge'), [pdf('a.pdf'), pdf('b.pdf')], 9);
    expect(overflow.accepted).toEqual([]);
    expect(overflow.error).toContain('up to 10 files');
  });

  it('describes the accepted input for the UI', () => {
    expect(acceptedSummary(tool('merge'), { maxFileSizeMb: 50, maxFiles: 10 })).toBe(
      'PDF · 1–10 files · up to 50 MB each',
    );
    expect(acceptedSummary(tool('compress'), { maxFileSizeMb: 50, maxFiles: 10 })).toContain('1 file');
  });
});

describe('submission validation', () => {
  it('requires a file', () => {
    expect(validateSubmission(tool('merge'), input({ files: [] }))).toBe('Choose a file to process first.');
  });

  it('requires explicit page selection for extract and delete', () => {
    expect(validateSubmission(tool('extract'), input())).toBe('Select at least one page to extract.');
    expect(validateSubmission(tool('delete-pages'), input())).toBe('Select at least one page to delete.');
  });

  it('never allows deleting every page', () => {
    const toolDelete = tool('delete-pages');
    const message = validateSubmission(
      toolDelete,
      input({ params: defaultParams(toolDelete), selection: [1, 2, 3], pageCount: 3 }),
    );
    expect(message).toContain('At least one page');
  });

  it('allows rotate with no selection, because the backend rotates everything', () => {
    const rotate = tool('rotate');
    expect(
      validateSubmission(
        rotate,
        input({ params: { ...defaultParams(rotate), angle: '90' }, selection: [], pageCount: 3 }),
      ),
    ).toBeNull();
  });

  it('validates split ranges and page numbers', () => {
    const split = tool('split');
    const ranges = { ...defaultParams(split), mode: 'ranges', ranges: '1-3' };
    expect(validateSubmission(split, input({ params: ranges }))).toBeNull();

    const badRanges = { ...defaultParams(split), mode: 'ranges', ranges: 'one-to-three' };
    expect(validateSubmission(split, input({ params: badRanges }))).toContain('must look like');

    const emptyRanges = { ...defaultParams(split), mode: 'ranges', ranges: '' };
    expect(validateSubmission(split, input({ params: emptyRanges }))).toBe('Ranges is required.');

    const tooFar = { ...defaultParams(split), mode: 'page', page: 9 };
    expect(validateSubmission(split, input({ params: tooFar }))).toContain('page 9 does not exist');
  });

  it('enforces required fields declared by the catalog', () => {
    const watermark = tool('watermark');
    const params = { ...defaultParams(watermark), text: '' };
    expect(validateSubmission(watermark, input({ params }))).toBe('Watermark text is required.');

    const protect = tool('protect');
    const weak = { ...defaultParams(protect), user_password: 'ab' };
    expect(validateSubmission(protect, input({ params: weak }))).toContain('at least 4 characters');
  });

  it('requires a logo for the image watermark tool', () => {
    const logo = tool('image-watermark');
    expect(validateSubmission(logo, input({ params: defaultParams(logo) }))).toMatch(/logo/i);
    expect(
      validateSubmission(logo, input({ params: defaultParams(logo), logo: new File([new Uint8Array(10)], 'l.png') })),
    ).toBeNull();
  });

  it('requires at least one metadata field', () => {
    const metadata = tool('metadata');
    expect(validateSubmission(metadata, input({ params: defaultParams(metadata) }))).toContain('at least one metadata');
  });

  it('validates the page order for the organiser', () => {
    const organise = tool('organise');
    expect(
      validateSubmission(organise, input({ params: { order: '' }, selection: [1, 2, 3] })),
    ).toContain('preview');
    expect(
      validateSubmission(organise, input({ params: { order: '1,2' }, selection: [1, 2], pageCount: 3 })),
    ).toContain('exactly once');
    expect(
      validateSubmission(organise, input({ params: { order: '3,1,2' }, selection: [3, 1, 2], pageCount: 3 })),
    ).toBeNull();
  });

  it('accepts a well formed merge request', () => {
    expect(validateSubmission(tool('merge'), input({ files: [pdf('a.pdf'), pdf('b.pdf')] }))).toBeNull();
  });
});

describe('parameter helpers', () => {
  it('skips the logo param and applies catalog defaults', () => {
    const params = defaultParams(tool('image-watermark'));
    expect(params.logo).toBeUndefined();
    expect(params.size).toBe(120);
    expect(params.position).toBe('bottom-right');
  });

  it('honours conditional parameters', () => {
    const jpg = tool('jpg-to-pdf');
    const auto = defaultParams(jpg);
    expect(visibleParams(jpg, auto).map((param) => param.name)).toEqual(['page_size']);

    const a4 = { ...auto, page_size: 'a4' };
    expect(visibleParams(jpg, a4).map((param) => param.name)).toEqual(['page_size', 'orientation']);
  });

  it('never exposes auto-populated or logo parameters as inputs', () => {
    expect(visibleParams(tool('organise'), defaultParams(tool('organise')))).toEqual([]);
  });

  it.each(TOOLS.map((item) => [item.slug]))('exposes structured defaults for %s', (slug) => {
    const item = tool(slug);
    expect(() => defaultParams(item)).not.toThrow();
    expect(() => visibleParams(item, defaultParams(item))).not.toThrow();
  });
});

describe('range expression', () => {
  it('accepts comma separated ranges and rejects prose', () => {
    expect(isValidRangeExpression('1-3, 5, 7-9')).toBe(true);
    expect(isValidRangeExpression('4')).toBe(true);
    expect(isValidRangeExpression('1 - 3')).toBe(true);
    expect(isValidRangeExpression('1-')).toBe(false);
    expect(isValidRangeExpression('all')).toBe(false);
  });
});
