import React, { useState } from 'react';
import { Home as HomeIcon, Search as SearchIcon, Users, Music, Share2, BarChart3, Radio } from 'lucide-react';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Artists } from './pages/Artists';
import { ArtistDetails } from './pages/ArtistDetails';
import { Recordings } from './pages/Recordings';
import { GraphView } from './pages/GraphView';
import { Stats } from './pages/Stats';

type PageType = 'home' | 'search' | 'artists' | 'recordings' | 'graph' | 'stats' | 'artist-details';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  const handleSelectArtist = (mbid: string) => {
    setSelectedArtistId(mbid);
    setCurrentPage('artist-details');
  };

  const handleBackToArtists = () => {
    setSelectedArtistId(null);
    setCurrentPage('artists');
  };

  const navigateToPage = (page: PageType) => {
    setSelectedArtistId(null);
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo">
          <Radio size={28} color="#a855f7" />
          <span>MusicGraph</span>
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul className="nav-menu">
            <li 
              className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateToPage('home')}
            >
              <HomeIcon size={20} />
              <span>Accueil</span>
            </li>
            <li 
              className={`nav-item ${currentPage === 'search' ? 'active' : ''}`}
              onClick={() => navigateToPage('search')}
            >
              <SearchIcon size={20} />
              <span>Rechercher</span>
            </li>
            <li 
              className={`nav-item ${currentPage === 'artists' || currentPage === 'artist-details' ? 'active' : ''}`}
              onClick={() => navigateToPage('artists')}
            >
              <Users size={20} />
              <span>Artistes</span>
            </li>
            <li 
              className={`nav-item ${currentPage === 'recordings' ? 'active' : ''}`}
              onClick={() => navigateToPage('recordings')}
            >
              <Music size={20} />
              <span>Morceaux</span>
            </li>
            <li 
              className={`nav-item ${currentPage === 'graph' ? 'active' : ''}`}
              onClick={() => navigateToPage('graph')}
            >
              <Share2 size={20} />
              <span>Explorateur Graphe</span>
            </li>
            <li 
              className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
              onClick={() => navigateToPage('stats')}
            >
              <BarChart3 size={20} />
              <span>Analyses & Stats</span>
            </li>
          </ul>
        </nav>
        
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          MusicGraph v1.0.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {currentPage === 'home' && <Home setPage={(p) => navigateToPage(p as PageType)} />}
        {currentPage === 'search' && <Search />}
        {currentPage === 'artists' && <Artists onSelectArtist={handleSelectArtist} />}
        {currentPage === 'recordings' && <Recordings />}
        {currentPage === 'graph' && <GraphView />}
        {currentPage === 'stats' && <Stats />}
        {currentPage === 'artist-details' && selectedArtistId && (
          <ArtistDetails 
            artistId={selectedArtistId} 
            onBack={handleBackToArtists} 
            onSelectArtist={handleSelectArtist}
          />
        )}
      </main>
    </div>
  );
};

export default App;
