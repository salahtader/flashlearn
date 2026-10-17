import { DeckFileSchema, type Card, type DeckFile } from '../../domain/schema';

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export type ParseResult = { ok: true; data: DeckFile } | { ok: false; errors: string[] };

export function formatPath(path: ReadonlyArray<PropertyKey>): string {
  return path.map((p, i) => (typeof p === 'number' ? `[${p}]` : i === 0 ? String(p) : `.${String(p)}`)).join('') || '(racine)';
}

/** Validation complète : syntaxe, schéma, doublons, cohérence des QCM. Aucune écriture. */
export function parseDeckFile(text: string): ParseResult {
  if (text.length > MAX_FILE_BYTES) return { ok: false, errors: [`Fichier trop volumineux (max ${MAX_FILE_BYTES / 1024 / 1024} Mo)`] };
  let raw: unknown;
  try { raw = JSON.parse(text); } catch (e) { return { ok: false, errors: [`JSON invalide : ${(e as Error).message}`] }; }

  const r = DeckFileSchema.safeParse(raw);
  if (!r.success) return { ok: false, errors: r.error.issues.slice(0, 50).map((i) => `${formatPath(i.path)} : ${i.message}`) };

  const errors: string[] = [];
  const seen = new Set<string>();
  r.data.deck.cards.forEach((c, i) => {
    if (seen.has(c.id)) errors.push(`deck.cards[${i}].id : identifiant dupliqué "${c.id}"`);
    seen.add(c.id);
    if (c.type === 'multiple_choice' && c.correct.some((n) => n >= c.choices.length))
      errors.push(`deck.cards[${i}].correct : index hors de la liste des choix`);
  });
  return errors.length ? { ok: false, errors } : { ok: true, data: r.data };
}

export const cardUid = (deckId: string, cardId: string) => `${deckId}::${cardId}`;

export function hashCard(card: Card): string {
  const s = JSON.stringify(card);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
