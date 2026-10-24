import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { loadUnits, setProgress, type Unit } from './units';

const LEVELS: Record<number, string> = { 1: 'Niveau 1 — Débutant', 2: 'Niveau 2 — Intermédiaire', 3: 'Niveau 3 — Avancé' };
const BADGE = { locked: '🔒 Verrouillé', lesson: '📖 Leçon à lire', learning: 'En cours', done: '✓ Validé' } as const;

export default function Path() {
  const units = useLiveQuery(loadUnits, []);
  if (!units) return <p className="muted">Chargement…</p>;
  if (!units.length) return <><h1>Parcours</h1><p className="muted">Aucun parcours disponible.</p></>;
  const subjects = [...new Set(units.map((u) => u.deck.subject))];
  return (
    <>
      <h1>Parcours</h1>
      <p className="muted">
        Chaque unité : une courte leçon, puis ses cartes. Une unité est validée quand la leçon est lue et que toutes ses cartes ont été vues une fois ; la suivante s'ouvre alors.
      </p>
      {subjects.map((subject) => {
        const list = units.filter((u) => u.deck.subject === subject);
        const levels = [...new Set(list.map((u) => u.deck.level ?? 1))].sort();
        return (
          <section key={subject}>
            <h2>{subject} — {list.filter((u) => u.status === 'done').length}/{list.length} unités validées</h2>
            {levels.map((l) => (
              <div key={l}>
                <h3 className="level">{LEVELS[l] ?? `Niveau ${l}`}</h3>
                {list.filter((u) => (u.deck.level ?? 1) === l).map((u) => <UnitCard key={u.deck.id} u={u} />)}
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}

function UnitCard({ u }: { u: Unit }) {
  const id = u.deck.id;
  const pct = u.total ? Math.round((u.seen / u.total) * 100) : 0;
  return (
    <div className={`card-box unit ${u.status}`}>
      <div className="row between">
        <strong>Unité {u.deck.order} · {u.deck.title}</strong>
        <span className="badge">{BADGE[u.status]}</span>
      </div>
      {u.deck.description && <div className="muted">{u.deck.description}</div>}
      <div className="bar"><div style={{ width: `${pct}%` }} /></div>
      <div className="muted">{u.total > 0 && `${u.seen}/${u.total} cartes vues`}{u.total > 0 && u.exTotal > 0 && ' · '}{u.exTotal > 0 && `${u.exDone}/${u.exTotal} exercices réussis`}</div>
      <div className="row">
        {u.status === 'locked' && (
          <button className="btn" onClick={() => confirm("Débloquer sans avoir validé l'unité précédente ?") && setProgress(id, { unlocked: true })}>
            Débloquer quand même
          </button>
        )}
        {u.status === 'lesson' && <Link className="btn primary" to={`/lesson/${id}`}>Lire la leçon</Link>}
        {(u.status === 'learning' || u.status === 'done') && (
          <>
            {u.total > 0 && <Link className="btn primary" to={`/review/${id}`}>{u.status === 'done' ? 'Réviser' : 'Continuer'} les cartes</Link>}
            {u.exTotal > 0 && <Link className="btn primary" to={`/exercises/${id}`}>Exercices</Link>}
            <Link className="btn" to={`/lesson/${id}`}>Leçon</Link>
          </>
        )}
      </div>
    </div>
  );
}
