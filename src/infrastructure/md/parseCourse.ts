import { parseDeckFile, type ParseResult } from '../json/parse';

/**
 * Format d'un cours Markdown (voir docs/course-template.md) :
 *   ---  en-tête  key: value  ---
 *   leçon (Markdown libre)
 *   @@ card|quiz|exercise <id> [easy|medium|hard] [titre]
 *   ::question / ::answer / ::choices / ::starter / ::solution / ...
 * Les lignes @@ et :: situées dans un bloc de code ``` sont ignorées.
 */
type BlockType = 'card' | 'quiz' | 'exercise';
interface Block { type: BlockType; id: string; difficulty: string; title: string; line: number; sections: Map<string, string> }

const DIRECTIVE = /^@@\s+(card|quiz|exercise)\s+([A-Za-z0-9_.-]+)(?:\s+(easy|medium|hard))?(?:\s+(.+))?\s*$/;
const SECTION = /^::([a-z]+)\s*$/;
const CHOICE = /^\s*[-*]\s*\[( |x|X)\]\s+(.+?)\s*$/;
const ALLOWED: Record<BlockType, string[]> = {
  card: ['question', 'answer', 'explanation', 'hint'],
  quiz: ['question', 'choices', 'answer', 'explanation', 'hint'],
  exercise: ['question', 'starter', 'solution', 'checks', 'hint', 'expected', 'explanation'],
};

const codeOf = (s: string) => {
  const m = s.match(/```[^\n]*\n([\s\S]*?)\n```/);
  return (m ? m[1] : s).replace(/\s+$/, '');
};

export function parseCourseMd(input: string): ParseResult {
  const errors: string[] = [];
  const lines = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') return { ok: false, errors: ['Ligne 1 : en-tête manquant (le fichier doit commencer par ---)'] };

  const meta: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length && lines[i].trim() !== '---'; i++) {
    const l = lines[i];
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const m = l.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (!m) { errors.push(`Ligne ${i + 1} : en-tête invalide « ${l} » (attendu : clé: valeur)`); continue; }
    meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  if (i >= lines.length) return { ok: false, errors: [...errors, 'En-tête non fermé (--- manquant)'] };
  i++;

  const lesson: string[] = [];
  const blocks: Block[] = [];
  let cur: Block | null = null;
  let sec: string | null = null;
  let buf: string[] = [];
  let inFence = false;
  const flush = () => { if (cur && sec !== null) cur.sections.set(sec, buf.join('\n').trim()); buf = []; };

  for (; i < lines.length; i++) {
    const line = lines[i];
    const isFence = line.trimStart().startsWith('```');
    if (isFence) inFence = !inFence;
    if (!inFence && !isFence) {
      const d = line.match(DIRECTIVE);
      if (d) {
        flush();
        cur = { type: d[1] as BlockType, id: d[2], difficulty: d[3] ?? 'medium', title: (d[4] ?? '').trim(), line: i + 1, sections: new Map() };
        blocks.push(cur); sec = null;
        continue;
      }
      if (line.startsWith('@@')) { errors.push(`Ligne ${i + 1} : directive invalide « ${line} » (attendu : @@ card|quiz|exercise id [easy|medium|hard] [titre])`); continue; }
      const s = line.match(SECTION);
      if (s && cur) {
        flush();
        if (cur.sections.has(s[1])) errors.push(`Ligne ${i + 1} : section ::${s[1]} en double dans « ${cur.id} »`);
        sec = s[1];
        continue;
      }
    }
    if (!cur) lesson.push(line);
    else if (sec !== null) buf.push(line);
    else if (line.trim()) errors.push(`Ligne ${i + 1} : texte en dehors d'une section ::nom dans « ${cur.id} »`);
  }
  flush();

  for (const k of ['id', 'title', 'subject']) if (!meta[k]) errors.push(`En-tête : « ${k} » obligatoire`);
  const int = (k: string, min: number, max: number): number | undefined => {
    if (meta[k] === undefined || meta[k] === '') return undefined;
    const n = Number(meta[k]);
    if (!Number.isInteger(n) || n < min || n > max) { errors.push(`En-tête : « ${k} » doit être un entier entre ${min} et ${max}`); return undefined; }
    return n;
  };
  const level = int('level', 1, 3);
  const order = int('order', 1, 9999);

  const cards: unknown[] = [];
  const exercises: unknown[] = [];
  for (const b of blocks) {
    const g = (k: string) => b.sections.get(k) ?? '';
    const where = `${b.type} « ${b.id} » (ligne ${b.line})`;
    for (const k of b.sections.keys()) if (!ALLOWED[b.type].includes(k)) errors.push(`${where} : section ::${k} non autorisée`);
    const need = (k: string) => { if (!g(k)) errors.push(`${where} : section ::${k} manquante ou vide`); return g(k); };

    if (b.type === 'card') {
      cards.push({ id: b.id, type: 'basic', difficulty: b.difficulty, question: need('question'), answer: need('answer'), explanation: g('explanation') || undefined, hint: g('hint') || undefined });
    } else if (b.type === 'quiz') {
      const choices: string[] = [];
      const correct: number[] = [];
      for (const l of g('choices').split('\n')) {
        if (!l.trim()) continue;
        const m = l.match(CHOICE);
        if (!m) { errors.push(`${where} : choix invalide « ${l.trim()} » (attendu : - [ ] texte ou - [x] texte)`); continue; }
        if (m[1].toLowerCase() === 'x') correct.push(choices.length);
        choices.push(m[2]);
      }
      if (choices.length < 2) errors.push(`${where} : au moins 2 choix requis`);
      if (!correct.length) errors.push(`${where} : au moins une bonne réponse requise (- [x])`);
      need('question');
      cards.push({
        id: b.id, type: 'multiple_choice', difficulty: b.difficulty, question: g('question'), choices, correct,
        answer: g('answer') || `**${correct.map((n) => choices[n]).join(' · ')}**`,
        explanation: g('explanation') || undefined, hint: g('hint') || undefined,
      });
    } else {
      exercises.push({
        id: b.id, difficulty: b.difficulty, title: b.title || b.id, prompt: need('question'),
        starter: codeOf(g('starter')), solution: codeOf(need('solution')),
        explanation: g('explanation') || undefined,
        hints: g('hint') ? g('hint').split(/\n-{3,}\n/).map((h) => h.trim()).filter(Boolean) : [],
        checks: g('checks').split('\n').map((l) => l.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim()).filter((x): x is string => !!x),
        expected: g('expected') ? codeOf(g('expected')) : undefined,
      });
    }
  }
  if (errors.length) return { ok: false, errors: errors.slice(0, 50) };

  return parseDeckFile(JSON.stringify({
    schemaVersion: '1.0',
    deck: {
      id: meta.id, title: meta.title, description: meta.description || undefined, subject: meta.subject,
      language: meta.language || 'fr', tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      level, order, lesson: lesson.join('\n').trim() || undefined, cards, exercises,
    },
  }));
}
