import React, { useEffect, useState } from 'react';
import { Award, Zap, Heart, Music, AlertCircle } from 'lucide-react';

interface TopArtist {
  mbid: string;
  name: string;
  collaboratorsCount: number;
}

interface TopCollaboration {
  artist1: { mbid: string; name: string };
  artist2: { mbid: string; name: string };
  collaborationsCount: number;
}

interface TopGenre {
  genre: string;
  count: number;
}

interface TopRecording {
  mbid: string;
  title: string;
  artistCount: number;
  artists: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Stats: React.FC = () => {
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topCollabs, setTopCollabs] = useState<TopCollaboration[]>([]);
  const [topGenres, setTopGenres] = useState<TopGenre[]>([]);
  const [topRecordings, setTopRecordings] = useState<TopRecording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [artistsRes, collabsRes, genresRes, recordingsRes] = await Promise.all([
          fetch(`${API_URL}/stats/top-artists`).then(r => r.json()),
          fetch(`${API_URL}/stats/top-collaborations`).then(r => r.json()),
          fetch(`${API_URL}/stats/top-genres`).then(r => r.json()),
          fetch(`${API_URL}/stats/top-recordings`).then(r => r.json())
        ]);
        setTopArtists(artistsRes);
        setTopCollabs(collabsRes);
        setTopGenres(genresRes);
        setTopRecordings(recordingsRes);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyses & Statistiques</h1>
          <p className="page-subtitle">Exploration analytique des connexions musicales calculées par Neo4j</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

            {/* Top Artists - Centrality */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Award color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Artistes les plus connectés</h3>
              </div>
              {topArtists.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topArtists.map((a, index) => (
                    <div key={a.mbid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span><strong>#{index + 1}</strong> {a.name}</span>
                      <span className="badge badge-purple">{a.collaboratorsCount} collab.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Collaborations */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Zap color="var(--accent-secondary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Collaborations les plus actives</h3>
              </div>
              {topCollabs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topCollabs.map((c, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        <strong>{c.artist1.name}</strong> et <strong>{c.artist2.name}</strong>
                      </div>
                      <span className="badge badge-blue">{c.collaborationsCount} morceaux</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Genres */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Heart color="#eab308" />
                <h3 style={{ fontSize: '1.25rem' }}>Genres musicaux dominants</h3>
              </div>
              {topGenres.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topGenres.map((g) => (
                    <div key={g.genre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{g.genre}</span>
                      <span className="badge badge-success">{g.count} artistes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Tracks / Recordings */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Music color="#06b6d4" />
                <h3 style={{ fontSize: '1.25rem' }}>Morceaux les plus collaboratifs</h3>
              </div>
              {topRecordings.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Aucune donnée.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {topRecordings.map((r, index) => (
                    <div key={r.mbid || index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{r.title}</span>
                        <span className="badge badge-blue">{r.artistCount} artistes</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Interprètes : {r.artists.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Graph Analysis & Limits */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.5rem' }}>Analyse du Graphe et Limites Techniques</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Centralité et Relations</h3>
                <p>
                  En utilisant Neo4j, nous analysons la centralité de degré des artistes (nombre de connexions directes). 
                  Cela permet d'identifier immédiatement les artistes agissant comme des plaques tournantes ("hubs") de collaborations, 
                  particulièrement dans les genres comme le Rap ou la Musique Électronique où les collaborations sont omniprésentes.
                </p>
                <p style={{ marginTop: '1rem' }}>
                  Les relations bidirectionnelles de collaboration <code>COLLABORATED_WITH</code> sont calculées dynamiquement 
                  à partir de la présence de plusieurs artistes crédités sur un même enregistrement (<code>Recording</code>).
                </p>
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Limites du Jeu de Données</h3>
                <p>
                  <strong>1. Limitation de l'API MusicBrainz</strong> : L'API externe impose un taux de requêtes strict (1 req/seconde). 
                  Pour importer les relations en évitant les blocages, le backend intègre un mécanisme d'attente automatique.
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>2. Profondeur de l'import</strong> : Afin de garantir des temps de réponse rapides, l'import d'un artiste 
                  est volontairement limité à ses 40 premiers morceaux et aux releases associées.
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>3. Complétude des relations</strong> : Les artistes collaborateurs découverts lors de l'import d'un morceau 
                  sont créés sous forme de nœuds simplifiés. Pour obtenir l'ensemble de leurs propres collaborations, l'utilisateur 
                  doit à son tour lancer l'import de cet artiste secondaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};