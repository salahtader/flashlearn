import { State } from 'ts-fsrs';
import { db } from '../../infrastructure/db';
import { getSettings } from '../../infrastructure/settings';
import { isDue } from '../review/queue';
import { allowedDeckIdsFrom, loadUnits } from '../path/units';
import { endOfStudyDay, prevDay, startOfStudyDay } from '../../utils/time';

export interface CurrentUnit { id: string; title: string; order: number; status: 'lesson' | 'learning'; seen: number; total: number }
export interface Stats {
  total: number; due: number; fresh: number; learning: number; mastered: number;
  today: number; successRate: number | null; streak: number; logsTotal: number; backupOverdue: boolean;
  current: CurrentUnit | null; unitsDone: number; unitsTotal: number;
}
const DAY = 86400000;

export async function computeStats(): Promise<Stats> {
  const s = await getSettings();
  const now = new Date();
  const [decks, units] = await Promise.all([db.decks.toArray(), loadUnits()]);
  const ids = [...allowedDeckIdsFrom(decks, units)];
  const [total, states, logs] = await Promise.all([
    db.cards.where('deckId').anyOf(ids).count(),
    db.states.where('deckId').anyOf(ids).toArray(),
    db.logs.where('at').aboveOrEqual(now.getTime() - 400 * DAY).toArray(),
  ]);
  const start = startOfStudyDay(now, s.dayStartHour).getTime();
  const eod = endOfStudyDay(now, s.dayStartHour).getTime();
  const mastered = states.filter((x) => x.card.state === State.Review && x.card.stability >= 21).length;
  const week = logs.filter((l) => l.at >= start - 6 * DAY);

  const days = new Set(logs.map((l) => startOfStudyDay(new Date(l.at), s.dayStartHour).getTime()));
  let cursor = start;
  if (!days.has(cursor)) cursor = prevDay(cursor);
  let streak = 0;
  while (days.has(cursor)) { streak++; cursor = prevDay(cursor); }

  const cur = units.find((u) => u.status === 'lesson' || u.status === 'learning');
  return {
    total, fresh: total - states.length, mastered, learning: states.length - mastered,
    due: states.filter((x) => isDue(x, now.getTime(), eod)).length,
    today: logs.filter((l) => l.at >= start).length,
    // Taux de réussite = (Bien + Facile) / total des réponses sur 7 jours. Ce n'est pas une mesure de maîtrise.
    successRate: week.length ? week.filter((l) => l.rating >= 3).length / week.length : null,
    streak, logsTotal: logs.length,
    backupOverdue: logs.length > 0 && now.getTime() - s.lastBackupAt > 14 * DAY,
    current: cur ? { id: cur.deck.id, title: cur.deck.title, order: cur.deck.order!, status: cur.status as 'lesson' | 'learning', seen: cur.seen, total: cur.total } : null,
    unitsDone: units.filter((u) => u.status === 'done').length,
    unitsTotal: units.length,
  };
}
