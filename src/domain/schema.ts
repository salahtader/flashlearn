import { z } from 'zod';

const id = z.string().trim().min(1, 'champ obligatoire').max(120);
const text = z.string().trim().min(1, 'champ obligatoire').max(8000);
const code = z.object({ language: z.string().min(1).max(30), source: z.string().min(1).max(8000) });

const common = {
  id,
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  question: text,
  answer: text,
  explanation: z.string().max(8000).optional(),
  hint: z.string().max(2000).optional(),
  code: code.optional(),
  tags: z.array(z.string().max(60)).max(30).default([]),
  references: z.array(z.string().max(500)).max(20).default([]),
};

export const CardSchema = z.discriminatedUnion('type', [
  z.object({ ...common, type: z.literal('basic') }),
  z.object({ ...common, type: z.literal('code'), code }),
  z.object({
    ...common,
    type: z.literal('multiple_choice'),
    choices: z.array(z.string().min(1).max(500)).min(2).max(10),
    correct: z.array(z.number().int().min(0)).min(1),
  }),
]);

export const DeckFileSchema = z.object({
  schemaVersion: z.literal('1.0', { message: 'version de schéma non prise en charge (attendu "1.0")' }),
  deck: z.object({
    id,
    title: text,
    description: z.string().max(1000).optional(),
    // Parcours (optionnel) : level 1-3, order = position dans la matière, lesson = leçon Markdown lue avant les cartes.
    level: z.number().int().min(1).max(3).optional(),
    order: z.number().int().min(1).optional(),
    lesson: z.string().max(20000).optional(),
    subject: z.string().trim().min(1).max(60),
    language: z.string().max(10).default('fr'),
    tags: z.array(z.string().max(60)).max(30).default([]),
    cards: z.array(CardSchema).min(1).max(5000),
  }),
});

export type Card = z.infer<typeof CardSchema>;
export type DeckFile = z.infer<typeof DeckFileSchema>;
