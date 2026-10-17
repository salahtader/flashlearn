import { describe, expect, it } from 'vitest';
import { Rating, State } from 'ts-fsrs';
import { applyGrade } from './scheduler';
import { endOfStudyDay, startOfStudyDay } from '../utils/time';

describe('scheduler', () => {
  const t0 = new Date('2026-01-10T10:00:00');
  it('une carte nouvelle notée Facile est planifiée plus loin que Difficile', () => {
    const easy = applyGrade(null, Rating.Easy, t0);
    const hard = applyGrade(null, Rating.Hard, t0);
    expect(easy.due.getTime()).toBeGreaterThan(hard.due.getTime());
  });
  it('Bien puis Bien augmente l\'intervalle', () => {
    const c1 = applyGrade(null, Rating.Good, t0);
    const c2 = applyGrade(c1, Rating.Good, c1.due);
    expect(c2.due.getTime() - c1.due.getTime()).toBeGreaterThan(c1.due.getTime() - t0.getTime());
  });
  it('un oubli en révision déclenche un réapprentissage proche', () => {
    let c = applyGrade(null, Rating.Easy, t0);
    c = applyGrade(c, Rating.Good, c.due);
    const lapsed = applyGrade(c, Rating.Again, c.due);
    expect(lapsed.state).toBe(State.Relearning);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.due.getTime() - c.due.getTime()).toBeLessThan(3600_000);
  });
});

describe('jour d\'étude', () => {
  it('2h du matin appartient à la veille (bascule à 4h)', () => {
    const d = startOfStudyDay(new Date('2026-01-10T02:00:00'), 4);
    expect(d.getDate()).toBe(9);
  });
  it('la fin du jour est 24h après le début', () => {
    const now = new Date('2026-01-10T10:00:00');
    expect(endOfStudyDay(now, 4).getDate()).toBe(11);
  });
});
