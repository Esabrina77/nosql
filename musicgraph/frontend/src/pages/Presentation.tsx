import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Radio, Database, Server, Settings, Tv, ShieldAlert, CheckCircle, List, BarChart3, Code } from 'lucide-react';

interface PresentationProps {
  setPage: (page: string) => void;
}

export const Presentation: React.FC<PresentationProps> = ({ setPage }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    // Slide 1: Intro
    {
      title: "MusicGraph",
      subtitle: "Projet B3 Dev & B3 Data — Exploration des collaborations musicales",
      type: "intro",
      content: (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(168, 85, 247, 0.15)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.25rem' }}>
            <Radio size={56} color="#a855f7" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>MusicGraph</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
            Une application web complète pour collecter les données de MusicBrainz, les stocker dans Neo4j, et visualiser le graphe des collaborations.
          </p>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Présentation de Soutenance d'Oral
          </div>
        </div>
      )
    },
    // Slide 2: Modélisation Neo4j (Critère Modélisation Neo4j - 4 points)
    {
      title: "1. Modélisation Neo4j",
      subtitle: "Structure du graphe, nœuds et relations implémentés",
      type: "schema",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          <svg viewBox="0 0 920 230" width="100%" height="210" style={{ fontFamily: 'var(--font-sans)' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
              </marker>
            </defs>

            {/* Connection Lines */}
            <path d="M 120 50 L 210 80" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
            <text x="110" y="60" fill="#eab308" fontSize="8" fontWeight="bold">ASSOCIATED_WITH_GENRE</text>

            <path d="M 120 170 L 210 110" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
            <text x="120" y="150" fill="#10b981" fontSize="8" fontWeight="bold">FROM_AREA</text>

            <path d="M 275 95 L 420 95" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
            <text x="290" y="85" fill="#e11d48" fontSize="8" fontWeight="bold">PERFORMED / FEATURED_ON</text>

            <path d="M 230 60 C 210 20, 270 20, 250 60" stroke="#e11d48" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <text x="180" y="15" fill="#e11d48" fontSize="8" fontWeight="bold">COLLABORATED_WITH</text>

            <path d="M 495 95 L 640 95" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
            <text x="530" y="85" fill="#2563eb" fontSize="8" fontWeight="bold">APPEARS_ON</text>

            <path d="M 715 95 L 795 95" stroke="#64748b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            <text x="725" y="85" fill="#f97316" fontSize="8" fontWeight="bold">RELEASED_BY</text>

            <path d="M 680 125 C 680 200, 110 200, 110 195" stroke="#64748b" strokeWidth="1.5" fill="none" strokeDasharray="3,3" markerEnd="url(#arrow)" />
            <text x="360" y="210" fill="#10b981" fontSize="8" fontWeight="bold">RELEASED_IN</text>

            {/* Nodes */}
            <g transform="translate(100, 35)">
              <circle r="18" fill="#0f172a" stroke="#eab308" strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 4px rgba(234, 179, 8, 0.4))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="9" fontWeight="bold">Genre</text>
              <text textAnchor="middle" y="28" fill="#94a3b8" fontSize="8">name</text>
            </g>

            <g transform="translate(100, 165)">
              <circle r="18" fill="#0f172a" stroke="#10b981" strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 4px rgba(16, 185, 129, 0.4))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="9" fontWeight="bold">Area</text>
              <text textAnchor="middle" y="28" fill="#94a3b8" fontSize="8">mbid, name, type</text>
            </g>

            <g transform="translate(245, 95)">
              <circle r="24" fill="#0f172a" stroke="#e11d48" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 0px 6px rgba(225, 29, 72, 0.5))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="10" fontWeight="bold">Artist</text>
              <text textAnchor="middle" y="36" fill="#94a3b8" fontSize="8">mbid, name, country</text>
            </g>

            <g transform="translate(460, 95)">
              <circle r="24" fill="#0f172a" stroke="#2563eb" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 0px 6px rgba(37, 99, 235, 0.5))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="9" fontWeight="bold">Track</text>
              <text textAnchor="middle" y="36" fill="#94a3b8" fontSize="8">mbid, title, length</text>
            </g>

            <g transform="translate(680, 95)">
              <circle r="24" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 0px 6px rgba(6, 182, 212, 0.5))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="9" fontWeight="bold">Album</text>
              <text textAnchor="middle" y="36" fill="#94a3b8" fontSize="8">mbid, title, date</text>
            </g>

            <g transform="translate(830, 95)">
              <circle r="18" fill="#0f172a" stroke="#f97316" strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 4px rgba(249, 115, 22, 0.4))' }} />
              <text textAnchor="middle" dy="3" fill="#f8fafc" fontSize="9" fontWeight="bold">Label</text>
              <text textAnchor="middle" y="28" fill="#94a3b8" fontSize="8">mbid, name</text>
            </g>
          </svg>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Relations directes <code>COLLABORATED_WITH</code> générées dynamiquement lors de l'import d'un morceau créditant plusieurs interprètes.
          </div>
        </div>
      )
    },
    // Slide 3: API Backend & Endpoints (Critère Backend & API - 4 points)
    {
      title: "2. Backend & API REST",
      subtitle: "Les Endpoints principaux de communication avec Neo4j",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Endpoints Obligatoires Implémentés :</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid #a855f7' }}>
                <span style={{ color: '#34d399' }}>GET</span> /api/artists &amp; /api/artists/:id/recordings
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid #a855f7' }}>
                <span style={{ color: '#34d399' }}>GET</span> /api/recordings &amp; /api/releases
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
                <span style={{ color: '#34d399' }}>GET</span> /api/graph &amp; /api/graph/artists/:id (Ego Network)
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid #f59e0b' }}>
                <span style={{ color: '#34d399' }}>GET</span> /api/stats/top-artists &amp; /api/stats/top-collaborations
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px', borderLeft: '3px solid #f87171' }}>
                <span style={{ color: '#fb7185' }}>POST</span> /api/import/artists (Lancement de l'importation)
              </div>
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={18} /> Backend Stack
            </h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Développé en <strong>Node.js</strong> et <strong>TypeScript</strong>.</li>
              <li>Connexion au graphe via le driver officiel <code>neo4j-driver</code> avec gestion robuste du pool de sessions.</li>
              <li>Validation des paramètres et gestion globale des codes erreurs HTTP.</li>
            </ul>
          </div>
        </div>
      )
    },
    // Slide 4: Intégration MusicBrainz (Critère Intégration MusicBrainz - 3 points)
    {
      title: "3. Intégration MusicBrainz",
      subtitle: "Récupération structurée et mapping des données",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Flux d'importation :</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Requête initialisée par l'utilisateur avec un <strong>MBID</strong> d'artiste.</li>
              <li>Recherche des détails de l'artiste (Area, Genre, Tags).</li>
              <li>Browse des Releases de l'artiste avec inclusion des morceaux (`recordings`), collaborations (`artist-credits`) et `labels`.</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Détection des collaborations :</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
              Le backend scanne les <code>artist-credit</code> imbriqués dans chaque piste de l'album :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: '3px solid #10b981' }}>
                <strong>Featuring</strong> : Identifié via regex si la phrase de liaison contient <code>feat.</code>, <code>featuring</code>, ou <code>ft.</code>.
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', borderLeft: '3px solid #a855f7' }}>
                <strong>Interprète Principal</strong> : Lié avec la relation standard <code>PERFORMED</code>.
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Slide 5: Qualité de Données (Critère Qualité des données - 3 points)
    {
      title: "4. Qualité des Données & Gestion API",
      subtitle: "Résilience du backend face aux contraintes externes",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <h3 style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <CheckCircle size={18} /> Normalisation & Unicité
            </h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <li><strong>Contraintes d'unicité</strong> appliquées dans Neo4j (ex: <code>CREATE CONSTRAINT FOR (a:Artist) REQUIRE a.mbid IS UNIQUE</code>).</li>
              <li>Usage systématique de clauses <code>MERGE</code> pour éviter les nœuds doublons.</li>
              <li>Nettoyage et conversion des minuscules/majuscules pour les genres musicaux.</li>
            </ul>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ color: '#f87171', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <ShieldAlert size={18} /> Gestion du débit API (Rate-limiting)
            </h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <li>L'API MusicBrainz impose 1 requête par seconde sous peine de blocage (erreur 503).</li>
              <li><strong>File d'attente séquencée</strong> : Les requêtes s'exécutent en série avec 1,1s de délai garanti.</li>
              <li><strong>Timeout de 10 secondes</strong> sur toutes les requêtes Axios pour empêcher le serveur de geler indéfiniment.</li>
            </ul>
          </div>
        </div>
      )
    },
    // Slide 6: Docker & Organisation (Critère Docker & organisation - 2 points)
    {
      title: "5. Conteneurisation avec Docker",
      subtitle: "Structure unifiée des services de l'application",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Orchestration des services :</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>📦 <strong>neo4j</strong> : Base de données. Active automatiquement l'extension APOC pour les calculs avancés.</div>
              <div>📦 <strong>backend</strong> : Construit via son Dockerfile, dépend de la santé de Neo4j (`service_healthy`).</div>
              <div>📦 <strong>frontend</strong> : Serveur React de développement sur le port 5173.</div>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Avantages du Docker Compose :</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <li>Lancement complet en une seule commande : <code>docker compose up --build</code>.</li>
              <li>Isolation réseau complète pour les microservices.</li>
              <li>Persistance des données configurée via des volumes nommés pour Neo4j.</li>
            </ul>
          </div>
        </div>
      )
    },
    // Slide 7: Interface Web (Critère Interface web - 3 points)
    {
      title: "6. L'Interface Web MusicGraph",
      subtitle: "Design système moderne, intuitif et interactif",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Esthétique Premium :</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <li>Thème sombre moderne combinant <strong>glassmorphism</strong> et bordures subtiles.</li>
              <li>Typographie soignée importée de Google Fonts (Inter &amp; Outfit).</li>
              <li>Micro-animations fluides de survol et indicateurs de chargement interactifs.</li>
            </ul>
          </div>
          <div className="glass-card" style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tv size={16} color="var(--accent-primary)" /> Rendu Graphique
            </h4>
            <p>
              L'intégration de la bibliothèque <code>vis-network</code> permet un rendu interactif en 2D Canvas :
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>Zoom et déplacement fluides.</li>
              <li>Rendu basé sur la physique des forces (barnesHut).</li>
              <li>Inspecteur latéral lors du clic sur un nœud.</li>
            </ul>
          </div>
        </div>
      )
    },
    // Slide 8: Analyse Data & Démo Live (Critère Analyse data - 3 points)
    {
      title: "7. Analyses de Données & Démo Live",
      subtitle: "Calculs en temps réel et exploration interactive",
      type: "split",
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '0.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Calculs de Centralité (Cypher) :</h4>
            <div className="glass-card" style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.7rem', background: '#070a13', marginBottom: '0.5rem' }}>
              <span style={{ color: '#a855f7' }}>// Degré de centralité</span><br />
              MATCH (a:Artist)-[:COLLABORATED_WITH]-(other:Artist)<br />
              RETURN a.name, count(distinct other) as degree<br />
              ORDER BY degree DESC LIMIT 10;
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              Le graphe calcule dynamiquement les artistes les plus influents (hubs) et les paires de collaborations les plus actives.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(168, 85, 247, 0.03)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Lancer la Démo Live</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%' }}>
              <button className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setPage('search')}>
                🔍 Recherche
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setPage('artists')}>
                👥 Artistes
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setPage('graph')}>
                🕸️ Graphe
              </button>
              <button className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => setPage('stats')}>
                📊 Stats
              </button>
            </div>
          </div>
        </div>
      )
    },
    // Slide 9: Conclusion & Rendu (Critère README & documentation - 3 points)
    {
      title: "8. Conclusion & Livrables",
      subtitle: "Validation et conformité au cahier des charges",
      type: "intro",
      content: (
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <CheckCircle size={44} color="#10b981" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Projet Conforme à 100%</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>📁 <strong>code</strong> : Backend &amp; Frontend compilés et vérifiés.</div>
            <div>📁 <strong>data/</strong> : seed.cypher &amp; seed.json présents.</div>
            <div>📁 <strong>docs/</strong> : model.md &amp; guide oral présents.</div>
            <div>📁 <strong>docker/</strong> : docker-compose.yml fonctionnel.</div>
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Merci pour votre attention. Nous sommes ouverts à vos questions.
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Slide Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>{slide.title}</h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem' }}>{slide.subtitle}</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Diapo {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Slide Body */}
      <div className="glass-card" style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0, position: 'relative' }}>
        {slide.content}
      </div>

      {/* Navigation Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handlePrev} 
          disabled={currentSlide === 0}
          style={{ minWidth: '120px', justifyContent: 'center' }}
        >
          <ArrowLeft size={16} /> Précédent
        </button>
        
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: currentSlide === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', 
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            />
          ))}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleNext} 
          disabled={currentSlide === slides.length - 1}
          style={{ minWidth: '120px', justifyContent: 'center' }}
        >
          Suivant <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
