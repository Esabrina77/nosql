import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

interface GraphNode {
  id: string;
  type: string;
  label: string;
  properties?: any;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeSelect?: (node: GraphNode) => void;
  physicsEnabled?: boolean;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, edges, onNodeSelect, physicsEnabled }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const visNodes = nodes.map(node => {
      let color = '#ff5500';
      let size = 25;

      switch (node.type) {
        case 'Artist':
          color = '#ff5500';
          size = 28;
          break;
        case 'Recording':
          color = '#c2b29f';
          size = 20;
          break;
        case 'Release':
          color = '#8a7d6e';
          size = 22;
          break;
        case 'Genre':
          color = '#dfb15b';
          size = 15;
          break;
        case 'Area':
          color = '#8f9779';
          size = 18;
          break;
      }

      return {
        id: node.id,
        label: node.label,
        shape: 'dot',
        size: size,
        color: {
          background: color,
          border: '#080808',
          highlight: {
            background: color,
            border: '#ffffff'
          }
        },
        font: {
          color: '#f8fafc',
          size: 13,
          face: 'Inter'
        },
        shadow: true,
        title: `${node.type}: ${node.label}`
      };
    });

    const visEdges = edges.map((edge, idx) => ({
      id: `edge-${idx}`,
      from: edge.source,
      to: edge.target,
      label: edge.type,
      font: {
        color: '#64748b',
        size: 10,
        face: 'Inter',
        align: 'middle'
      },
      color: {
        color: 'rgba(148, 163, 184, 0.25)',
        highlight: '#a855f7',
        hover: '#a855f7'
      },
      width: 1.5,
      arrows: {
        to: { enabled: true, scaleFactor: 0.5 }
      }
    }));

    const options = {
      nodes: {
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: 'rgba(0, 0, 0, 0.4)',
          size: 5,
          x: 2,
          y: 2
        }
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          roundness: 0.5
        }
      },
      physics: {
        enabled: physicsEnabled !== false,
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 120,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.5
        },
        stabilization: {
          iterations: 150,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
        hideEdgesOnDrag: true,
        zoomView: true
      }
    };

    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      options
    );
    networkRef.current = network;

    if (onNodeSelect) {
      network.on('click', (params) => {
        if (params.nodes && params.nodes.length > 0) {
          const selectedId = params.nodes[0];
          const foundNode = nodes.find(n => n.id === selectedId.toString());
          if (foundNode) {
            onNodeSelect(foundNode);
          }
        }
      });
    }

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, physicsEnabled]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#0a0e17', 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
      }} 
    />
  );
};