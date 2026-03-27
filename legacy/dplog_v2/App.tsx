
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import { VideoSection, AgentFirst, FeatureExplorer } from './components/Features';
import { UseCases, TrySolutions, LatestBlogs, DownloadSection } from './components/Resources';
import Footer from './components/Footer';
import BufferDashboard from './components/BufferDashboard';
import Pathfinder from './components/Pathfinder';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'buffer' | 'pathfinder'>('home');

  return (
    <div className="min-h-screen bg-white">
      {/* Hide global header when in Pathfinder mode as it has its own header */}
      {currentPage !== 'pathfinder' && (
        <Header onNavigate={setCurrentPage} currentPage={currentPage === 'buffer' ? 'buffer' : 'home'} />
      )}
      
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero onStartPathfinder={() => setCurrentPage('pathfinder')} />
            <VideoSection />
            <AgentFirst />
            <FeatureExplorer />
            <UseCases />
            <TrySolutions />
            <LatestBlogs />
            <DownloadSection />
          </>
        ) : currentPage === 'buffer' ? (
          <BufferDashboard />
        ) : (
          <Pathfinder onExit={() => setCurrentPage('home')} />
        )}
      </main>
      
      {currentPage === 'home' && <Footer />}
    </div>
  );
}

export default App;
