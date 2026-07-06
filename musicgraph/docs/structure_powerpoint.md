# Structure et Contenu des Diapositive PowerPoint — MusicGraph

Ce document détaille le plan complet, diapositive par diapositive, pour concevoir votre support de présentation PowerPoint. Pour chaque diapositive, vous trouverez : les éléments visuels suggérés, le contenu textuel, et les notes de l'orateur.

---

## Diapositive 1 : Titre & Introduction
* **Visuel** : Logo MusicGraph (une icône d'onde radio ou de réseau en dégradé violet/bleu), fond sombre avec des lignes de connexion subtiles en arrière-plan.
* **Titre principal** : MusicGraph — Exploration des collaborations musicales
* **Sous-titre** : Analyse de réseaux d'artistes avec Neo4j et MusicBrainz
* **Contenu** : Vos noms, classe/groupe, et date.
* **Notes de l'orateur** :
  > « Bonjour à tous. Nous vous présentons aujourd'hui MusicGraph, une plateforme full-stack conçue pour collecter, modéliser, explorer et analyser les réseaux d'artistes et leurs collaborations musicales. »

---

## Diapositive 2 : La Problématique & Le choix de la base Graphe
* **Visuel** : Comparaison côte à côte :
  - À gauche : Une base relationnelle SQL classique (tables rigides avec de nombreuses flèches de jointures).
  - À droite : Une base de graphe Neo4j (nœuds et arêtes fluides, sans table de jointure).
* **Points clés** :
  - **Limites du SQL** : Jointures multiples coûteuses en temps CPU lors du parcours de réseaux complexes.
  - **Avantages du Graphe (Neo4j)** : Traçage des chemins (degrés de séparation) en temps constant O(1), flexibilité des relations bidirectionnelles.
* **Notes de l'orateur** :
  > « Pourquoi utiliser une base orientée graphe ? Les données musicales sont par nature connectées. En SQL, chercher des collaborations indirectes nécessite de multiples jointures. Neo4j nous permet de modéliser directement les relations entre artistes, morceaux et albums comme elles existent dans la réalité. »

---

## Diapositive 3 : Modèle de Données (Schéma du Graphe)
* **Visuel** : Le diagramme de classes/graphe (vous pouvez insérer le diagramme Mermaid présent dans `docs/model.md`).
* **Points clés** :
  - **Nœuds** : `Artist`, `Recording` (morceau), `Release` (album), `Genre`, `Area` (pays).
  - **Relations principales** :
    - `PERFORMED` / `FEATURED_ON` (interprètes d'une chanson).
    - `COLLABORATED_WITH` (connexion directe d'artiste à artiste).
    - `APPEARS_ON` (liant le morceau à l'album).
* **Notes de l'orateur** :
  > « Notre schéma de graphe est structuré autour de nœuds d'entités clairs et de relations typées. Notez la distinction essentielle entre PERFORMED pour un artiste principal et FEATURED_ON pour un invité, ce qui nous permet de catégoriser finement les types de collaborations. »

---

## Diapositive 4 : Architecture Applicative
* **Visuel** : Un schéma simple de l'architecture :
  `MusicBrainz API` ──► `Backend API (Express/TS)` ──► `Base Neo4j` ◄── `Frontend (React/Vite)`
* **Points clés** :
  - **Backend** : Node.js, Express, TypeScript. Driver officiel `neo4j-driver`.
  - **Frontend** : React, Vite, et la bibliothèque `vis-network` pour le rendu dynamique 2D du graphe.
  - **Déploiement** : Entièrement conteneurisé avec un fichier `docker-compose.yml` (Neo4j, Backend, Frontend).
* **Notes de l'orateur** :
  > « Pour l'architecture, nous avons choisi une stack moderne entièrement conteneurisée. Le backend en TypeScript gère la communication avec l'API MusicBrainz et orchestre l'écriture sécurisée dans Neo4j. Le frontend React s'occupe de l'interface et du rendu dynamique du graphe en Canvas. »

---

## Diapositive 5 : Qualité des Données & Gestion de l'API
* **Visuel** : Capture d'écran de l'onglet de recherche ou schéma du mécanisme de file d'attente.
* **Points clés** :
  - **Identifiant Unique (MBID)** : Utilisation des identifiants MusicBrainz uniques pour fusionner (`MERGE`) les nœuds et interdire les doublons.
  - **Rate Limiting séquentiel** : File d'attente asynchrone imposant une pause de 1,1 seconde entre chaque appel pour respecter la charte de l'API MusicBrainz.
  - **Sécurité anti-blocage** : Temps d'attente (timeout) configuré sur toutes les requêtes HTTP.
* **Notes de l'orateur** :
  > « Travailler avec une API externe publique comme MusicBrainz demande de la rigueur. Pour éviter d'être bannis de leurs serveurs, nous avons développé une file d'attente séquentielle stricte garantissant qu'aucune requête ne parte à moins d'une seconde d'intervalle de la précédente. De plus, l'unicité de la base est assurée via des contraintes de clés sur les MBID. »

---

## Diapositive 6 : Démo Live & Interface Web (La capture d'écran de secours)
* **Visuel** : Captures d'écran de l'application (Accueil, Fiche artiste, et Explorateur de Graphe) au cas où le réseau échouerait le jour de l'oral.
* **Points clés** :
  - **Recherche & Import** en un clic.
  - **Visualisation interactive** du réseau.
  - **Inspecteur de nœuds** en temps réel.
* **Notes de l'orateur** :
  > « Notre interface web propose une navigation fluide. L'utilisateur peut rechercher un artiste, l'importer en un clic, visualiser son réseau direct (graphe Ego) et naviguer à travers le graphe global pour inspecter les métadonnées de chaque nœud. »
  *(C'est le moment de passer à la démo live sur votre navigateur !)*

---

## Diapositive 7 : Analyses de Données (Requêtes Cypher)
* **Visuel** : Une ou deux requêtes Cypher affichées de façon claire (coloration syntaxique).
* **Points clés** :
  - **Centralité de degré** (calcul des artistes les plus connectés).
  - **Top collaborations** (qui travaille le plus souvent ensemble).
  - **Limites du graphe** : Complétude des données dépendant des imports manuels, limites de profondeur d'import pour la réactivité.
* **Notes de l'orateur** :
  > « Dans l'onglet statistiques de l'application, nous exécutons ces requêtes Cypher. Par exemple, nous calculons la centralité de degré en comptant le nombre d'arêtes COLLABORATED_WITH connectées à chaque nœud d'artiste. Cela permet d'identifier immédiatement les hubs créatifs de l'industrie musicale. »

---

## Diapositive 8 : Conclusion & Perspectives
* **Visuel** : Logo du projet et récapitulatif des acquis.
* **Points clés** :
  - **Objectifs atteints** : Application 100 % dockerisée, détection de collaborations efficace, visualisation fluide.
  - **Évolutions possibles** : Intégration de l'API Spotify pour la popularité ou des recommandations de playlists automatiques basées sur le graphe.
* **Notes de l'orateur** :
  > « En conclusion, ce projet valide nos compétences en modélisation de graphes NoSQL et en intégration d'API externes complexes. Pour aller plus loin, nous pourrions y intégrer de la recommandation musicale basée sur la proximité de chemin dans le graphe. Merci pour votre attention. »
