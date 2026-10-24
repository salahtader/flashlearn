import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDeckFile } from '../infrastructure/json/parse';
import { parseCourseMd } from '../infrastructure/md/parseCourse';

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : /\.(json|md)$/.test(f) ? [join(d, f)] : []));

describe('decks et cours fournis (content/)', () => {
  const files = walk('content');
  const ids = new Set<string>();
  const orders = new Set<string>();
  it.each(files)('%s est valide', (f) => {
    const text = readFileSync(f, 'utf8');
    const r = f.endsWith('.md') ? parseCourseMd(text) : parseDeckFile(text);
    expect(r.ok ? [] : r.errors).toEqual([]);
    if (r.ok) {
      const d = r.data.deck;
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
      if (d.order !== undefined) { const k = `${d.subject}:${d.order}`; expect(orders.has(k)).toBe(false); orders.add(k); }
    }
  });
});

describe('modèle de cours (docs/course-template.md)', () => {
  it('est un cours valide', () => {
    const r = parseCourseMd(readFileSync('docs/course-template.md', 'utf8'));
    expect(r.ok ? [] : r.errors).toEqual([]);
  });
});
