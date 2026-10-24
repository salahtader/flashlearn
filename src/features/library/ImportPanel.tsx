import { useRef, useState } from 'react';
import type { DeckFile } from '../../domain/schema';
import { parseDeckFile } from '../../infrastructure/json/parse';
import { parseCourseMd } from '../../infrastructure/md/parseCourse';
import template from '../../../docs/course-template.md?raw';
import { downloadText } from '../../utils/download';
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
    const text = await f.text();
    const r = f.name.toLowerCase().endsWith('.md') ? parseCourseMd(text) : parseDeckFile(text);
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
      <h2>Importer un cours (.md) ou un deck (.json)</h2>
      <input ref={input} type="file" accept=".md,.json,text/markdown,application/json" onChange={(e) => onPick(e.target.files?.[0])} />
      <button className="link" onClick={() => downloadText(template, 'modele-cours.md', 'text/markdown')}>Télécharger un modèle de cours (.md)</button>
      {done && <p className="ok">{done}</p>}
      {errors.length > 0 && (
        <ul className="errors">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      )}
      {file && preview && (
        <div className="preview">
          <p><strong>{file.deck.title}</strong> — {file.deck.subject} · {file.deck.cards.length} cartes · {file.deck.exercises.length} exercices{file.deck.lesson ? ' · avec leçon' : ''}</p>
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
