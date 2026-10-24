import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Md from '../../components/Markdown';
import { db, type DeckRow, type ExerciseRow } from '../../infrastructure/db';
import { downloadText } from '../../utils/download';

const CodeEditor = lazy(() => import('../../components/CodeEditor'));

export default function Exercise() {
  const { deckId = '', exId = '' } = useParams();
  const key = `${deckId}::${exId}`;
  const [deck, setDeck] = useState<DeckRow | null | undefined>(undefined);
  const [code, setCode] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const ex = deck?.exercises?.find((e) => e.id === exId);

  useEffect(() => {
    (async () => {
      const d = await db.decks.get(deckId);
      const row = await db.exercises.get(key);
      setDeck(d ?? null);
      setCode(row?.code ?? d?.exercises?.find((e) => e.id === exId)?.starter ?? '');
      setDone(!!row?.done);
    })();
    return () => window.clearTimeout(timer.current);
  }, [deckId, exId, key]);

  async function save(patch: Partial<ExerciseRow>) {
    const cur = await db.exercises.get(key);
    await db.exercises.put({ key, deckId, exId, code: '', done: false, ...cur, ...patch, updatedAt: Date.now() });
  }
  function onChange(v: string) {
    setCode(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save({ code: v }), 500);
  }
  async function toggleDone() {
    const next = !done;
    await save({ done: next, doneAt: next ? Date.now() : undefined });
    setDone(next);
  }
  async function reset() {
    if (!ex || !confirm('Remettre le code de départ ? Ton code actuel sera perdu.')) return;
    setCode(ex.starter);
    await save({ code: ex.starter });
  }
  async function copy() {
    try { await navigator.clipboard.writeText(code ?? ''); setMsg('Code copié.'); } catch { setMsg('Copie impossible : sélectionne le code à la main.'); }
    setTimeout(() => setMsg(''), 2000);
  }

  if (deck === undefined || code === null) return <p className="muted">Chargement…</p>;
  if (!ex) return <><p>Exercice introuvable.</p><Link to="/path">← Parcours</Link></>;

  return (
    <>
      <Link to={`/exercises/${deckId}`} className="muted">← Exercices</Link>
      <h1>{done ? '✓ ' : ''}{ex.title}</h1>
      <article className="flash"><Md>{ex.prompt}</Md></article>

      {ex.expected && (
        <details className="card-box"><summary>Sortie attendue</summary><pre className="plain">{ex.expected}</pre></details>
      )}

      <h2>Ton code</h2>
      <Suspense fallback={<p className="muted">Chargement de l'éditeur…</p>}>
        <CodeEditor value={code} onChange={onChange} />
      </Suspense>
      <div className="row">
        <button className="btn" onClick={copy}>Copier</button>
        <button className="btn" onClick={() => downloadText(code, 'Main.java')}>Télécharger Main.java</button>
        <button className="btn" onClick={reset}>Réinitialiser</button>
      </div>
      <p className="muted">Pour tester chez toi (JDK installé) : <code>javac Main.java &amp;&amp; java Main</code>. Le code est sauvegardé automatiquement.</p>
      {msg && <p className="ok">{msg}</p>}

      {ex.checks.length > 0 && (
        <section className="card-box">
          <strong>Critères de réussite</strong>
          {ex.checks.map((c, i) => (
            <label key={i} className="check"><input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })} /> {c}</label>
          ))}
        </section>
      )}

      {ex.hints.slice(0, hints).map((h, i) => <div key={i} className="hint"><Md>{`**Indice ${i + 1}.** ${h}`}</Md></div>)}
      <div className="row">
        {hints < ex.hints.length && <button className="btn" onClick={() => setHints(hints + 1)}>💡 Indice ({hints}/{ex.hints.length})</button>}
        {!showSolution && <button className="btn" onClick={() => confirm('Afficher la solution ? Essaie encore un peu avant : c\'est là que tu apprends.') && setShowSolution(true)}>Voir la solution</button>}
        <button className={`btn ${done ? '' : 'primary'}`} onClick={toggleDone}>{done ? 'Marquer non réussi' : "J'ai réussi ✓"}</button>
      </div>

      {showSolution && (
        <section>
          <h2>Solution</h2>
          <Suspense fallback={null}><CodeEditor value={ex.solution} readOnly /></Suspense>
          {ex.explanation && <article className="flash"><Md>{ex.explanation}</Md></article>}
        </section>
      )}
    </>
  );
}
