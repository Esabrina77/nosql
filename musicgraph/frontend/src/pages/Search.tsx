import React, { useState } from 'react';
import { Search as SearchIcon, Download, Check, AlertCircle } from 'lucide-react';

interface ArtistResult {
  mbid: string;
  name: string;
  type: string;
  country: string;
  beginDate: string;
  score: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArtistResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/search/artists?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Erreur lors de la recherche sur MusicBrainz.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (mbid: string, name: string) => {
    setImporting(mbid);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/import/artists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbid })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `L'artiste "${name}" et toutes ses relations ont été importés dans Neo4j !` });
      } else {
        setMessage({ type: 'error', text: data.error || "Erreur lors de l'import." });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: "Impossible de joindre le serveur d'import." });
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recherche MusicBrainz</h1>
          <p className="page-subtitle">Recherchez des artistes du monde entier et importez leur univers dans Neo4j</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <SearchIcon className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Daft Punk, Angèle, Stromae, Damso, Jay-Z..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`glass-card`} style={{
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          borderColor: message.type === 'success' ? '#10b981' : '#ef4444',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
        }}>
          {message.type === 'success' ? <Check color="#10b981" /> : <AlertCircle color="#ef4444" />}
          <span style={{ color: message.type === 'success' ? '#34d399' : '#f87171' }}>{message.text}</span>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.map((artist) => (
            <div key={artist.mbid} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{artist.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">{artist.type}</span>
                  <span className="badge badge-blue">{artist.country}</span>
                  <span className="badge badge-success">Score: {artist.score}%</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  MBID: <code style={{ color: 'var(--accent-secondary)' }}>{artist.mbid}</code>
                </p>
                {artist.beginDate && artist.beginDate !== 'Unknown' && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Début d'activité : {artist.beginDate}
                  </p>
                )}
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleImport(artist.mbid, artist.name)}
                  disabled={importing !== null}
                  style={{ minWidth: '130px', justifyContent: 'center' }}
                >
                  {importing === artist.mbid ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  ) : (
                    <>
                      <Download size={16} /> Importer
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
          Aucun résultat trouvé pour "{query}". Essayez une autre recherche.
        </div>
      )}
    </div>
  );
};
