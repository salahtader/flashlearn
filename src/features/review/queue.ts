import { State } from 'ts-fsrs';
import { db, type CardRow, type StateRow } from '../../infrastructure/db';
import { getSettings } from '../../infrastructure/settings';
import { endOfStudyDay, startOfStudyDay } from '../../utils/time';
import { allowedDeckIds } from '../path/units';

export type Mode = 'mixed' | 'due' | 'new' | 'hard';
export interface QueueItem { card: CardRow; state: StateRow | null }

/** Révision : due avant la bascule du jour d'étude ; apprentissage/réapprentissage : à l'heure près. */
export const isDue = (x: StateRow, nowMs: number, eodMs: number) =>
  x.card.state === State.Review ? x.due < eodMs : x.due <= nowMs;

export async function buildQueue(mode: Mode, deckId?: string): Promise<QueueItem[]> {
  const s = await getSettings();
  const now = new Date();
  // Seuls les decks ouverts (hors parcours, ou unité débloquée avec leçon lue) alimentent les sessions.
  const ids = [...(await allowedDeckIds())].filter((id) => !deckId || id === deckId);
  if (!ids.length) return [];

  const [cards, states, decks] = await Promise.all([
    db.cards.where('deckId').anyOf(ids).toArray(),
    db.states.where('deckId').anyOf(ids).toArray(),
    db.decks.bulkGet(ids),
  ]);
  const cardMap = new Map(cards.map((c) => [c.uid, c]));
  const stateMap = new Map(states.map((x) => [x.cardUid, x]));
  const deckOrder = new Map(decks.filter((d) => !!d).map((d) => [d!.id, d!.order ?? 9999]));
  const eod = endOfStudyDay(now, s.dayStartHour).getTime();
  const toItem = (x: StateRow): QueueItem | null => {
    const card = cardMap.get(x.cardUid);
    return card ? { card, state: x } : null;
  };
  const compact = (a: (QueueItem | null)[]) => a.filter((i): i is QueueItem => !!i);

  if (mode === 'hard') {
    const hard = states.filter((x) => x.card.lapses >= 2 || x.card.difficulty >= 7).sort((a, b) => b.card.lapses - a.card.lapses);
    return compact(hard.slice(0, s.maxReviews).map(toItem));
  }

  const due = compact(states.filter((x) => isDue(x, now.getTime(), eod)).sort((a, b) => a.due - b.due).slice(0, s.maxReviews).map(toItem));
  if (mode === 'due') return due;

  const dayStart = startOfStudyDay(now, s.dayStartHour).getTime();
  const newToday = await db.logs.where('at').aboveOrEqual(dayStart).filter((l) => l.prevState === State.New).count();
  const room = Math.max(0, s.newPerDay - newToday);
  // Nouvelles cartes dans l'ordre du parcours : unité, puis position dans l'unité.
  const fresh = cards
    .filter((c) => !stateMap.has(c.uid))
    .sort((a, b) => (deckOrder.get(a.deckId)! - deckOrder.get(b.deckId)!) || ((a.pos ?? 0) - (b.pos ?? 0)))
    .slice(0, room)
    .map((card): QueueItem => ({ card, state: null }));
  return mode === 'new' ? fresh : [...due, ...fresh];
}
