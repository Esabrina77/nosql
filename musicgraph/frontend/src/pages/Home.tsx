import React, { useEffect, useState } from 'react';
import { Music, Users, Library, Globe, Share2, Compass, ArrowRight } from 'lucide-react';

interface StatsOverview {
  totalArtists: number;
  totalRecordings: number;
  totalReleases: number;
  totalGenres: number;
  totalAreas: number;
  totalCollaborations: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Home: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/stats/overview`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching overview stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">MusicGraph</h1>
          <p className="page-subtitle">Exploration des collaborations et influences musicales avec Neo4j et MusicBrainz</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Découvrez les ponts invisibles de la musique
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Les relations entre artistes, albums, morceaux et collaborations forment un écosystème complexe. 
            MusicGraph extrait ces informations en temps réel de MusicBrainz, les structure sous forme de graphe dans Neo4j, 
            et vous permet de naviguer visuellement à travers les featurings, les genres et les origines géographiques.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setPage('search')}>
              Rechercher & Importer <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => setPage('graph')}>
              Explorer le Graphe
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.08) 0%, rgba(194, 178, 159, 0.04) 100%)', borderColor: 'rgba(255, 85, 0, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255, 85, 0, 0.12)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Compass color="var(--accent-primary)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>Actions Rapides</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }} onClick={() => setPage('artists')}>
              <strong>Liste des artistes</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Voir toutes les fiches d'artistes importées.</p>
            </div>
            <div style={{ cursor: 'pointer', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }} onClick={() => setPage('stats')}>
              <strong>Statistiques data</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Top collaborations et centralité des artistes.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>État de la base de données</h2>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Users size={32} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalArtists || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Artistes</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Music size={32} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalRecordings || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Morceaux</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Library size={32} color="#06b6d4" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalReleases || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Albums / Releases</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Share2 size={32} color="#eab308" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalCollaborations || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Collaborations</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <Globe size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalAreas || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pays / Zones</div>
          </div>
        </div>
      )}
    </div>
  );
};
