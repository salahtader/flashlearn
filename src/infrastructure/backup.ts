import { db } from './db';
import { CardSchema } from '../domain/schema';
import { setSetting } from './settings';

const KIND = 'flashlearn-backup';

export async function createBackup() {
  const [decks, cards, states, logs, settings] = await Promise.all([
    db.decks.toArray(), db.cards.toArray(), db.states.toArray(), db.logs.toArray(), db.settings.toArray(),
  ]);
  await setSetting('lastBackupAt', Date.now());
  return { kind: KIND, version: 1, exportedAt: new Date().toISOString(), decks, cards, states, logs, settings };
}

export async function restoreBackup(text: string) {
  let j: any;
  try { j = JSON.parse(text); } catch { throw new Error('JSON invalide'); }
  if (j?.kind !== KIND || j.version !== 1) throw new Error('Fichier de sauvegarde invalide');
  for (const k of ['decks', 'cards', 'states', 'logs', 'settings'])
    if (!Array.isArray(j[k])) throw new Error(`Sauvegarde corrompue : "${k}" manquant`);
  for (const [i, c] of j.cards.entries()) {
    const { uid, deckId, rev, ...content } = c;
    if (!uid || !deckId || !rev || !CardSchema.safeParse(content).success) throw new Error(`Sauvegarde corrompue : cards[${i}]`);
  }
  for (const s of j.states) {
    s.card.due = new Date(s.card.due);
    if (s.card.last_review) s.card.last_review = new Date(s.card.last_review);
  }
  await db.transaction('rw', [db.decks, db.cards, db.states, db.logs, db.settings], async () => {
    await Promise.all([db.decks.clear(), db.cards.clear(), db.states.clear(), db.logs.clear(), db.settings.clear()]);
    await db.decks.bulkAdd(j.decks);
    await db.cards.bulkAdd(j.cards);
    await db.states.bulkAdd(j.states);
    await db.logs.bulkAdd(j.logs);
    await db.settings.bulkAdd(j.settings);
  });
}
