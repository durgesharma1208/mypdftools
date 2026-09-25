import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATEGORIES, POPULAR_TOOLS, TOOLS, categoryOf, getTool, relatedTools, toolMatchesQuery } from './tools';

/** Locate the FastAPI route modules from either repo layout. */
function routeDirectory(): string {
  const candidates = [
    resolve(process.cwd(), '../backend/app/api/routes'),
    resolve(process.cwd(), 'backend/app/api/routes'),
  ];
  const found = candidates.find((candidate) => existsSync(resolve(candidate, 'pdf.py')));
  if (!found) throw new Error('Could not locate backend/app/api/routes to verify API contracts.');
  return found;
}

const ROUTE_DIR = routeDirectory();

interface RouteSignature {
  path: string;
  params: Set<string>;
}

/** Every `@router.post("/x")` block, with the form parameters it declares. */
function routeSignatures(filename: string, prefix: string = ''): RouteSignature[] {
  const source = readFileSync(resolve(ROUTE_DIR, filename), 'utf8');
  const blocks = source.split('@router.post(').slice(1);
  return blocks.map((block) => {
    const rawPath = /^"([^"]+)"/.exec(block)?.[1] ?? '';
    const path = `${prefix}${rawPath}`;
    const boundaries = [block.indexOf('\n):'), block.indexOf(') ->')].filter((index) => index !== -1);
    const header = boundaries.length > 0 ? block.slice(0, Math.min(...boundaries) + 2) : block.slice(0, 600);
    const params = new Set<string>();
    for (const match of header.matchAll(/([a-z_]+)\s*:\s*[^,)]+/g)) {
      if (match[1]) params.add(match[1]);
    }
    return { path, params };
  });
}

const SIGNATURES: RouteSignature[] = [
  ...routeSignatures('pdf.py', ''),
  ...routeSignatures('conversion.py', ''),
  ...routeSignatures('ocr.py', '/ocr'),
  ...routeSignatures('ai.py', '/ai'),
];

function signatureFor(endpoint: string): RouteSignature | undefined {
  const path = endpoint.replace('/api', '');
  return SIGNATURES.find((signature) => signature.path === path);
}

describe('tool catalog', () => {
  it('has unique slugs across a non-trivial number of tools', () => {
    const slugs = TOOLS.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(TOOLS.length).toBeGreaterThanOrEqual(18);
  });

  it('maps every tool onto a real backend route', () => {
    for (const tool of TOOLS) {
      const signature = signatureFor(tool.endpoint);
      expect(signature, `missing backend route for ${tool.slug}`).toBeDefined();
      expect(signature?.params.has(tool.fileField), `${tool.slug} file field ${tool.fileField}`).toBe(true);
    }
  });

  it('sends only parameter names the backend declares', () => {
    for (const tool of TOOLS) {
      const signature = signatureFor(tool.endpoint);
      for (const param of tool.params ?? []) {
        expect(signature?.params.has(param.name), `${tool.slug}.${param.name} is not a form field`).toBe(true);
      }
    }
  });

  it('keeps every category populated and labelled', () => {
    for (const category of CATEGORIES) {
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.blurb.length).toBeGreaterThan(0);
      expect(TOOLS.filter((tool) => tool.category === category.key).length).toBeGreaterThan(0);
    }
  });

  it('marks a handful of tools as popular and resolves related tools without self references', () => {
    expect(POPULAR_TOOLS.length).toBeGreaterThanOrEqual(3);
    for (const tool of TOOLS) {
      const related = relatedTools(tool, 3);
      expect(related.some((item) => item.slug === tool.slug)).toBe(false);
      expect(related.length).toBeLessThanOrEqual(3);
    }
  });

  it('gives every tool a description, action label and acceptance summary', () => {
    for (const tool of TOOLS) {
      expect(tool.description.length).toBeGreaterThan(30);
      expect(tool.action.length).toBeGreaterThan(0);
      expect(tool.accept.length).toBeGreaterThan(0);
      expect(tool.inputLabel.length).toBeGreaterThan(0);
      expect(tool.outputLabel.length).toBeGreaterThan(0);
    }
  });

  it('resolves tools and categories by key', () => {
    expect(getTool('merge')?.name).toBe('Merge PDF');
    expect(getTool('nope')).toBeUndefined();
    expect(categoryOf('organise').key).toBe('organise');
  });

  it('searches across names, categories and descriptions', () => {
    const merge = getTool('merge');
    if (!merge) throw new Error('merge tool missing');
    expect(toolMatchesQuery(merge, 'combine')).toBe(true);
    expect(toolMatchesQuery(merge, 'organise')).toBe(true);
    expect(toolMatchesQuery(merge, 'scanning')).toBe(false);
    expect(toolMatchesQuery(merge, '')).toBe(true);
  });
});
