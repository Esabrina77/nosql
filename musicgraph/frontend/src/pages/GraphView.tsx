import React, { useEffect, useState } from 'react';
import { NetworkGraph } from '../components/NetworkGraph';
import { Info, HelpCircle, Route, Filter, Play, Pause } from 'lucide-react';

interface NodeDetails {
  id: string;
  type: string;
  label: string;
  properties?: any;
}

interface GraphData {
  nodes: Array<{ id: string; type: string; label: string; properties?: any }>;
  edges: Array<{ source: string; target: string; type: string }>;
}

interface ArtistSimple {
  mbid: string;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const GraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  const [artists, setArtists] = useState<ArtistSimple[]>([]);
  const [sourceMbid, setSourceMbid] = useState('');
  const [targetMbid, setTargetMbid] = useState('');
  const [isPathMode, setIsPathMode] = useState(false);
  const [pathLoading, setPathLoading] = useState(false);

  const [filterTypes, setFilterTypes] = useState({
    Artist: true,
    Recording: true,
    Release: true,
    Genre: true,
    Area: true,
    Label: false
  });
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/graph`)
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`${API_URL}/artists`)
      .then(res => res.json())
      .then(data => {
        setArtists(data.map((a: any) => ({ mbid: a.mbid, name: a.name })));
      })
      .catch(err => console.error(err));
  }, []);

  const handleFindPath = () => {
    if (!sourceMbid || !targetMbid) return;
    setPathLoading(true);
    fetch(`${API_URL}/graph/path?source=${sourceMbid}&target=${targetMbid}`)
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        setIsPathMode(true);
        setPathLoading(false);
        setSelectedNode(null);
      })
      .catch(err => {
        console.error(err);
        setPathLoading(false);
      });
  };

  const handleResetGraph = () => {
    setLoading(true);
    setIsPathMode(false);
    setSourceMbid('');
    setTargetMbid('');
    setSelectedNode(null);
    fetch(`${API_URL}/graph`)
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const filteredNodes = graphData
    ? graphData.nodes.filter(n => filterTypes[n.type as keyof typeof filterTypes])
    : [];

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredEdges = graphData
    ? graphData.edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
    : [];

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Explorateur Graphique</h1>
          <p className="page-subtitle">Visualisez en temps réel l'ensemble du réseau stocké dans Neo4j</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="glass-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)' }}>
          <Route size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chemin :</span>
          <select
            value={sourceMbid}
            onChange={(e) => setSourceMbid(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', background: '#0a0e17', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', flex: 1 }}
          >
            <option value="">-- Artiste A --</option>
            {artists.map(a => <option key={a.mbid} value={a.mbid}>{a.name}</option>)}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>➔</span>
          <select
            value={targetMbid}
            onChange={(e) => setTargetMbid(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', background: '#0a0e17', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', outline: 'none', flex: 1 }}
          >
            <option value="">-- Artiste B --</option>
            {artists.map(a => <option key={a.mbid} value={a.mbid}>{a.name}</option>)}
          </select>
          <button
            onClick={handleFindPath}
            disabled={!sourceMbid || !targetMbid || pathLoading}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              cursor: (!sourceMbid || !targetMbid || pathLoading) ? 'not-allowed' : 'pointer',
              opacity: (!sourceMbid || !targetMbid || pathLoading) ? 0.6 : 1
            }}
          >
            {pathLoading ? 'Calcul...' : 'Lancer'}
          </button>
          {isPathMode && (
            <button
              onClick={handleResetGraph}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--accent-secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Afficher :</span>
            {Object.keys(filterTypes).map((type) => (
              <label key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', cursor: 'pointer', marginRight: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={filterTypes[type as keyof typeof filterTypes]}
                  onChange={(e) => setFilterTypes({
                    ...filterTypes,
                    [type]: e.target.checked
                  })}
                  style={{ cursor: 'pointer' }}
                />
                <span>{type === 'Artist' ? 'Artistes' : type === 'Recording' ? 'Morceaux' : type === 'Release' ? 'Albums' : type === 'Genre' ? 'Genres' : type === 'Area' ? 'Pays' : 'Labels'}</span>
              </label>
            ))}
          </div>

          <button
            onClick={() => setPhysicsEnabled(!physicsEnabled)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              padding: '0.35rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {physicsEnabled ? <Pause size={12} /> : <Play size={12} />}
            {physicsEnabled ? 'Figer' : 'Activer'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredNodes.length > 0 ? (
          <div style={{ height: '100%', minHeight: '350px' }}>
            <NetworkGraph
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodeSelect={(node) => setSelectedNode(node)}
              physicsEnabled={physicsEnabled}
            />
          </div>
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            <HelpCircle size={48} style={{ marginBottom: '1rem' }} />
            {isPathMode ? (
              <>
                <h3>Aucun chemin trouvé</h3>
                <p style={{ marginTop: '0.5rem', textAlign: 'center' }}>Il n'existe aucun chemin de collaboration (jusqu'à 6 degrés) reliant ces deux artistes dans la base actuelle.</p>
              </>
            ) : (
              <>
                <h3>Aucun nœud visible</h3>
                <p style={{ marginTop: '0.5rem', textAlign: 'center' }}>Activez au moins un filtre ci-dessus ou importez des artistes.</p>
              </>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Légende du Graphe</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e11d48' }}></div>
                <span>Artistes (Artist)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }}></div>
                <span>Morceaux (Recording)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#06b6d4' }}></div>
                <span>Albums (Release)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
                <span>Genres (Genre)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                <span>Pays (Area)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }}></div>
                <span>Labels (Label)</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Info size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Inspecteur de Nœud</h3>
            </div>

            {selectedNode ? (
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>{selectedNode.type}</span>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{selectedNode.label}</h4>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  {selectedNode.type === 'Artist' && (
                    <>
                      <div><span style={{ color: 'var(--text-muted)' }}>Type :</span> {selectedNode.properties.type || 'N/A'}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Pays d'origine :</span> {selectedNode.properties.country || 'N/A'}</div>
                      {selectedNode.properties.beginDate && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Début d'activité :</span> {selectedNode.properties.beginDate}</div>
                      )}
                      {selectedNode.properties.endDate && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Fin d'activité :</span> {selectedNode.properties.endDate}</div>
                      )}
                      {selectedNode.properties.disambiguation && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Description :</span> <span style={{ fontStyle: 'italic' }}>{selectedNode.properties.disambiguation}</span></div>
                      )}
                    </>
                  )}

                  {selectedNode.type === 'Recording' && (
                    <>
                      {selectedNode.properties.length && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Durée :</span> {(() => {
                            const ms = Number(selectedNode.properties.length);
                            const minutes = Math.floor(ms / 60000);
                            const seconds = ((ms % 60000) / 1000).toFixed(0);
                            return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds} min`;
                          })()}
                        </div>
                      )}
                      {selectedNode.properties.firstReleaseDate && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Date de publication :</span> {selectedNode.properties.firstReleaseDate}</div>
                      )}
                      <div><span style={{ color: 'var(--text-muted)' }}>Source :</span> {selectedNode.properties.source || 'MusicBrainz'}</div>
                    </>
                  )}

                  {selectedNode.type === 'Release' && (
                    <>
                      <div><span style={{ color: 'var(--text-muted)' }}>Type de parution :</span> {selectedNode.properties.releaseType || 'N/A'}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Statut :</span> {selectedNode.properties.status || 'N/A'}</div>
                      {selectedNode.properties.date && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Date de sortie :</span> {selectedNode.properties.date}</div>
                      )}
                      {selectedNode.properties.country && (
                        <div><span style={{ color: 'var(--text-muted)' }}>Pays de distribution :</span> {selectedNode.properties.country}</div>
                      )}
                    </>
                  )}

                  {selectedNode.type === 'Genre' && (
                    <div><span style={{ color: 'var(--text-muted)' }}>Style :</span> <span style={{ textTransform: 'capitalize' }}>{selectedNode.label}</span></div>
                  )}

                  {selectedNode.type === 'Area' && (
                    <>
                      <div><span style={{ color: 'var(--text-muted)' }}>Nom :</span> {selectedNode.properties.name}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Type géographique :</span> {selectedNode.properties.type || 'N/A'}</div>
                    </>
                  )}

                  {selectedNode.type === 'Label' && (
                    <>
                      <div><span style={{ color: 'var(--text-muted)' }}>Nom :</span> {selectedNode.properties.name}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Pays :</span> {selectedNode.properties.country || 'N/A'}</div>
                    </>
                  )}

                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', wordBreak: 'break-all' }}>
                    <strong>ID unique :</strong> {selectedNode.properties.mbid || 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Cliquez sur un nœud dans le graphe pour inspecter ses propriétés détaillées.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};