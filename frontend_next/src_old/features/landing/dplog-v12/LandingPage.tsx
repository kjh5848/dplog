'use client';

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { VideoSection, AgentFirst, FeatureExplorer } from './components/Features';
import { UseCases, TrySolutions, LatestBlogs, DownloadSection } from './components/Resources';

export default function LandingPageV12() {
  const [currentPage, setCurrentPage] = useState<'home' | 'buffer'>('home');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main>
        {currentPage === 'home' ? (
          <>
            <Hero />
            <VideoSection />
            <AgentFirst />
            <FeatureExplorer />
            <UseCases />
            <TrySolutions />
            <LatestBlogs />
            <DownloadSection />
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Buffer Dashboard</h2>
              <p className="text-gray-500">대시보드 기능이 준비 중입니다.</p>
              <button 
                onClick={() => setCurrentPage('home')}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </main>
      
      {currentPage === 'home' && <Footer />}
    </div>
  );
}
