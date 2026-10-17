import { parseDeckFile } from './json/parse';
import { applyImport } from './json/import';

// Tout JSON placé dans /content est intégré automatiquement (decks "fournis").
const files = import.meta.glob('/content/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;

export async function seedBuiltinDecks() {
  for (const [path, raw] of Object.entries(files)) {
    const r = parseDeckFile(JSON.stringify(raw));
    if (!r.ok) { console.error(`Deck intégré invalide : ${path}`, r.errors); continue; }
    await applyImport(r.data, 'update', true);
  }
}
