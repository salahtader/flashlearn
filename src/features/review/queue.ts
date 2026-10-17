import { State } from 'ts-fsrs';
import { db, type CardRow, type StateRow } from '../../infrastructure/db';
import { getSettings } from '../../infrastructure/settings';
import { endOfStudyDay, startOfStudyDay } from '../../utils/time';

export type Mode = 'mixed' | 'due' | 'new' | 'hard';
export interface QueueItem { card: CardRow; state: StateRow | null }

/** Révision : due avant la bascule du jour d'étude ; apprentissage/réapprentissage : à l'heure près. */
export const isDue = (x: StateRow, nowMs: number, eodMs: number) =>
  x.card.state === State.Review ? x.due < eodMs : x.due <= nowMs;

export async function buildQueue(mode: Mode, deckId?: string): Promise<QueueItem[]> {
  const s = await getSettings();
  const now = new Date();
  const decks = (await db.decks.toArray()).filter((d) => d.enabled && (!deckId || d.id === deckId));
  const ids = decks.map((d) => d.id);
  if (!ids.length) return [];

  const [cards, states] = await Promise.all([
    db.cards.where('deckId').anyOf(ids).toArray(),
    db.states.where('deckId').anyOf(ids).toArray(),
  ]);
  const cardMap = new Map(cards.map((c) => [c.uid, c]));
  const stateMap = new Map(states.map((x) => [x.cardUid, x]));
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
  const fresh = cards.filter((c) => !stateMap.has(c.uid)).slice(0, room).map((card): QueueItem => ({ card, state: null }));
  return mode === 'new' ? fresh : [...due, ...fresh];
}
