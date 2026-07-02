import React, { useEffect, useState } from 'react';
import { Eye, HelpCircle } from 'lucide-react';

interface Artist {
  mbid: string;
  name: string;
  type: string;
  country: string;
  beginDate: string;
  endDate?: string;
  disambiguation?: string;
  area?: string;
}

interface ArtistsProps {
  onSelectArtist: (mbid: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Artists: React.FC<ArtistsProps> = ({ onSelectArtist }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/artists`)
      .then(res => res.json())
      .then(data => {
        setArtists(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching artists:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Artistes Importés</h1>
          <p className="page-subtitle">Parcourez les artistes stockés dans votre base de données locale Neo4j</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : artists.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <HelpCircle size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
          <h3>Aucun artiste importé</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Commencez par rechercher des artistes sur MusicBrainz pour alimenter la base de données.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {artists.map((artist) => (
            <div key={artist.mbid} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{artist.name}</h3>
                  <span className="badge badge-purple">{artist.type}</span>
                </div>
                {artist.disambiguation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                    "{artist.disambiguation}"
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Pays :</strong> {artist.area || artist.country}</div>
                  <div><strong>Activité :</strong> {artist.beginDate || 'Inconnu'} {artist.endDate ? `à ${artist.endDate}` : ''}</div>
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => onSelectArtist(artist.mbid)}
                >
                  <Eye size={16} /> Voir la fiche
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
