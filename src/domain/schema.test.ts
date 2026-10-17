import { describe, expect, it } from 'vitest';
import { parseDeckFile, hashCard } from '../infrastructure/json/parse';

const deck = (cards: unknown[], extra: object = {}) =>
  JSON.stringify({ schemaVersion: '1.0', deck: { id: 'd', title: 'T', subject: 'S', cards, ...extra } });
const basic = (id: string) => ({ id, type: 'basic', question: 'q', answer: 'a' });

describe('parseDeckFile', () => {
  it('accepte un deck valide et applique les valeurs par défaut', () => {
    const r = parseDeckFile(deck([basic('1')]));
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.data.deck.cards[0].difficulty).toBe('medium'); expect(r.data.deck.language).toBe('fr'); }
  });
  it('rejette un JSON invalide', () => expect(parseDeckFile('{oops').ok).toBe(false));
  it('rejette une version de schéma inconnue', () => {
    const r = parseDeckFile(JSON.stringify({ schemaVersion: '9', deck: {} }));
    expect(r.ok).toBe(false);
  });
  it('indique le chemin du champ en erreur', () => {
    const r = parseDeckFile(deck([basic('1'), { id: '2', type: 'basic', question: 'q' }]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join('\n')).toContain('deck.cards[1].answer');
  });
  it('détecte les identifiants dupliqués', () => {
    const r = parseDeckFile(deck([basic('1'), basic('1')]));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toContain('dupliqué');
  });
  it('exige code pour le type code', () => expect(parseDeckFile(deck([{ ...basic('1'), type: 'code' }])).ok).toBe(false));
  it('vérifie les index des QCM', () => {
    const mc = { ...basic('1'), type: 'multiple_choice', choices: ['a', 'b'], correct: [2] };
    expect(parseDeckFile(deck([mc])).ok).toBe(false);
    expect(parseDeckFile(deck([{ ...mc, correct: [1] }])).ok).toBe(true);
  });
  it('hash stable et sensible au contenu', () => {
    const a = { id: '1', type: 'basic' as const, question: 'q', answer: 'a', difficulty: 'medium' as const, tags: [], references: [] };
    expect(hashCard(a)).toBe(hashCard({ ...a }));
    expect(hashCard(a)).not.toBe(hashCard({ ...a, answer: 'autre' }));
  });
});
