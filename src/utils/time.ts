/** Début du "jour d'étude" (bascule à `hour`, ex. 4h du matin, heure locale). */
export function startOfStudyDay(now: Date, hour: number): Date {
  const d = new Date(now);
  d.setHours(hour, 0, 0, 0);
  if (d > now) d.setDate(d.getDate() - 1);
  return d;
}
export function endOfStudyDay(now: Date, hour: number): Date {
  const d = startOfStudyDay(now, hour);
  d.setDate(d.getDate() + 1);
  return d;
}
export function prevDay(ts: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() - 1);
  return d.getTime();
}
export function formatInterval(from: Date, to: Date): string {
  const m = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} j`;
  if (d < 365) return `${Math.round(d / 30)} mois`;
  return `${(d / 365).toFixed(1)} an`;
}
export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`;
}
