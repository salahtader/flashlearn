import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db';
import { getSettings } from '../../infrastructure/settings';
import { deleteDeck, exportDeck } from '../../infrastructure/json/import';
import { isDue } from '../review/queue';
import { endOfStudyDay } from '../../utils/time';
import { downloadJson } from '../../utils/download';
import ImportPanel from './ImportPanel';

export default function Library() {
  const [q, setQ] = useState('');
  const rows = useLiveQuery(async () => {
    const s = await getSettings();
    const now = Date.now();
    const eod = endOfStudyDay(new Date(), s.dayStartHour).getTime();
    const decks = await db.decks.toArray();
    return Promise.all(decks.map(async (deck) => {
      const cards = await db.cards.where('deckId').equals(deck.id).count();
      const states = await db.states.where('deckId').equals(deck.id).toArray();
      return { deck, cards, due: states.filter((x) => isDue(x, now, eod)).length, fresh: cards - states.length };
    }));
  }, []);

  const needle = q.trim().toLowerCase();
  const list = (rows ?? []).filter(({ deck }) =>
    !needle || [deck.title, deck.subject, ...deck.tags].some((t) => t.toLowerCase().includes(needle)));

  async function remove(id: string, title: string) {
    if (confirm(`Supprimer « ${title} », ses cartes et son historique ? Action irréversible.`)) await deleteDeck(id);
  }

  return (
    <>
      <h1>Bibliothèque</h1>
      <input className="search" type="search" placeholder="Rechercher (titre, matière, tag)…" value={q} onChange={(e) => setQ(e.target.value)} />
      {rows && list.length === 0 && <p className="muted">Aucun deck.</p>}
      {list.map(({ deck, cards, due, fresh }) => (
        <section key={deck.id} className={`card-box ${deck.enabled ? '' : 'off'}`}>
          <div className="row between">
            <div>
              <strong>{deck.title}</strong>
              <div className="muted">{deck.subject}{deck.builtin ? ' · fourni' : ''} · {cards} cartes · {due} dues · {fresh} nouvelles</div>
              {deck.description && <div className="muted">{deck.description}</div>}
            </div>
            <label className="switch" title="Activer / désactiver">
              <input type="checkbox" checked={deck.enabled} onChange={(e) => db.decks.update(deck.id, { enabled: e.target.checked })} />
            </label>
          </div>
          <div className="row">
            <Link className="btn primary" to={`/review/${deck.id}`}>Réviser</Link>
            <button className="btn" onClick={async () => downloadJson(await exportDeck(deck.id), `${deck.id}.json`)}>Exporter</button>
            {!deck.builtin && <button className="btn danger" onClick={() => remove(deck.id, deck.title)}>Supprimer</button>}
          </div>
        </section>
      ))}
      <ImportPanel />
    </>
  );
}
