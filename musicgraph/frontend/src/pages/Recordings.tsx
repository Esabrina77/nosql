import React, { useEffect, useState } from 'react';
import { Music, Calendar, Clock } from 'lucide-react';

interface Recording {
  mbid: string;
  title: string;
  length?: number;
  firstReleaseDate?: string;
  source?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/recordings`)
      .then(res => res.json())
      .then(data => {
        setRecordings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recordings:', err);
        setLoading(false);
      });
  }, []);

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Morceaux & Enregistrements</h1>
          <p className="page-subtitle">Parcourez les morceaux de musique importés dans la base de données</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : recordings.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <h3>Aucun morceau importé</h3>
          <p style={{ marginTop: '0.5rem' }}>Importez des artistes pour enrichir la liste des morceaux.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recordings.map((rec) => (
            <div key={rec.mbid} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.6rem', borderRadius: '8px' }}>
                  <Music color="#3b82f6" size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{rec.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MBID: {rec.mbid}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={16} />
                  <span>{formatDuration(rec.length)}</span>
                </div>
                {rec.firstReleaseDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={16} />
                    <span>{rec.firstReleaseDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
