import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { computeStats } from './stats';

export default function Dashboard() {
  const s = useLiveQuery(computeStats, []);
  if (!s) return <p className="muted">Chargement…</p>;
  const available = s.due + s.fresh;
  return (
    <>
      <h1>FlashLearn</h1>
      {s.backupOverdue && (
        <div className="banner">Pas de sauvegarde depuis plus de 14 jours. <Link to="/settings">Exporter mes données</Link></div>
      )}
      <Link to="/review" className={`btn primary big ${available === 0 ? 'disabled' : ''}`}>
        {s.due > 0 ? `Commencer la session (${s.due} à réviser)` : s.fresh > 0 ? 'Apprendre de nouvelles cartes' : 'Rien à réviser pour le moment'}
      </Link>
      <div className="grid">
        <Stat label="À réviser" value={s.due} />
        <Stat label="Nouvelles" value={s.fresh} />
        <Stat label="En apprentissage" value={s.learning} />
        <Stat label="Maîtrisées" value={s.mastered} hint="stabilité ≥ 21 j" />
        <Stat label="Révisées aujourd'hui" value={s.today} />
        <Stat label="Série" value={`${s.streak} j`} />
        <Stat label="Réussite 7 j" value={s.successRate === null ? '—' : `${Math.round(s.successRate * 100)} %`} hint="Bien + Facile" />
        <Stat label="Total cartes" value={s.total} />
      </div>
      <h2>Modes</h2>
      <div className="row">
        <Link className="btn" to="/review?mode=due">Révisions dues</Link>
        <Link className="btn" to="/review?mode=new">Nouvelles cartes</Link>
        <Link className="btn" to="/review?mode=hard">Cartes difficiles</Link>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="stat">
      <div className="v">{value}</div>
      <div className="l">{label}</div>
      {hint && <div className="h">{hint}</div>}
    </div>
  );
}
