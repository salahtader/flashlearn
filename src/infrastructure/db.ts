import Dexie, { type Table } from 'dexie';
import type { Card as FCard } from 'ts-fsrs';
import type { Card } from '../domain/schema';

export interface DeckRow {
  id: string; title: string; description?: string; subject: string; language: string;
  tags: string[]; enabled: boolean; builtin: boolean; importedAt: number;
}
/** Contenu pédagogique. `uid` = `${deckId}::${card.id}`, `rev` = hash du contenu. */
export type CardRow = Card & { uid: string; deckId: string; rev: string };
/** État FSRS d'une carte (absent = carte nouvelle). `due` dupliqué en timestamp pour l'index. */
export interface StateRow { cardUid: string; deckId: string; card: FCard; due: number }
/** Journal append-only des révisions. rating: 1=À revoir 2=Difficile 3=Bien 4=Facile. */
export interface LogRow {
  id?: number; cardUid: string; deckId: string; at: number; rating: number;
  prevState: number; ms: number; mode: string;
}
export interface SettingRow { key: string; value: unknown }

class FlashDB extends Dexie {
  decks!: Table<DeckRow, string>;
  cards!: Table<CardRow, string>;
  states!: Table<StateRow, string>;
  logs!: Table<LogRow, number>;
  settings!: Table<SettingRow, string>;
  constructor() {
    super('flashlearn');
    this.version(1).stores({
      decks: 'id, subject',
      cards: 'uid, deckId',
      states: 'cardUid, deckId, due',
      logs: '++id, cardUid, deckId, at',
      settings: 'key',
    });
  }
}
export const db = new FlashDB();
