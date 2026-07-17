# ApliRegle

Application mobile Expo pour Android et iOS dediee au suivi du cycle menstruel.

## Fonctionnalites de cette premiere base

- tableau de bord du cycle
- navigation interne simple entre suivi, statistiques et profil
- calendrier menstruel mensuel
- prediction des prochaines regles
- fenetre fertile estimee
- detail journalier avec flux, douleur, humeur, sommeil, symptomes et notes
- edition d'une journee avec sauvegarde locale sur l'appareil
- edition du profil du cycle avec sauvegarde locale
- statistiques rapides sur les douleurs, le sommeil, les symptomes et les entrees recentes

## Lancer le projet

```bash
npm install
npm run android
npm run ios
npm run web
```

## Structure

- `App.tsx` : interface principale, onglets et formulaires
- `src/data/cycleData.ts` : types et donnees de demonstration
- `src/lib/cycle.ts` : logique calendrier et prediction
- `src/lib/insights.ts` : calculs de statistiques
- `src/lib/storage.ts` : cles de sauvegarde locale

## Suite conseillee

- ajouter notifications et rappels
- remplacer la navigation simple par une vraie navigation native
- connecter une base distante pour synchronisation et compte utilisateur
