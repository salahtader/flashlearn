import { parseDeckFile } from './json/parse';
import { parseCourseMd } from './md/parseCourse';
import { applyImport, deleteDeck } from './json/import';
import { db } from './db';

// Anciens decks remplacés par le parcours (content/java/path) : retirés pour éviter les doublons.
const RETIRED_DECK_IDS = ['java-fundamentals', 'java-reflection', 'java-complements', 'java-fundamentals-2'];

// Tout JSON placé dans /content est intégré automatiquement (decks "fournis").
const files = import.meta.glob('/content/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

const mdFiles = import.meta.glob('/content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export async function seedBuiltinDecks() {
  for (const [path, text] of Object.entries(mdFiles)) {
    const r = parseCourseMd(text);
    if (!r.ok) { console.error(`Cours intégré invalide : ${path}`, r.errors); continue; }
    await applyImport(r.data, 'update', true);
  }
  for (const [path, raw] of Object.entries(files)) {
    const r = parseDeckFile(JSON.stringify(raw));
    if (!r.ok) { console.error(`Deck intégré invalide : ${path}`, r.errors); continue; }
    await applyImport(r.data, 'update', true);
  }
  for (const id of RETIRED_DECK_IDS) if (await db.decks.get(id)) await deleteDeck(id);
}
