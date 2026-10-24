import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import Md from '../../components/Markdown';
import { db } from '../../infrastructure/db';
import { loadUnits, setProgress } from './units';

export default function Lesson() {
  const { deckId = '' } = useParams();
  const nav = useNavigate();
  const deck = useLiveQuery(async () => (await db.decks.get(deckId)) ?? null, [deckId]);
  const unit = useLiveQuery(async () => (await loadUnits()).find((u) => u.deck.id === deckId) ?? null, [deckId]);
  if (deck === undefined || unit === undefined) return <p className="muted">Chargement…</p>;
  if (!deck) return <><p>Leçon introuvable.</p><Link to="/path">← Parcours</Link></>;

  if (unit?.status === 'locked') {
    return (
      <>
        <Link to="/path" className="muted">← Parcours</Link>
        <h1>🔒 {deck.title}</h1>
        <p>Valide d'abord l'unité précédente (leçon lue + toutes ses cartes vues une fois).</p>
        <button className="btn" onClick={() => setProgress(deckId, { unlocked: true })}>Débloquer quand même</button>
      </>
    );
  }

  async function start(dest: string) {
    if (deck?.lesson) await setProgress(deckId, { lessonReadAt: Date.now() });
    nav(dest);
  }
  const hasCards = (unit?.total ?? 1) > 0;
  const hasEx = (unit?.exTotal ?? 0) > 0;
  const read = unit?.lessonRead;

  return (
    <>
      <Link to="/path" className="muted">← Parcours</Link>
      <h1>{unit ? `Unité ${deck.order} · ` : ''}{deck.title}</h1>
      {deck.lesson ? <article className="flash lesson"><Md>{deck.lesson}</Md></article> : <p className="muted">Pas de leçon pour ce deck.</p>}
      {hasCards && <button className="btn primary big" onClick={() => start(`/review/${deckId}`)}>{read ? 'Aller aux cartes' : "J'ai compris — commencer les cartes"}</button>}
      {hasEx && <button className={`btn big ${hasCards ? '' : 'primary'}`} onClick={() => start(`/exercises/${deckId}`)}>{hasCards ? 'Aller aux exercices' : "J'ai compris — aux exercices"}</button>}
      {!hasCards && !hasEx && <button className="btn primary big" onClick={() => start('/path')}>J'ai compris</button>}
    </>
  );
}
