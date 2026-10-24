import Dexie, { type Table } from 'dexie';
import type { Card as FCard } from 'ts-fsrs';
import type { Card, Exercise } from '../domain/schema';

export interface DeckRow {
  id: string; title: string; description?: string; subject: string; language: string;
  tags: string[]; enabled: boolean; builtin: boolean; importedAt: number;
  level?: number; order?: number; lesson?: string; exercises?: Exercise[];
}
/** Progression dans le parcours : leçon lue, déblocage manuel. */
export interface ProgressRow { deckId: string; lessonReadAt?: number; unlocked?: boolean }
/** Contenu pédagogique. `uid` = `${deckId}::${card.id}`, `rev` = hash du contenu. */
export type CardRow = Card & { uid: string; deckId: string; rev: string; pos?: number };
/** État FSRS d'une carte (absent = carte nouvelle). `due` dupliqué en timestamp pour l'index. */
export interface StateRow { cardUid: string; deckId: string; card: FCard; due: number }
/** Journal append-only des révisions. rating: 1=À revoir 2=Difficile 3=Bien 4=Facile. */
export interface LogRow {
  id?: number; cardUid: string; deckId: string; at: number; rating: number;
  prevState: number; ms: number; mode: string;
}
/** Brouillon de code et état d'un exercice. key = `${deckId}::${exId}`. */
export interface ExerciseRow { key: string; deckId: string; exId: string; code: string; done: boolean; doneAt?: number; updatedAt: number }
export interface SettingRow { key: string; value: unknown }

class FlashDB extends Dexie {
  decks!: Table<DeckRow, string>;
  cards!: Table<CardRow, string>;
  states!: Table<StateRow, string>;
  logs!: Table<LogRow, number>;
  settings!: Table<SettingRow, string>;
  progress!: Table<ProgressRow, string>;
  exercises!: Table<ExerciseRow, string>;
  constructor() {
    super('flashlearn');
    this.version(1).stores({
      decks: 'id, subject',
      cards: 'uid, deckId',
      states: 'cardUid, deckId, due',
      logs: '++id, cardUid, deckId, at',
      settings: 'key',
    });
    this.version(2).stores({ progress: 'deckId' });
    this.version(3).stores({ exercises: 'key, deckId' });
  }
}
export const db = new FlashDB();
