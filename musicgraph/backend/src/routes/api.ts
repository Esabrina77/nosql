import { Router, Request, Response } from 'express';
import * as musicbrainz from '../services/musicbrainz';
import { runQuery } from '../services/neo4j';

const router = Router();

// ==========================================
// 1. Artist Search & Import Endpoints
// ==========================================

// GET /api/search/artists - Search MusicBrainz artists
router.get('/search/artists', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  try {
    const results = await musicbrainz.searchArtists(query);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/import/artists - Import artist into Neo4j
router.post('/import/artists', async (req: Request, res: Response) => {
  const { mbid } = req.body;
  if (!mbid) {
    return res.status(400).json({ error: 'Body parameter "mbid" is required' });
  }

  try {
    console.log(`Starting import for artist MBID: ${mbid}`);
    
    // 1. Fetch details from MusicBrainz
    const details = await musicbrainz.getArtistDetails(mbid);
    
    const artistData = {
      mbid: details.id,
      name: details.name,
      type: details.type || 'Person',
      country: details.country || details.area?.code || 'Unknown',
      gender: details.gender || null,
      beginDate: details['life-span']?.begin || null,
      endDate: details['life-span']?.end || null,
      disambiguation: details.disambiguation || null
    };

    // 2. Merge Artist node in Neo4j
    await runQuery(`
      MERGE (a:Artist {mbid: $mbid})
      SET a.name = $name,
          a.type = $type,
          a.country = $country,
          a.gender = $gender,
          a.beginDate = $beginDate,
          a.endDate = $endDate,
          a.disambiguation = $disambiguation
      RETURN a
    `, artistData);

    // 3. Create Area node if present
    if (details.area) {
      await runQuery(`
        MATCH (a:Artist {mbid: $artistMbid})
        MERGE (ar:Area {mbid: $areaMbid})
        SET ar.name = $areaName,
            ar.type = $areaType
        MERGE (a)-[:FROM_AREA]->(ar)
      `, {
        artistMbid: artistData.mbid,
        areaMbid: details.area.id,
        areaName: details.area.name,
        areaType: details.area.type || 'Country'
      });
    }

    // 4. Create Genre nodes if present
    if (details.genres && details.genres.length > 0) {
      for (const g of details.genres) {
        await runQuery(`
          MATCH (a:Artist {mbid: $artistMbid})
          MERGE (genre:Genre {name: $genreName})
          MERGE (a)-[:ASSOCIATED_WITH_GENRE]->(genre)
        `, {
          artistMbid: artistData.mbid,
          genreName: g.name.toLowerCase()
        });
      }
    }

    // 5. Fetch recordings and releases of this artist (limit 40 for responsiveness)
    const recordings = await musicbrainz.getArtistRecordings(mbid);
    const recordingsToProcess = recordings.slice(0, 40);

    for (const rec of recordingsToProcess) {
      const recMbid = rec.id;
      const recTitle = rec.title;
      const recLength = rec.length || null;
      const recFirstReleaseDate = rec['first-release-date'] || null;

      // Merge Recording
      await runQuery(`
        MERGE (r:Recording {mbid: $mbid})
        SET r.title = $title,
            r.length = $length,
            r.firstReleaseDate = $firstReleaseDate,
            r.source = 'MusicBrainz'
        RETURN r
      `, {
        mbid: recMbid,
        title: recTitle,
        length: recLength,
        firstReleaseDate: recFirstReleaseDate
      });

      // Handle Artist Credits (Performers & Collaborations)
      if (rec['artist-credit']) {
        const credits = rec['artist-credit'];
        for (const credit of credits) {
          if (credit.artist) {
            const credMbid = credit.artist.id;
            const credName = credit.artist.name;
            const credType = credit.artist.type || 'Person';
            const credCountry = credit.artist.country || 'Unknown';
            const joinPhrase = credit.joinphrase || '';

            // Merge Collaborator Artist Node (might be a stub that gets filled later if imported)
            await runQuery(`
              MERGE (ca:Artist {mbid: $mbid})
              ON CREATE SET ca.name = $name, ca.type = $type, ca.country = $country
            `, {
              mbid: credMbid,
              name: credName,
              type: credType,
              country: credCountry
            });

            // Detect relation type: PERFORMED or FEATURED_ON
            const isFeature = /feat\.|featuring|ft\.|avec| x | & /.test(joinPhrase.toLowerCase()) || 
                              /feat\.|featuring|ft\.|avec| x | & /.test(recTitle.toLowerCase());
            
            const relType = isFeature ? 'FEATURED_ON' : 'PERFORMED';

            await runQuery(`
              MATCH (ca:Artist {mbid: $artistMbid})
              MATCH (r:Recording {mbid: $recordingMbid})
              MERGE (ca)-[rel:${relType}]->(r)
            `, {
              artistMbid: credMbid,
              recordingMbid: recMbid
            });

            // If it's a collaborator (different artist), link them
            if (credMbid !== artistData.mbid) {
              await runQuery(`
                MATCH (a1:Artist {mbid: $mbid1})
                MATCH (a2:Artist {mbid: $mbid2})
                MERGE (a1)-[:COLLABORATED_WITH]-(a2)
              `, {
                mbid1: artistData.mbid,
                mbid2: credMbid
              });
            }
          }
        }
      }

      // Handle Releases associated with this recording
      if (rec.releases && rec.releases.length > 0) {
        const rel = rec.releases[0]; // Take first release
        const relMbid = rel.id;
        const relTitle = rel.title;
        const relDate = rel.date || null;
        const relCountry = rel.country || null;
        const relStatus = rel.status || 'Official';
        const relType = rel['release-group']?.['primary-type'] || 'Album';

        // Merge Release
        await runQuery(`
          MERGE (rel:Release {mbid: $mbid})
          SET rel.title = $title,
              rel.date = $date,
              rel.country = $country,
              rel.status = $status,
              rel.releaseType = $releaseType
          RETURN rel
        `, {
          mbid: relMbid,
          title: relTitle,
          date: relDate,
          country: relCountry,
          status: relStatus,
          releaseType: relType
        });

        // Link Recording to Release
        await runQuery(`
          MATCH (rec:Recording {mbid: $recMbid})
          MATCH (rel:Release {mbid: $relMbid})
          MERGE (rec)-[:APPEARS_ON]->(rel)
        `, {
          recMbid,
          relMbid
        });

        // Link Release to Area (if country code present)
        if (relCountry) {
          await runQuery(`
            MATCH (rel:Release {mbid: $relMbid})
            MERGE (ar:Area {name: $countryName})
            MERGE (rel)-[:RELEASED_IN]->(ar)
          `, {
            relMbid,
            countryName: relCountry
          });
        }

        // Link Label relation if present in label-info
        if (rel['label-info'] && rel['label-info'].length > 0) {
          for (const info of rel['label-info']) {
            if (info.label) {
              const labelMbid = info.label.id;
              const labelName = info.label.name;
              const labelCountry = info.label.country || 'Unknown';

              await runQuery(`
                MATCH (rel:Release {mbid: $relMbid})
                MERGE (l:Label {mbid: $labelMbid})
                SET l.name = $labelName,
                    l.country = $labelCountry
                MERGE (rel)-[:RELEASED_BY]->(l)
              `, {
                relMbid,
                labelMbid,
                labelName,
                labelCountry
              });
            }
          }
        }
      }
    }

    res.json({ success: true, message: `Artist "${artistData.name}" and relations imported successfully.` });
  } catch (error: any) {
    console.error('Error importing artist:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. Artist Explorer Endpoints
// ==========================================

// GET /api/artists - List all imported artists
router.get('/artists', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (a:Artist)
      OPTIONAL MATCH (a)-[:FROM_AREA]->(area:Area)
      RETURN a, area.name as areaName
      ORDER BY a.name ASC
    `);
    const artists = result.records.map(rec => {
      const node = rec.get('a').properties;
      return {
        ...node,
        area: rec.get('areaName')
      };
    });
    res.json(artists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artists/:id - Specific artist details
router.get('/artists/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist {mbid: $id})
      OPTIONAL MATCH (a)-[:FROM_AREA]->(area:Area)
      OPTIONAL MATCH (a)-[:ASSOCIATED_WITH_GENRE]->(g:Genre)
      RETURN a, area, collect(distinct g.name) as genres
    `, { id });

    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const rec = result.records[0];
    const artist = rec.get('a').properties;
    const area = rec.get('area')?.properties || null;
    const genres = rec.get('genres');

    res.json({
      ...artist,
      area,
      genres
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artists/:id/recordings - Get recordings for artist
router.get('/artists/:id/recordings', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist {mbid: $id})-[rel:PERFORMED|FEATURED_ON]->(r:Recording)
      RETURN r, type(rel) as relType
      ORDER BY r.firstReleaseDate DESC, r.title ASC
    `, { id });

    const recordings = result.records.map(rec => ({
      ...rec.get('r').properties,
      relation: rec.get('relType')
    }));
    res.json(recordings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artists/:id/releases - Get releases for artist
router.get('/artists/:id/releases', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist {mbid: $id})-[:PERFORMED|FEATURED_ON]->(rec:Recording)-[:APPEARS_ON]->(rel:Release)
      RETURN distinct rel
      ORDER BY rel.date DESC
    `, { id });

    const releases = result.records.map(rec => rec.get('rel').properties);
    res.json(releases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/artists/:id/collaborations - Collaborations of artist
router.get('/artists/:id/collaborations', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist {mbid: $id})-[:COLLABORATED_WITH]-(other:Artist)
      OPTIONAL MATCH (a)-[:PERFORMED|FEATURED_ON]->(r:Recording)<-[:PERFORMED|FEATURED_ON]-(other)
      RETURN other, collect(distinct r.title) as tracks
    `, { id });

    const collaborations = result.records.map(rec => ({
      artist: rec.get('other').properties,
      tracks: rec.get('tracks')
    }));
    res.json(collaborations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. Recording Endpoints
// ==========================================

// GET /api/recordings - List recordings
router.get('/recordings', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (r:Recording)
      RETURN r LIMIT 100
    `);
    const recordings = result.records.map(rec => rec.get('r').properties);
    res.json(recordings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recordings/:id - Recording details
router.get('/recordings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (r:Recording {mbid: $id})
      RETURN r
    `, { id });
    if (result.records.length === 0) return res.status(404).json({ error: 'Recording not found' });
    res.json(result.records[0].get('r').properties);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recordings/:id/artists - Artists on recording
router.get('/recordings/:id/artists', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist)-[rel:PERFORMED|FEATURED_ON]->(r:Recording {mbid: $id})
      RETURN a, type(rel) as relType
    `, { id });
    const artists = result.records.map(rec => ({
      ...rec.get('a').properties,
      relation: rec.get('relType')
    }));
    res.json(artists);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recordings/:id/releases - Releases containing recording
router.get('/recordings/:id/releases', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (r:Recording {mbid: $id})-[:APPEARS_ON]->(rel:Release)
      RETURN rel
    `, { id });
    const releases = result.records.map(rec => rec.get('rel').properties);
    res.json(releases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. Release Endpoints
// ==========================================

// GET /api/releases
router.get('/releases', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`MATCH (r:Release) RETURN r LIMIT 100`);
    res.json(result.records.map(rec => rec.get('r').properties));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/releases/:id
router.get('/releases/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`MATCH (r:Release {mbid: $id}) RETURN r`, { id });
    if (result.records.length === 0) return res.status(404).json({ error: 'Release not found' });
    res.json(result.records[0].get('r').properties);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/releases/:id/recordings
router.get('/releases/:id/recordings', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (rec:Recording)-[:APPEARS_ON]->(rel:Release {mbid: $id})
      RETURN rec
    `, { id });
    res.json(result.records.map(rec => rec.get('rec').properties));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/releases/:id/artists
router.get('/releases/:id/artists', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await runQuery(`
      MATCH (a:Artist)-[:PERFORMED|FEATURED_ON]->(:Recording)-[:APPEARS_ON]->(rel:Release {mbid: $id})
      RETURN distinct a
    `, { id });
    res.json(result.records.map(rec => rec.get('a').properties));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. Graph Explorer Endpoints
// ==========================================

// GET /api/graph - Full network graph (nodes and links)
router.get('/graph', async (req: Request, res: Response) => {
  try {
    const nodesResult = await runQuery(`
      MATCH (n)
      WHERE n:Artist OR n:Recording OR n:Release OR n:Genre OR n:Area
      RETURN id(n) as id, labels(n)[0] as type, properties(n) as props
    `);

    const edgesResult = await runQuery(`
      MATCH (n)-[r]->(m)
      WHERE (n:Artist OR n:Recording OR n:Release OR n:Genre OR n:Area)
        AND (m:Artist OR m:Recording OR m:Release OR m:Genre OR m:Area)
      RETURN id(n) as source, id(m) as target, type(r) as type
    `);

    const nodes = nodesResult.records.map(rec => ({
      id: rec.get('id').toString(),
      type: rec.get('type'),
      label: rec.get('props').name || rec.get('props').title || rec.get('props').mbid,
      properties: rec.get('props')
    }));

    const edges = edgesResult.records.map(rec => ({
      source: rec.get('source').toString(),
      target: rec.get('target').toString(),
      type: rec.get('type')
    }));

    res.json({ nodes, edges });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/graph/artists/:id - Ego Network
router.get('/graph/artists/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const nodesResult = await runQuery(`
      MATCH (a:Artist {mbid: $id})
      MATCH path = (a)-[r:COLLABORATED_WITH]-(other:Artist)
      WITH a, other, nodes(path) as ns
      UNWIND ns as n
      RETURN distinct id(n) as id, labels(n)[0] as type, properties(n) as props
    `, { id });

    const edgesResult = await runQuery(`
      MATCH (a:Artist {mbid: $id})
      MATCH (a)-[r:COLLABORATED_WITH]-(other:Artist)
      RETURN id(a) as source, id(other) as target, type(r) as type
    `, { id });

    const nodes = nodesResult.records.map(rec => ({
      id: rec.get('id').toString(),
      type: rec.get('type'),
      label: rec.get('props').name || rec.get('props').title || rec.get('props').mbid,
      properties: rec.get('props')
    }));

    const edges = edgesResult.records.map(rec => ({
      source: rec.get('source').toString(),
      target: rec.get('target').toString(),
      type: rec.get('type')
    }));

    res.json({ nodes, edges });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/graph/collaborations - List of collaborations
router.get('/graph/collaborations', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (a1:Artist)-[:COLLABORATED_WITH]-(a2:Artist)
      WHERE a1.mbid < a2.mbid
      RETURN a1.mbid as artist1Id, a1.name as artist1Name, a2.mbid as artist2Id, a2.name as artist2Name
    `);
    const collaborations = result.records.map(rec => ({
      artist1: { mbid: rec.get('artist1Id'), name: rec.get('artist1Name') },
      artist2: { mbid: rec.get('artist2Id'), name: rec.get('artist2Name') }
    }));
    res.json(collaborations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. Statistics Endpoints
// ==========================================

// GET /api/stats/overview - Overall Stats
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (a:Artist) WITH count(a) as totalArtists
      MATCH (rec:Recording) WITH totalArtists, count(rec) as totalRecordings
      MATCH (rel:Release) WITH totalArtists, totalRecordings, count(rel) as totalReleases
      MATCH (g:Genre) WITH totalArtists, totalRecordings, totalReleases, count(g) as totalGenres
      MATCH (ar:Area) WITH totalArtists, totalRecordings, totalReleases, totalGenres, count(ar) as totalAreas
      MATCH ()-[c:COLLABORATED_WITH]->() WITH totalArtists, totalRecordings, totalReleases, totalGenres, totalAreas, count(c)/2 as totalCollaborations
      RETURN totalArtists, totalRecordings, totalReleases, totalGenres, totalAreas, totalCollaborations
    `);
    const rec = result.records[0];
    res.json({
      totalArtists: rec.get('totalArtists').toNumber(),
      totalRecordings: rec.get('totalRecordings').toNumber(),
      totalReleases: rec.get('totalReleases').toNumber(),
      totalGenres: rec.get('totalGenres').toNumber(),
      totalAreas: rec.get('totalAreas').toNumber(),
      totalCollaborations: rec.get('totalCollaborations').toNumber()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/top-collaborations - Most active collaborations
router.get('/stats/top-collaborations', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (a:Artist)-[:PERFORMED|FEATURED_ON]->(r:Recording)<-[:PERFORMED|FEATURED_ON]-(b:Artist)
      WHERE a.mbid < b.mbid
      RETURN a.mbid as artist1Mbid, a.name as artist1Name, b.mbid as artist2Mbid, b.name as artist2Name, count(r) as count
      ORDER BY count DESC LIMIT 10
    `);
    res.json(result.records.map(rec => ({
      artist1: { mbid: rec.get('artist1Mbid'), name: rec.get('artist1Name') },
      artist2: { mbid: rec.get('artist2Mbid'), name: rec.get('artist2Name') },
      collaborationsCount: rec.get('count').toNumber()
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/top-artists - Centrality
router.get('/stats/top-artists', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (a:Artist)-[:COLLABORATED_WITH]-(other:Artist)
      RETURN a.mbid as mbid, a.name as name, count(distinct other) as degree
      ORDER BY degree DESC LIMIT 10
    `);
    res.json(result.records.map(rec => ({
      mbid: rec.get('mbid'),
      name: rec.get('name'),
      collaboratorsCount: rec.get('degree').toNumber()
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/top-genres
router.get('/stats/top-genres', async (req: Request, res: Response) => {
  try {
    const result = await runQuery(`
      MATCH (g:Genre)<-[:ASSOCIATED_WITH_GENRE]-(a:Artist)
      RETURN g.name as genre, count(a) as artistCount
      ORDER BY artistCount DESC LIMIT 10
    `);
    res.json(result.records.map(rec => ({
      genre: rec.get('genre'),
      count: rec.get('artistCount').toNumber()
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
