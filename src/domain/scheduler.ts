import { createEmptyCard, fsrs, generatorParameters, Rating, type Card as FCard, type Grade } from 'ts-fsrs';

// Seul fichier qui connaît ts-fsrs : remplaçable sans toucher à l'UI.
const engine = fsrs(generatorParameters({ enable_fuzz: true }));

export const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: Rating.Again, label: 'À revoir', key: '1' },
  { grade: Rating.Hard, label: 'Difficile', key: '2' },
  { grade: Rating.Good, label: 'Bien', key: '3' },
  { grade: Rating.Easy, label: 'Facile', key: '4' },
];

export function previewAll(card: FCard | null, now = new Date()) {
  return engine.repeat(card ?? createEmptyCard(now), now);
}

export function applyGrade(card: FCard | null, grade: Grade, now = new Date()): FCard {
  return engine.next(card ?? createEmptyCard(now), now, grade).card;
}
