import { describe, expect, it } from 'vitest';
import { resolveStatuses, type UnitInput } from './units-logic';

const u = (o: Partial<UnitInput> = {}): UnitInput => ({ hasLesson: true, total: 3, seen: 0, lessonRead: false, unlocked: false, ...o });

describe('resolveStatuses', () => {
  it('la première unité demande d\'abord la leçon, les suivantes sont verrouillées', () => {
    expect(resolveStatuses([u(), u()])).toEqual(['lesson', 'locked']);
  });
  it('leçon lue : cartes en cours', () => {
    expect(resolveStatuses([u({ lessonRead: true, seen: 1 }), u()])).toEqual(['learning', 'locked']);
  });
  it('toutes les cartes vues : unité validée et suivante ouverte', () => {
    expect(resolveStatuses([u({ lessonRead: true, seen: 3 }), u()])).toEqual(['done', 'lesson']);
  });
  it('cartes vues sans leçon lue : pas validée', () => {
    expect(resolveStatuses([u({ seen: 3 }), u()])).toEqual(['lesson', 'locked']);
  });
  it('déblocage manuel', () => {
    expect(resolveStatuses([u(), u({ unlocked: true })])).toEqual(['lesson', 'lesson']);
  });
  it('unité sans leçon : directement en cours', () => {
    expect(resolveStatuses([u({ hasLesson: false })])).toEqual(['learning']);
  });
});
