import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseDeckFile } from '../infrastructure/json/parse';

const walk = (d: string): string[] =>
  readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : f.endsWith('.json') ? [join(d, f)] : []));

describe('decks fournis (content/)', () => {
  const files = walk('content');
  const ids = new Set<string>();
  it.each(files)('%s est valide', (f) => {
    const r = parseDeckFile(readFileSync(f, 'utf8'));
    expect(r.ok ? [] : r.errors).toEqual([]);
    if (r.ok) { expect(ids.has(r.data.deck.id)).toBe(false); ids.add(r.data.deck.id); }
  });
});
