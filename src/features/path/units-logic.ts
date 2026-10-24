export type UnitStatus = 'locked' | 'lesson' | 'learning' | 'done';
export interface UnitInput { hasLesson: boolean; total: number; seen: number; exTotal: number; exDone: number; lessonRead: boolean; unlocked: boolean }

/**
 * Entrée : unités d'une matière, dans l'ordre du parcours.
 * Une unité est ouverte si la précédente est validée (ou déblocage manuel).
 * Validée = leçon lue (si elle existe), toutes les cartes vues une fois ET tous les exercices réussis.
 */
export function resolveStatuses(list: UnitInput[]): UnitStatus[] {
  let prevValidated = true;
  return list.map((u) => {
    const lessonOk = !u.hasLesson || u.lessonRead;
    const validated = lessonOk && (u.total > 0 || u.exTotal > 0) && u.seen >= u.total && u.exDone >= u.exTotal;
    const open = prevValidated || u.unlocked;
    const status: UnitStatus = !open ? 'locked' : !lessonOk ? 'lesson' : validated ? 'done' : 'learning';
    prevValidated = validated;
    return status;
  });
}
