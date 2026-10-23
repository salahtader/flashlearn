# FlashLearn

Révision par cartes avec répétition espacée (FSRS), 100 % hors-ligne (PWA), données locales (IndexedDB).

## Démarrer
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest : validateur d'import, scheduler, jour d'étude
npm run build    # dist/
```

## Parcours (leçons avant les cartes)
Un deck avec `order` fait partie du parcours de sa matière ; `level` (1-3) le range dans un niveau ; `lesson` (Markdown) est lue avant les cartes.
Une unité est **validée** quand la leçon est lue et que toutes ses cartes ont été vues une fois : la suivante s'ouvre (déblocage manuel possible).
Une carte peut avoir un `hint` (bouton « Indice »). Le parcours Java est dans `content/java/path/` (13 unités, 75 cartes).

## Ajouter du contenu (sans toucher au code)
- **Decks fournis** : déposer un `.json` dans `content/<matière>/` (intégré au démarrage, mis à jour si le contenu change).
- **Import utilisateur** : Bibliothèque → Importer un deck JSON (aperçu, validation avec chemin d'erreur, mode doublons).

## Format JSON (`schemaVersion: "1.0"`)
Types : `basic`, `code` (champ `code: {language, source}` obligatoire), `multiple_choice` (`choices`, `correct` = index).
`question`, `answer`, `explanation` sont en **Markdown** (HTML brut non interprété). `code` est optionnel sur les autres types.
Identifiant de carte unique par deck ; la progression est liée à `deck.id + card.id` (modifier le texte ne l'efface pas).

## Déploiement
- **Vercel / Cloudflare Pages** : importer le dépôt, build `npm run build`, sortie `dist`.
- **GitHub Pages** : Settings → Pages → Source « GitHub Actions » ; le workflow `.github/workflows/deploy.yml` fait le reste.
`base: './'` + `HashRouter` : aucune configuration SPA nécessaire.

## Architecture
`src/domain` (schéma Zod, scheduler FSRS isolé) · `src/infrastructure` (Dexie, import/export, sauvegarde) · `src/features` (UI par fonctionnalité).
Tables : `cards` (contenu), `states` (état FSRS), `logs` (journal append-only), `decks`, `settings`.

## Raccourcis (révision)
`Espace` afficher · `1–4` noter · `Z` annuler la dernière note.
