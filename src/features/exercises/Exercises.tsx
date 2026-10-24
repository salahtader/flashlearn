import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db';

const DIFF = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' } as const;

export default function Exercises() {
  const { deckId = '' } = useParams();
  const deck = useLiveQuery(async () => (await db.decks.get(deckId)) ?? null, [deckId]);
  const rows = useLiveQuery(() => db.exercises.where('deckId').equals(deckId).toArray(), [deckId]);
  if (deck === undefined || !rows) return <p className="muted">Chargement…</p>;
  if (!deck) return <><p>Unité introuvable.</p><Link to="/path">← Parcours</Link></>;
  const done = new Set(rows.filter((r) => r.done).map((r) => r.exId));
  const list = deck.exercises ?? [];
  return (
    <>
      <Link to="/path" className="muted">← Parcours</Link>
      <h1>Exercices · {deck.title}</h1>
      <p className="muted">{list.filter((e) => done.has(e.id)).length}/{list.length} réussis</p>
      {list.length === 0 && <p className="muted">Aucun exercice dans cette unité.</p>}
      {list.map((e) => (
        <Link key={e.id} to={`/exercise/${deckId}/${e.id}`} className="card-box ex-item">
          <strong>{done.has(e.id) ? '✓ ' : '○ '}{e.title}</strong>
          <span className="muted"> · {DIFF[e.difficulty]}</span>
        </Link>
      ))}
    </>
  );
}
