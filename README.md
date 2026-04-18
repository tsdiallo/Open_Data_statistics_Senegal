# Sénégal en chiffres

Plateforme web francophone qui rassemble et explique simplement les données
publiques sur le Sénégal : démographie, économie, climat. MVP statique,
déployé sur Netlify.

## Sources

- **ANSD** — snapshot manuel trimestriel (pas d'API publique).
- **ANACIM** — référence officielle citée ; données automatisées via
  Open-Meteo (modèle ERA5) en quasi temps réel.
- **FMI — World Economic Outlook** — PIB, croissance, inflation, dette.
- **Banque mondiale — World Development Indicators** — démographie longue.

Aucune valeur n'est inventée : si une API est indisponible, le JSON
existant est conservé et l'interface affiche un état vide.

## Stack

- [Astro 4](https://astro.build/) (statique)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Chart.js 4](https://www.chartjs.org/) (chargé paresseusement par
  `IntersectionObserver`, pas de framework UI)
- TypeScript strict
- [Netlify](https://www.netlify.com/) (build + Functions v2)

## Démarrage local

Pré-requis : Node 20 (voir `.nvmrc`).

```bash
npm install
npm run refresh   # facultatif : rafraîchit src/data/*.json depuis les API
npm run dev       # http://localhost:4321
```

`npm run build` exécute automatiquement `refresh` puis `astro build`.

## Architecture

```
src/
 ├── components/    layout, ui, charts (LineChart, BarChart)
 ├── content/       explanations.ts (index pédagogique par indicateur)
 ├── data/          *.json générés ou snapshots manuels
 ├── lib/           types, format FR, accès dataset
 ├── pages/         index, demographie, economie, climat, methodologie
 └── styles/        global.css
scripts/
 └── refresh-data.mjs    fetch FMI + BM + Open-Meteo, écrit src/data/
netlify/functions/
 ├── weather.mjs              proxy 7 jours pour 6 villes
 └── scheduled-refresh.mjs    cron @daily → POST sur le build hook
```

## Déploiement Netlify

1. **Connecter le dépôt** : Netlify > Add new site > Import from Git, choisir
   `tsdiallo/Open_Data_statistics_Senegal`, branche `main`.
2. **Build settings** : laisser les valeurs par défaut, elles sont déjà dans
   `netlify.toml` (`npm run build`, publish `dist/`, Node 20, functions
   `netlify/functions`).
3. **(Optionnel) Rebuild quotidien** :
   - Site settings > Build & deploy > Build hooks > New hook → copier l'URL.
   - Site settings > Environment variables → ajouter
     `REFRESH_BUILD_HOOK = <url>`.
   - La fonction `scheduled-refresh` (cron `@daily`) déclenchera un rebuild
     quotidien qui réexécute `refresh-data.mjs`.
4. **Première mise en ligne** : `Deploy site`. Le build prend ~1 min.

Aucune clé d'API n'est requise (FMI, Banque mondiale et Open-Meteo sont
ouvertes et sans authentification).

## Mettre à jour un snapshot ANSD

1. Récupérer la publication sur https://www.ansd.sn/
2. Compléter `src/data/ansd-snapshot.example.json` puis l'enregistrer en
   `ansd-snapshot.json` ou intégrer directement les indicateurs dans
   `src/data/demography.json` ou `src/data/economy.json`.
3. Renseigner `source.retrievedAt` au format ISO et choisir la `nature`
   (`historique`, `estimation`, `projection`).
4. Commit + push : Netlify rebuild automatiquement.

## Bonnes pratiques

- Toujours afficher source, date et nature de la donnée (composant
  `SourceBadge`).
- Ne jamais promettre du « temps réel » si la source ne le permet pas.
- Garder les explications pédagogiques courtes : 1 phrase par item du bloc
  *Comprendre cet indicateur*.

## Licence

Code sous licence [MIT](LICENSE). Données sous licence de leurs producteurs
respectifs.
