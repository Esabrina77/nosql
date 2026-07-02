import React, { useEffect, useState } from 'react';
import { NetworkGraph } from '../components/NetworkGraph';
import { Info, HelpCircle } from 'lucide-react';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const GraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NodeDetails | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/graph`)
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching full graph:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title">Explorateur Graphique</h1>
          <p className="page-subtitle">Visualisez en temps réel l'ensemble du réseau stocké dans Neo4j</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem', minHeight: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner"></div>
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <div style={{ height: '100%', minHeight: '350px' }}>
            <NetworkGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeSelect={(node) => setSelectedNode(node)}
            />
          </div>
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <HelpCircle size={48} />
            <h3>Aucun graphe disponible</h3>
            <p style={{ marginTop: '0.5rem' }}>Importez des artistes pour commencer à peupler le graphe.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Legend Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Légende du Graphe</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a855f7' }}></div>
                <span>Artistes (Artist)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div>
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
            </div>
          </div>

          {/* Node Inspector Card */}
          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Info size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Inspecteur de Nœud</h3>
            </div>
            
            {selectedNode ? (
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>{selectedNode.type}</span>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{selectedNode.label}</h4>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                    <div key={key}>
                      <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                      <span style={{ wordBreak: 'break-all' }}>{String(val)}</span>
                    </div>
                  ))}
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
