import axios from 'axios';

const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'MusicGraphApp/1.0.0 ( contact@musicgraph.com )';

// Sequential Request Queue: guarantees strictly serial execution with delay
let requestQueue = Promise.resolve();

async function fetchFromMB(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    requestQueue = requestQueue
      .then(async () => {
        // Enforce 1100ms pause before each call
        await new Promise((r) => setTimeout(r, 1100));
        
        const url = `${BASE_URL}/${endpoint}`;
        console.log(`[MusicBrainz] Fetching: ${url} with params:`, params);
        
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'application/json'
            },
            params: {
              ...params,
              fmt: 'json'
            },
            timeout: 10000 // 10 seconds timeout
          });
          resolve(response.data);
        } catch (error: any) {
          console.error(`[MusicBrainz Error] Request to ${url} failed:`, error.message);
          if (error.response) {
            console.error(`[MusicBrainz Error Status]`, error.response.status);
          }
          reject(error);
        }
      })
      .catch((error) => {
        // Resolve queue chaining to ensure subsequent requests can continue even if one fails
        reject(error);
      });
  });
}

export interface MBSearchResult {
  mbid: string;
  name: string;
  type: string;
  country: string;
  beginDate: string;
  score: number;
}

export async function searchArtists(query: string): Promise<MBSearchResult[]> {
  try {
    const data = await fetchFromMB('artist', { query, limit: 10 });
    if (!data.artists) return [];
    
    return data.artists.map((art: any) => ({
      mbid: art.id,
      name: art.name,
      type: art.type || 'Person',
      country: art.country || art.area?.code || 'Unknown',
      beginDate: art['life-span']?.begin || 'Unknown',
      score: art.score || 0
    }));
  } catch (error) {
    console.error('Error searching artists in MusicBrainz:', error);
    return [];
  }
}

export async function getArtistDetails(mbid: string) {
  try {
    // Fetch artist details including genres, tags, area relationships
    const data = await fetchFromMB(`artist/${mbid}`, {
      inc: 'genres+tags+area-rels+label-rels'
    });
    return data;
  } catch (error) {
    console.error(`Error fetching artist details for ${mbid}:`, error);
    throw error;
  }
}

export async function getArtistRecordings(mbid: string) {
  try {
    // Fetch up to 15 releases with their nested recordings, artist credits, and labels
    const data = await fetchFromMB('release', {
      artist: mbid,
      limit: 15,
      inc: 'recordings+artist-credits+labels'
    });
    
    const releases = data.releases || [];
    const recordingsMap = new Map<string, any>();

    for (const rel of releases) {
      const media = rel.media || [];
      for (const med of media) {
        const tracks = med.tracks || [];
        for (const track of tracks) {
          if (track.recording) {
            const rec = track.recording;
            const recId = rec.id;

            const relInfo = {
              id: rel.id,
              title: rel.title,
              date: rel.date,
              country: rel.country,
              status: rel.status,
              'release-group': rel['release-group'],
              'label-info': rel['label-info']
            };

            if (!recordingsMap.has(recId)) {
              recordingsMap.set(recId, {
                id: recId,
                title: rec.title,
                length: rec.length,
                'first-release-date': rec['first-release-date'] || rel.date || null,
                'artist-credit': track['artist-credit'] || rec['artist-credit'] || null,
                releases: [relInfo]
              });
            } else {
              const existing = recordingsMap.get(recId);
              existing.releases.push(relInfo);
            }
          }
        }
      }
    }

    return Array.from(recordingsMap.values());
  } catch (error) {
    console.error(`Error fetching recordings for artist ${mbid}:`, error);
    return [];
  }
}

export async function getReleaseDetails(releaseMbid: string) {
  try {
    const data = await fetchFromMB(`release/${releaseMbid}`, {
      inc: 'labels+recordings+artist-credits'
    });
    return data;
  } catch (error) {
    console.error(`Error fetching release details for ${releaseMbid}:`, error);
    return null;
  }
}
