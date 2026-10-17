import { useRef, useState } from 'react';
import type { DeckFile } from '../../domain/schema';
import { parseDeckFile } from '../../infrastructure/json/parse';
import { applyImport, previewImport, type DuplicateMode, type ImportPreview } from '../../infrastructure/json/import';

export default function ImportPanel() {
  const input = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [file, setFile] = useState<DeckFile | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mode, setMode] = useState<DuplicateMode>('update');
  const [done, setDone] = useState('');

  const reset = () => { setFile(null); setPreview(null); setErrors([]); if (input.current) input.current.value = ''; };

  async function onPick(f?: File) {
    setDone(''); setErrors([]); setFile(null); setPreview(null);
    if (!f) return;
    const r = parseDeckFile(await f.text());
    if (!r.ok) { setErrors(r.errors); return; }
    setFile(r.data);
    setPreview(await previewImport(r.data));
  }
  async function confirm() {
    if (!file) return;
    try {
      await applyImport(file, mode);
      setDone(`« ${file.deck.title} » importé.`);
      reset();
    } catch (e) { setErrors([`Échec (aucune donnée modifiée) : ${(e as Error).message}`]); }
  }

  return (
    <section className="card-box">
      <h2>Importer un deck JSON</h2>
      <input ref={input} type="file" accept=".json,application/json" onChange={(e) => onPick(e.target.files?.[0])} />
      {done && <p className="ok">{done}</p>}
      {errors.length > 0 && (
        <ul className="errors">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      )}
      {file && preview && (
        <div className="preview">
          <p><strong>{file.deck.title}</strong> — {file.deck.subject} · {file.deck.cards.length} cartes</p>
          <p className="muted">
            {preview.fresh} nouvelles · {preview.changed} modifiées · {preview.same} identiques
            {preview.deckExists && ' · le deck existe déjà'}
          </p>
          {(preview.changed > 0 || preview.same > 0) && (
            <label className="field">Doublons
              <select value={mode} onChange={(e) => setMode(e.target.value as DuplicateMode)}>
                <option value="update">Mettre à jour (progression conservée)</option>
                <option value="skip">Ignorer les doublons</option>
              </select>
            </label>
          )}
          <div className="row">
            <button className="btn primary" onClick={confirm}>Importer</button>
            <button className="btn" onClick={reset}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}
