# Guide de Présentation Oral & Lancement — MusicGraph

Ce document est conçu pour vous aider à préparer votre présentation orale et à comprendre le fonctionnement du projet, en particulier l'usage de la base de données orientée Graphe **Neo4j** (NoSQL).

---

## 1. Concepts Clés : Qu'est-ce que le NoSQL et les Graphes ? (Pour l'oral)

### SQL vs NoSQL Graphe

- **SQL (Relationnel)** : Organise les données dans des tables rigides (lignes/colonnes). Pour lier des artistes à des morceaux, ou des morceaux à des albums, il faut créer des tables de jointure. Si vous cherchez des collaborations au 2ème ou 3ème degré (ex: _« Avec qui ont collaboré les collaborateurs de Stromae ? »_), le SQL doit effectuer de multiples jointures coûteuses qui ralentissent drastiquement les requêtes.
- **NoSQL Graphe (Neo4j)** : Stocke les données sous forme de **Nœuds** (les entités, ex: un Artiste, une Chanson) et de **Relations** (les liens directs, ex: `COLLABORATED_WITH`, `PERFORMED`). Il n'y a **aucune table de jointure**. Naviguer d'un artiste à ses collaborations revient à suivre des pointeurs en mémoire, ce qui est extrêmement rapide (complexité en $O(1)$ par saut).

### Le Modèle de Données MusicGraph

- **Nœuds principaux** :
  - `Artist` : L'artiste ou le groupe.
  - `Recording` : Le morceau de musique.
  - `Release` : L'album ou single physique/numérique.
  - `Genre` : Le style musical (ex: rap, pop, electronic).
  - `Area` : Le pays ou région d'origine.
- **Relations clés** :
  - `(:Artist)-[:PERFORMED]->(:Recording)` (interprète principal)
  - `(:Artist)-[:FEATURED_ON]->(:Recording)` (invité/featuring)
  - `(:Artist)-[:COLLABORATED_WITH]->(:Artist)` (collaboration directe)
  - `(:Recording)-[:APPEARS_ON]->(:Release)` (présence sur l'album)

---

## 2. Guide de Lancement Rapide (Docker)

Assurez-vous que Docker Desktop est démarré.

### Démarrage

À la racine du projet, exécutez la commande :

```bash
docker compose up --build
```

Cette commande démarre automatiquement 3 conteneurs :

1. **neo4j** (Base de données sur le port `7474` pour l'interface web, `7687` pour le protocole Bolt).
2. **backend** (API Express en TypeScript sur le port `3000`).
3. **frontend** (Application React en TypeScript sur le port `5173`).

---

## 3. Scénario de Démonstration (Pas à Pas pour l'Oral)

### Étape 1 : Présentation de l'interface vide

- Ouvrez [http://localhost:5173](http://localhost:5173).
- Montrez le tableau de bord avec les compteurs à `0`. Expliquez que la base démarre vide pour illustrer l'import dynamique.

### Étape 2 : Recherche et Import en temps réel

- Allez sur l'onglet **Rechercher**.
- Recherchez **« Stromae »** ou **« Angèle »**.
- Cliquez sur **Importer**.
- **Ce qui se passe en arrière-plan (à expliquer) :**
  1. Le backend interroge l'API publique de **MusicBrainz**.
  2. Il récupère les détails de l'artiste et crée le nœud `Artist` ainsi que son pays (`Area`) et ses styles (`Genre`).
  3. Il télécharge les 40 premiers morceaux et crée les nœuds `Recording`.
  4. Il analyse les crédits de chaque morceau pour détecter les autres artistes (ex: Damso en featuring) et crée la relation `COLLABORATED_WITH` entre eux.

### Étape 3 : Exploration Visuelle du Graphe

- Allez sur **Explorateur Graphe**.
- Montrez le réseau de nœuds interconnectés.
- Cliquez sur un nœud d'artiste pour ouvrir l'inspecteur et voir ses propriétés (MBID, pays, type, etc.).

### Étape 4 : Analyse des Données (Statistiques)

- Allez sur l'onglet **Analyses & Stats**.
- Montrez le classement des genres musicaux et des collaborations calculés à la volée par Neo4j.

---

## 4. Les Requêtes Cypher à connaître (et à expliquer)

Cypher est le langage de requête de Neo4j (l'équivalent du SQL pour les graphes). Vous serez probablement interrogé dessus.

### Requête 1 : Trouver les artistes les plus connectés

```cypher
MATCH (a:Artist)-[:COLLABORATED_WITH]-(other:Artist)
RETURN a.name, count(distinct other) as degree
ORDER BY degree DESC LIMIT 10;
```

- **Explication** : `MATCH` cherche un motif où un artiste `a` est lié par la relation `COLLABORATED_WITH` à un autre artiste `other`. On regroupe par nom d'artiste et on compte le nombre d'artistes différents (`distinct other`). On trie par ordre décroissant pour afficher le top 10.

### Requête 2 : Détecter les chemins entre deux artistes (Degrés de séparation)

_Exemple : Comment relier Stromae à Daft Punk dans notre graphe ?_

```cypher
MATCH path = shortestPath((a:Artist {name: "Stromae"})-[*..5]-(b:Artist {name: "Daft Punk"}))
RETURN path;
```

- **Explication** : `shortestPath` calcule le chemin le plus court dans le graphe entre Stromae et Daft Punk en traversant n'importe quelles relations (`-[*..5]-` indique jusqu'à 5 sauts maximum).
