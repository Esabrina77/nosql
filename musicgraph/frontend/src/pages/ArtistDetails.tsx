import React, { useEffect, useState } from 'react';
import { ArrowLeft, Music, Disc, Users, Share2, MapPin } from 'lucide-react';
import { NetworkGraph } from '../components/NetworkGraph';

interface Area {
  mbid?: string;
  name: string;
  type?: string;
}

interface ArtistDetailsData {
  mbid: string;
  name: string;
  type: string;
  country: string;
  gender?: string;
  beginDate?: string;
  endDate?: string;
  disambiguation?: string;
  area?: Area;
  genres?: string[];
}

interface Recording {
  mbid: string;
  title: string;
  length?: number;
  firstReleaseDate?: string;
  relation: 'PERFORMED' | 'FEATURED_ON';
}

interface Release {
  mbid: string;
  title: string;
  date?: string;
  country?: string;
  status?: string;
  releaseType?: string;
}

interface Collaboration {
  artist: {
    mbid: string;
    name: string;
    type: string;
  };
  tracks: string[];
}

interface GraphData {
  nodes: Array<{ id: string; type: string; label: string }>;
  edges: Array<{ source: string; target: string; type: string }>;
}

interface ArtistDetailsProps {
  artistId: string;
  onBack: () => void;
  onSelectArtist: (mbid: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ArtistDetails: React.FC<ArtistDetailsProps> = ({ artistId, onBack, onSelectArtist }) => {
  const [artist, setArtist] = useState<ArtistDetailsData | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recordings' | 'releases' | 'collaborations' | 'graph'>('recordings');

  useEffect(() => {
    setLoading(true);
    
    const fetchAll = async () => {
      try {
        const [artistRes, recsRes, relsRes, collabsRes, graphRes] = await Promise.all([
          fetch(`${API_URL}/artists/${artistId}`).then(r => r.json()),
          fetch(`${API_URL}/artists/${artistId}/recordings`).then(r => r.json()),
          fetch(`${API_URL}/artists/${artistId}/releases`).then(r => r.json()),
          fetch(`${API_URL}/artists/${artistId}/collaborations`).then(r => r.json()),
          fetch(`${API_URL}/graph/artists/${artistId}`).then(r => r.json())
        ]);

        setArtist(artistRes);
        setRecordings(recsRes);
        setReleases(relsRes);
        setCollaborations(collabsRes);
        setGraphData(graphRes);
      } catch (err) {
        console.error('Error fetching artist details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [artistId]);

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Artiste introuvable</h2>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{artist.name}</h1>
              {artist.disambiguation && (
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  "{artist.disambiguation}"
                </p>
              )}
            </div>
            <span className="badge badge-purple" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>{artist.type}</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {artist.area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--accent-primary)" />
                <span>{artist.area.name} ({artist.area.type})</span>
              </div>
            )}
            <div>
              <strong>Activité :</strong> {artist.beginDate || 'Inconnu'} {artist.endDate ? `à ${artist.endDate}` : '(Actif)'}
            </div>
            {artist.gender && (
              <div>
                <strong>Genre :</strong> {artist.gender}
              </div>
            )}
          </div>

          {artist.genres && artist.genres.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              {artist.genres.map(genre => (
                <span key={genre} className="badge badge-blue">{genre}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'recordings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.6rem 1.2rem' }}
          onClick={() => setActiveTab('recordings')}
        >
          <Music size={16} /> Morceaux ({recordings.length})
        </button>
        <button
          className={`btn ${activeTab === 'releases' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.6rem 1.2rem' }}
          onClick={() => setActiveTab('releases')}
        >
          <Disc size={16} /> Albums ({releases.length})
        </button>
        <button
          className={`btn ${activeTab === 'collaborations' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.6rem 1.2rem' }}
          onClick={() => setActiveTab('collaborations')}
        >
          <Users size={16} /> Collaborations ({collaborations.length})
        </button>
        <button
          className={`btn ${activeTab === 'graph' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '0.6rem 1.2rem' }}
          onClick={() => setActiveTab('graph')}
        >
          <Share2 size={16} /> Graphe Ego
        </button>
      </div>

      {/* Tab Content */}
      <div className="glass-card" style={{ padding: '1.5rem', minHeight: '300px' }}>
        {activeTab === 'recordings' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Morceaux associés</h2>
            {recordings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Aucun morceau enregistré.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recordings.map((rec) => (
                  <div key={rec.mbid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{rec.title}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Date de publication : {rec.firstReleaseDate || 'Inconnue'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="badge badge-blue">{formatDuration(rec.length)}</span>
                      <span className={`badge ${rec.relation === 'FEATURED_ON' ? 'badge-success' : 'badge-purple'}`}>
                        {rec.relation === 'FEATURED_ON' ? 'Featuring' : 'Principal'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'releases' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Albums et Releases</h2>
            {releases.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Aucune release enregistrée.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {releases.map((rel) => (
                  <div key={rel.mbid} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{rel.title}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div>Type : {rel.releaseType || 'Album'}</div>
                      <div>Date : {rel.date || 'Inconnue'}</div>
                      <div>Status : {rel.status || 'Official'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collaborations' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Collaborations détectées</h2>
            {collaborations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Aucune collaboration directe trouvée.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {collaborations.map((collab) => (
                  <div key={collab.artist.mbid} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem', cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => onSelectArtist(collab.artist.mbid)}>
                        {collab.artist.name}
                      </strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Type : {collab.artist.type}
                      </div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {collab.tracks.map(t => (
                          <span key={t} className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => onSelectArtist(collab.artist.mbid)}>
                      Voir fiche
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'graph' && (
          <div style={{ height: '450px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Réseau d'artistes liés</h2>
            {graphData && graphData.nodes.length > 0 ? (
              <NetworkGraph 
                nodes={graphData.nodes} 
                edges={graphData.edges} 
                onNodeSelect={(node) => {
                  if (node.type === 'Artist' && node.properties?.mbid !== artistId) {
                    onSelectArtist(node.properties.mbid);
                  }
                }}
              />
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Données de graphe insuffisantes.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
