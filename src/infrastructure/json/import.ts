import { db, type CardRow } from '../db';
import type { DeckFile } from '../../domain/schema';
import { cardUid, hashCard } from './parse';

export type DuplicateMode = 'skip' | 'update';
export interface ImportPreview { fresh: number; same: number; changed: number; deckExists: boolean }

export async function previewImport(file: DeckFile): Promise<ImportPreview> {
  const { deck } = file;
  const rows = await db.cards.bulkGet(deck.cards.map((c) => cardUid(deck.id, c.id)));
  let fresh = 0, same = 0, changed = 0;
  rows.forEach((row, i) => {
    if (!row) fresh++;
    else if (row.rev === hashCard(deck.cards[i])) same++;
    else changed++;
  });
  return { fresh, same, changed, deckExists: !!(await db.decks.get(deck.id)) };
}

/** Transactionnel : tout ou rien. La progression (states/logs) n'est jamais touchée. */
export async function applyImport(file: DeckFile, mode: DuplicateMode, builtin = false) {
  const { deck } = file;
  await db.transaction('rw', db.decks, db.cards, async () => {
    const existing = await db.decks.get(deck.id);
    if (!existing || mode === 'update') {
      await db.decks.put({
        id: deck.id, title: deck.title, description: deck.description, subject: deck.subject,
        language: deck.language, tags: deck.tags, level: deck.level, order: deck.order, lesson: deck.lesson,
        enabled: existing?.enabled ?? true, builtin: existing?.builtin ?? builtin,
        importedAt: existing?.importedAt ?? Date.now(),
      });
    }
    const uids = deck.cards.map((c) => cardUid(deck.id, c.id));
    const current = await db.cards.bulkGet(uids);
    const toWrite: CardRow[] = [];
    deck.cards.forEach((c, i) => {
      const rev = hashCard(c);
      const row = current[i];
      if (!row || (mode === 'update' && (row.rev !== rev || row.pos !== i))) toWrite.push({ ...c, uid: uids[i], deckId: deck.id, rev, pos: i });
    });
    await db.cards.bulkPut(toWrite);
  });
}

export async function exportDeck(deckId: string): Promise<DeckFile> {
  const d = await db.decks.get(deckId);
  if (!d) throw new Error('Deck introuvable');
  const cards = await db.cards.where('deckId').equals(deckId).toArray();
  return {
    schemaVersion: '1.0',
    deck: {
      id: d.id, title: d.title, description: d.description, subject: d.subject, language: d.language, tags: d.tags, level: d.level, order: d.order, lesson: d.lesson,
      cards: cards.sort((a, b) => (a.pos ?? 0) - (b.pos ?? 0)).map(({ uid: _u, deckId: _d, rev: _r, pos: _p, ...c }) => c),
    },
  };
}

export async function deleteDeck(deckId: string) {
  await db.transaction('rw', [db.decks, db.cards, db.states, db.logs, db.progress], async () => {
    await db.cards.where('deckId').equals(deckId).delete();
    await db.states.where('deckId').equals(deckId).delete();
    await db.logs.where('deckId').equals(deckId).delete();
    await db.progress.delete(deckId);
    await db.decks.delete(deckId);
  });
}
