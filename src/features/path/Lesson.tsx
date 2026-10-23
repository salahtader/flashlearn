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

  async function start() {
    if (deck?.lesson) await setProgress(deckId, { lessonReadAt: Date.now() });
    nav(`/review/${deckId}`);
  }
  const read = unit?.lessonRead;

  return (
    <>
      <Link to="/path" className="muted">← Parcours</Link>
      <h1>{unit ? `Unité ${deck.order} · ` : ''}{deck.title}</h1>
      {deck.lesson ? <article className="flash lesson"><Md>{deck.lesson}</Md></article> : <p className="muted">Pas de leçon pour ce deck.</p>}
      <button className="btn primary big" onClick={start}>{read ? 'Aller aux cartes' : "J'ai compris — commencer les cartes"}</button>
    </>
  );
}
