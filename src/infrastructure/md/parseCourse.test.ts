import { describe, expect, it } from 'vitest';
import { parseCourseMd } from './parseCourse';

const head = '---\nid: u\nsubject: S\ntitle: T\nlevel: 2\norder: 3\n---\n';

describe('parseCourseMd', () => {
  it('lit en-tête, leçon, carte, quiz et exercice', () => {
    const md = head + `# Leçon
texte

@@ card c1 easy
::question
Q ?
::answer
R
@@ quiz q1
::question
Q2
::choices
- [ ] a
- [x] b
@@ exercise e1 hard Mon titre
::question
Énoncé
::starter
\`\`\`java
class A {}
\`\`\`
::solution
\`\`\`java
class A { int x; }
\`\`\`
::checks
- un
- deux
::hint
h1
---
h2
`;
    const r = parseCourseMd(md);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const d = r.data.deck;
    expect([d.level, d.order]).toEqual([2, 3]);
    expect(d.lesson).toContain('# Leçon');
    expect(d.cards).toHaveLength(2);
    expect(d.cards[1]).toMatchObject({ type: 'multiple_choice', correct: [1], choices: ['a', 'b'] });
    expect(d.exercises[0]).toMatchObject({ id: 'e1', title: 'Mon titre', difficulty: 'hard', starter: 'class A {}', checks: ['un', 'deux'], hints: ['h1', 'h2'] });
  });
  it('ignore @@ et :: dans les blocs de code', () => {
    const r = parseCourseMd(head + '# L\n```\n@@ card x\n::question\n```\n@@ card c1\n::question\nQ\n::answer\nA\n');
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.data.deck.cards).toHaveLength(1); expect(r.data.deck.lesson).toContain('@@ card x'); }
  });
  it('signale les erreurs avec numéro de ligne', () => {
    const r = parseCourseMd(head + '@@ quiz q1\n::question\nQ\n::choices\n- [ ] a\n- [ ] b\n');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join('\n')).toMatch(/bonne réponse.*|ligne 8/i);
  });
  it('exige un en-tête', () => {
    expect(parseCourseMd('# sans en-tête').ok).toBe(false);
    expect(parseCourseMd('---\nid: a\n---\n').ok).toBe(false);
  });
  it('rejette les sections inconnues et les identifiants dupliqués', () => {
    expect(parseCourseMd(head + '@@ card c1\n::question\nQ\n::answer\nA\n::foo\nx\n').ok).toBe(false);
    expect(parseCourseMd(head + '@@ card c1\n::question\nQ\n::answer\nA\n@@ card c1\n::question\nQ\n::answer\nA\n').ok).toBe(false);
  });
});
