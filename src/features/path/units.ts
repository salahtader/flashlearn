import { db, type DeckRow, type ProgressRow } from '../../infrastructure/db';
import { resolveStatuses, type UnitStatus } from './units-logic';

export interface Unit { deck: DeckRow; total: number; seen: number; exTotal: number; exDone: number; lessonRead: boolean; status: UnitStatus }

/** Unités du parcours (decks avec `order`), groupées par matière puis triées par `order`. */
export async function loadUnits(): Promise<Unit[]> {
  const [decks, progress] = await Promise.all([db.decks.toArray(), db.progress.toArray()]);
  const prog = new Map(progress.map((p) => [p.deckId, p]));
  const pathDecks = decks.filter((d) => d.order !== undefined);
  const out: Unit[] = [];
  for (const subject of [...new Set(pathDecks.map((d) => d.subject))]) {
    const list = pathDecks.filter((d) => d.subject === subject).sort((a, b) => a.order! - b.order!);
    const rows = await Promise.all(list.map(async (deck) => ({
      deck,
      total: await db.cards.where('deckId').equals(deck.id).count(),
      seen: await db.states.where('deckId').equals(deck.id).count(),
      exTotal: deck.exercises?.length ?? 0,
      exDone: await db.exercises.where('deckId').equals(deck.id).filter((e) => e.done).count(),
      lessonRead: !!prog.get(deck.id)?.lessonReadAt,
      unlocked: !!prog.get(deck.id)?.unlocked,
    })));
    const statuses = resolveStatuses(rows.map((r) => ({ hasLesson: !!r.deck.lesson, total: r.total, seen: r.seen, exTotal: r.exTotal, exDone: r.exDone, lessonRead: r.lessonRead, unlocked: r.unlocked })));
    rows.forEach((r, i) => out.push({ deck: r.deck, total: r.total, seen: r.seen, exTotal: r.exTotal, exDone: r.exDone, lessonRead: r.lessonRead, status: statuses[i] }));
  }
  return out;
}

/** Decks dont les cartes peuvent apparaître en session : hors parcours, ou unité ouverte et leçon lue. */
export function allowedDeckIdsFrom(decks: DeckRow[], units: Unit[]): Set<string> {
  const pathIds = new Set(units.map((u) => u.deck.id));
  const open = new Set(units.filter((u) => u.status === 'learning' || u.status === 'done').map((u) => u.deck.id));
  return new Set(decks.filter((d) => d.enabled && (!pathIds.has(d.id) || open.has(d.id))).map((d) => d.id));
}
export async function allowedDeckIds(): Promise<Set<string>> {
  const [decks, units] = await Promise.all([db.decks.toArray(), loadUnits()]);
  return allowedDeckIdsFrom(decks, units);
}

export async function setProgress(deckId: string, patch: Partial<Omit<ProgressRow, 'deckId'>>) {
  const cur = await db.progress.get(deckId);
  await db.progress.put({ ...cur, ...patch, deckId });
}
