import { db } from './db';

export interface Settings { newPerDay: number; maxReviews: number; dayStartHour: number; lastBackupAt: number }
export const DEFAULT_SETTINGS: Settings = { newPerDay: 10, maxReviews: 100, dayStartHour: 4, lastBackupAt: 0 };

export async function getSettings(): Promise<Settings> {
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const r of await db.settings.toArray()) out[r.key] = r.value;
  return out as unknown as Settings;
}
export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  await db.settings.put({ key, value });
}
