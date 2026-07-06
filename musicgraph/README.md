# MusicGraph — Exploration des collaborations musicales

MusicGraph est une application web full-stack permettant de rechercher des données musicales depuis l'API **MusicBrainz**, de les stocker dans une base de données de graphe **Neo4j**, et de les explorer interactivement grâce à une interface moderne en mode sombre dotée d'une visualisation de graphe animée.

## Fonctionnalités

- **Recherche d'Artistes** : Interrogez l'API publique de MusicBrainz en temps réel.
- **Import Récursif** : Importez un artiste, ses métadonnées (genres, zones d'activité), ses morceaux (`Recordings`), ses albums (`Releases`), ainsi que ses labels de production.
- **Détection des Collaborations** : Analyse automatique des crédits d'enregistrement et détection automatique des collaborations et des featurings (ex: *feat.*, *featuring*, *ft.*, etc.) avec création de relations `COLLABORATED_WITH` et `FEATURED_ON`.
- **Explorateur Graphique** : Visualisez l'intégralité du réseau de relations ou explorez le réseau ego d'un artiste en cliquant sur ses connexions.
- **Statistiques & Centralité** : Tableau de bord analytique présentant les artistes les plus connectés (centralité de degré), les genres dominants, et les collaborations les plus récurrentes.

---

## Architecture Technique

- **Base de Données** : Neo4j (NoSQL orienté graphe)
- **Backend API** : Node.js, Express, TypeScript, `neo4j-driver`, `axios`
- **Frontend** : React, Vite, TypeScript, `vis-network` (moteur de rendu canvas pour le graphe), `lucide-react` (iconographie)
- **Déploiement** : Docker & Docker Compose

---

## Démarrage Rapide avec Docker

Pour lancer toute l'application (Neo4j, API Backend, et Frontend React) en une seule commande, assurez-vous d'avoir Docker installé, puis exécutez la commande suivante à la racine du projet :

```bash
docker compose up --build
```

### Services disponibles après lancement :

- **Frontend React (Interface Web)** : [http://localhost:5173](http://localhost:5173)
- **API Backend** : [http://localhost:3000/api](http://localhost:3000/api)
- **Console Neo4j Browser** : [http://localhost:7474](http://localhost:7474) (Identifiants : `neo4j` / `musicgraphpassword`)

---

## Alimenter / Seeder la Base de Données

Vous pouvez importer des artistes directement depuis l'onglet **Rechercher** du site Web.

Alternativement, pour alimenter instantanément votre base de données Neo4j avec un jeu de données réel et connecté (comprenant *Daft Punk, Stromae, Angèle, Damso, Pharrell Williams, The Weeknd, Kanye West*), vous pouvez copier et exécuter le contenu du script [seed.cypher](data/seed.cypher) directement dans la console web Neo4j Browser (`http://localhost:7474`).

---

## Modèle de Graphe (Neo4j)

### Nœuds principaux
- `Artist` : MBID, nom, type, pays, dates d'activité, description.
- `Recording` : MBID, titre, durée, date de sortie.
- `Release` : MBID, titre, type (album/single), date.
- `Label` : MBID, nom de la maison de disque.
- `Genre` : Style musical.
- `Area` : Région ou pays associé.

### Relations
- `(:Artist)-[:PERFORMED]->(:Recording)`
- `(:Artist)-[:FEATURED_ON]->(:Recording)`
- `(:Artist)-[:COLLABORATED_WITH]->(:Artist)`
- `(:Recording)-[:APPEARS_ON]->(:Release)`
- `(:Release)-[:RELEASED_BY]->(:Label)`
- `(:Artist)-[:ASSOCIATED_WITH_GENRE]->(:Genre)`
- `(:Artist)-[:FROM_AREA]->(:Area)`

---

## Questions Analytiques & Requêtes Cypher clés

### 1. Quels artistes sont les plus connectés (Centralité de Degré) ?
```cypher
MATCH (a:Artist)-[:COLLABORATED_WITH]-(other:Artist)
RETURN a.name, count(distinct other) as degree
ORDER BY degree DESC LIMIT 10;
```

### 2. Quelles collaborations sont les plus actives ?
```cypher
MATCH (a:Artist)-[:PERFORMED|FEATURED_ON]->(r:Recording)<-[:PERFORMED|FEATURED_ON]-(b:Artist)
WHERE a.mbid < b.mbid
RETURN a.name, b.name, count(r) as collaborationsCount
ORDER BY collaborationsCount DESC LIMIT 10;
```

### 3. Quels genres musicaux sont les plus représentés dans la base ?
```cypher
MATCH (g:Genre)<-[:ASSOCIATED_WITH_GENRE]-(a:Artist)
RETURN g.name, count(a) as artistCount
ORDER BY artistCount DESC;
```

### 4. Quels morceaux (Recordings) sont les plus collaboratifs (le plus d'artistes impliqués) ?
```cypher
MATCH (a:Artist)-[:PERFORMED|FEATURED_ON]->(r:Recording)
WITH r, count(a) as artistCount, collect(a.name) as artists
RETURN r.title, artistCount, artists
ORDER BY artistCount DESC LIMIT 10;
```

### 5. Quels chemins relient deux artistes (degrés de séparation) ?
```cypher
MATCH path = shortestPath((a:Artist {name: "Stromae"})-[*..6]-(b:Artist {name: "Daft Punk"}))
RETURN path;
```
