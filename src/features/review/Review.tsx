import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { State, type Grade } from 'ts-fsrs';
import Md, { fenced } from '../../components/Markdown';
import { applyGrade, GRADES, previewAll } from '../../domain/scheduler';
import { db, type StateRow } from '../../infrastructure/db';
import { formatDuration, formatInterval } from '../../utils/time';
import { buildQueue, type Mode, type QueueItem } from './queue';

interface Last { item: QueueItem; prev: StateRow | null; logId: number; rating: Grade }

export default function Review() {
  const { deckId } = useParams();
  const [sp] = useSearchParams();
  const mode = (sp.get('mode') ?? 'mixed') as Mode;

  const [queue, setQueue] = useState<QueueItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [last, setLast] = useState<Last | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [reviewed, setReviewed] = useState(0);
  const startedAt = useRef(Date.now());
  const shownAt = useRef(Date.now());

  useEffect(() => {
    buildQueue(mode, deckId).then((q) => { setQueue(q); setTotal(q.length); shownAt.current = Date.now(); });
  }, [mode, deckId]);

  const item = queue?.[0];
  const intervals = useMemo(() => (item ? previewAll(item.state?.card ?? null) : null), [item]);

  const rate = useCallback(async (g: Grade) => {
    if (!queue?.length) return;
    const cur = queue[0];
    const now = new Date();
    const next = applyGrade(cur.state?.card ?? null, g, now);
    const row: StateRow = { cardUid: cur.card.uid, deckId: cur.card.deckId, card: next, due: next.due.getTime() };
    const logId = (await db.transaction('rw', db.states, db.logs, async () => {
      await db.states.put(row);
      return db.logs.add({
        cardUid: cur.card.uid, deckId: cur.card.deckId, at: now.getTime(), rating: g,
        prevState: cur.state?.card.state ?? State.New, ms: now.getTime() - shownAt.current, mode,
      });
    })) as number;
    setLast({ item: cur, prev: cur.state, logId, rating: g });
    setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
    setReviewed((n) => n + 1);
    // Carte en (ré)apprentissage due dans < 20 min : on la remet en fin de file.
    const again = next.due.getTime() - now.getTime() < 20 * 60000;
    setQueue((q) => { const [, ...rest] = q ?? []; return again ? [...rest, { card: cur.card, state: row }] : rest; });
    setRevealed(false); setPicked([]); shownAt.current = Date.now();
  }, [queue, mode]);

  const undo = useCallback(async () => {
    if (!last) return;
    await db.transaction('rw', db.states, db.logs, async () => {
      await db.logs.delete(last.logId);
      if (last.prev) await db.states.put(last.prev); else await db.states.delete(last.item.card.uid);
    });
    setQueue((q) => [last.item, ...(q ?? []).filter((x) => x.card.uid !== last.item.card.uid)]);
    setCounts((c) => ({ ...c, [last.rating]: c[last.rating] - 1 }));
    setReviewed((n) => n - 1);
    setLast(null); setRevealed(false); setPicked([]); shownAt.current = Date.now();
  }, [last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea') || e.ctrlKey || e.metaKey) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (item && !revealed) setRevealed(true); }
      else if (revealed && ['1', '2', '3', '4'].includes(e.key)) rate(Number(e.key) as Grade);
      else if (e.key === 'z' || e.key === 'Backspace') undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, revealed, rate, undo]);

  if (!queue) return <p className="muted">Chargement…</p>;

  if (!item) {
    const good = counts[3] + counts[4];
    return (
      <>
        <h1>{reviewed ? 'Session terminée' : 'Rien à réviser'}</h1>
        {reviewed > 0 ? (
          <div className="card-box">
            <p><strong>{reviewed}</strong> réponses en {formatDuration(Date.now() - startedAt.current)}</p>
            <p className="muted">À revoir {counts[1]} · Difficile {counts[2]} · Bien {counts[3]} · Facile {counts[4]}</p>
            <p className="muted">Réponses correctes (Bien + Facile) : {Math.round((good / reviewed) * 100)} %</p>
          </div>
        ) : (
          <p className="muted">{total === 0 ? 'Aucune carte disponible dans ce mode (decks désactivés, limite de nouvelles atteinte ou tout est à jour).' : ''}</p>
        )}
        <div className="row">
          {last && <button className="btn" onClick={undo}>Annuler la dernière note</button>}
          <Link className="btn primary" to="/">Tableau de bord</Link>
        </div>
      </>
    );
  }

  const c = item.card;
  const multi = c.type === 'multiple_choice' && c.correct.length > 1;
  const toggle = (i: number) => { if (revealed) return; setPicked((p) => (multi ? (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]) : [i])); };
  const progress = reviewed / (reviewed + queue.length);
  const now = new Date();

  return (
    <>
      <div className="row between">
        <Link to="/" className="muted">← Quitter</Link>
        <span className="muted">{queue.length} restantes · {c.difficulty}{item.state === null ? ' · nouvelle' : ''}</span>
      </div>
      <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>

      <article className="flash">
        <Md>{c.question}</Md>
        {c.code && <Md>{fenced(c.code.language, c.code.source)}</Md>}

        {c.type === 'multiple_choice' && (
          <ul className="choices">
            {c.choices.map((ch, i) => {
              const ok = c.correct.includes(i);
              const cls = revealed ? (ok ? 'good' : picked.includes(i) ? 'bad' : '') : picked.includes(i) ? 'sel' : '';
              return <li key={i}><button className={cls} onClick={() => toggle(i)}>{ch}</button></li>;
            })}
          </ul>
        )}

        {revealed && (
          <div className="answer">
            <hr />
            <Md>{c.answer}</Md>
            {c.explanation && <Md>{c.explanation}</Md>}
            {c.references.length > 0 && <p className="muted">Réf. : {c.references.join(' · ')}</p>}
          </div>
        )}
      </article>

      {!revealed ? (
        <button className="btn primary big" onClick={() => setRevealed(true)}>Afficher la réponse <kbd>Espace</kbd></button>
      ) : (
        <div className="grades">
          {GRADES.map(({ grade, label, key }) => (
            <button key={grade} className={`g g${grade}`} onClick={() => rate(grade)}>
              <span>{label}</span>
              <small>{intervals ? formatInterval(now, intervals[grade].card.due) : ''} · {key}</small>
            </button>
          ))}
        </div>
      )}
      {last && <button className="link" onClick={undo}>↶ Annuler la dernière note (Z)</button>}
    </>
  );
}
