import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getSettings, setSetting, type Settings as S } from '../../infrastructure/settings';
import { createBackup, restoreBackup } from '../../infrastructure/backup';
import { downloadJson } from '../../utils/download';

export default function Settings() {
  const s = useLiveQuery(getSettings, []);
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  if (!s) return null;

  const num = (key: 'newPerDay' | 'maxReviews' | 'dayStartHour', label: string, min: number, max: number) => (
    <label className="field">{label}
      <input type="number" min={min} max={max} value={s[key]}
        onChange={(e) => { const v = Math.min(max, Math.max(min, Number(e.target.value) || min)); setSetting(key, v as S[typeof key]); }} />
    </label>
  );

  async function restore(f?: File) {
    if (!f) return;
    if (!confirm('Remplacer TOUTES les données actuelles par cette sauvegarde ?')) return;
    try { await restoreBackup(await f.text()); setMsg('Sauvegarde restaurée.'); }
    catch (e) { setMsg(`Erreur : ${(e as Error).message}`); }
    if (file.current) file.current.value = '';
  }

  return (
    <>
      <h1>Réglages</h1>
      <section className="card-box">
        <h2>Sessions</h2>
        {num('newPerDay', 'Nouvelles cartes par jour', 0, 200)}
        {num('maxReviews', 'Révisions max par session', 1, 1000)}
        {num('dayStartHour', "Heure de début du jour d'étude (0–23)", 0, 23)}
      </section>
      <section className="card-box">
        <h2>Sauvegarde</h2>
        <p className="muted">Complète : decks, cartes, progression et historique. À faire régulièrement (le navigateur peut purger les données locales).</p>
        <div className="row">
          <button className="btn primary" onClick={async () => { downloadJson(await createBackup(), `flashlearn-backup-${new Date().toISOString().slice(0, 10)}.json`); setMsg('Sauvegarde exportée.'); }}>Exporter</button>
          <button className="btn" onClick={() => file.current?.click()}>Restaurer…</button>
          <input ref={file} type="file" accept=".json,application/json" hidden onChange={(e) => restore(e.target.files?.[0])} />
        </div>
        {msg && <p className="ok">{msg}</p>}
        <p className="muted">Dernière sauvegarde : {s.lastBackupAt ? new Date(s.lastBackupAt).toLocaleString('fr-FR') : 'jamais'}</p>
      </section>
      <p className="muted">FlashLearn v{__APP_VERSION__} · build {__BUILD_DATE__}</p>
    </>
  );
}
