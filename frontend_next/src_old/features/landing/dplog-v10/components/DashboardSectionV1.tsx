'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

/* ─── Slide Data ─── */
interface VideoSlide {
  id: string;
  title: string;
  description: string;
  videoSrc: string;
  accent: string; // gradient color
}

const slides: VideoSlide[] = [
  {
    id: 'keyword',
    title: 'AI 키워드 추천',
    description: '매장에 최적화된 검색 키워드를 AI가 분석합니다',
    videoSrc: '/videos/dashboard-demo.mp4',
    accent: '#3b82f6',
  },
  {
    id: 'dashboard',
    title: '실시간 대시보드',
    description: '네이버 플레이스 순위와 리뷰를 한눈에 확인하세요',
    videoSrc: '/videos/dashboard-demo.mp4',
    accent: '#06b6d4',
  },
  {
    id: 'analytics',
    title: '경쟁 분석 리포트',
    description: '주변 경쟁 매장의 전략을 파악하고 차별화하세요',
    videoSrc: '/videos/dashboard-demo.mp4',
    accent: '#8b5cf6',
  },
  {
    id: 'mission',
    title: '주간 미션 가이드',
    description: '매주 실행 가능한 최적화 미션을 제공합니다',
    videoSrc: '/videos/dashboard-demo.mp4',
    accent: '#10b981',
  },
  {
    id: 'alert',
    title: '알림 & 리포트',
    description: '순위 변동과 리뷰를 실시간으로 알려드립니다',
    videoSrc: '/videos/dashboard-demo.mp4',
    accent: '#f59e0b',
  },
];

/* ─── Component ─── */
export const DashboardSectionV1 = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Start on dashboard (center)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // Play only the center video
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeIndex]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= slides.length) return;
    setActiveIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    goTo(activeIndex > 0 ? activeIndex - 1 : slides.length - 1);
  }, [activeIndex, goTo]);

  const goNext = useCallback(() => {
    goTo(activeIndex < slides.length - 1 ? activeIndex + 1 : 0);
  }, [activeIndex, goTo]);

  // Touch/mouse drag for mobile
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goPrev();
      else goNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  // slide=60vw, gap=3vw, stride=63vw, half=30vw
  const SLIDE_VW = 60;
  const GAP_VW = 3;
  const STRIDE_VW = SLIDE_VW + GAP_VW; // 63
  const HALF_VW = SLIDE_VW / 2; // 30

  // ─── Render ───
  return (
    <section className="dashboard-carousel-section">
      {/* Section header */}
      <div className="dc-header">
        <motion.p
          className="dc-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          DASHBOARD V1
        </motion.p>
        <motion.h2
          className="dc-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          한눈에 보는 매장 성장
        </motion.h2>
        <motion.p
          className="dc-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          스와이프하여 D-PLOG의 주요 기능을 살펴보세요
        </motion.p>
      </div>

      {/* Text tabs */}
      <div className="dc-tabs">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            className={`dc-tab ${i === activeIndex ? 'dc-tab-active' : ''}`}
            onClick={() => goTo(i)}
            style={{ ['--tab-accent' as string]: slide.accent }}
          >
            {slide.title}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div
        className="dc-carousel-wrap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setIsDragging(false)}
      >
        <div
          ref={trackRef}
          className="dc-track"
          style={{
            transform: `translateX(calc(50% - ${HALF_VW}vw - ${activeIndex * STRIDE_VW}vw))`,
          }}
        >
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            const distance = Math.abs(i - activeIndex);

            return (
              <motion.div
                key={slide.id}
                className={`dc-slide ${isActive ? 'dc-slide-active' : ''}`}
                animate={{
                  scale: isActive ? 1 : 0.88,
                  opacity: isActive ? 1 : distance > 1 ? 0.3 : 0.5,
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                onClick={() => goTo(i)}
              >
                {/* Video Frame */}
                <div className="dc-video-frame">
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={slide.videoSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="dc-video"
                  />
                  {/* Play/Pause overlay */}
                  {isActive && (
                    <div className="dc-play-badge">
                      <Play size={10} fill="currentColor" />
                      <span>재생 중</span>
                    </div>
                  )}
                  {!isActive && (
                    <div className="dc-paused-overlay">
                      <Pause size={20} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows (optional but good for desktop) */}
      {/* 
      <div className="dc-nav">
        <button className="dc-nav-btn" onClick={goPrev} aria-label="이전">
          <ChevronLeft size={20} />
        </button>
        <div className="dc-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              className={`dc-dot ${i === activeIndex ? 'dc-dot-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={slide.title}
              style={{
                ['--dot-accent' as string]: slide.accent,
              }}
            />
          ))}
        </div>
        <button className="dc-nav-btn" onClick={goNext} aria-label="다음">
          <ChevronRight size={20} />
        </button>
      </div>
      */}

      {/* Styles */}
      <style>{`
        .dashboard-carousel-section {
          padding: clamp(48px, 8vw, 100px) 0 clamp(40px, 6vw, 80px);
          overflow: hidden;
          position: relative;
        }
        .dc-header {
          text-align: center;
          margin-bottom: 20px;
          padding: 0 24px;
        }
        .dc-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #3b82f6;
          margin: 0 0 8px;
        }
        .dc-title {
          font-size: clamp(24px, 4vw, 40px);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
        }
        .dc-subtitle {
          font-size: clamp(13px, 1.6vw, 16px);
          color: #94a3b8;
          margin: 0;
        }

        .dc-tabs {
          display: flex;
          justify-content: center;
          gap: clamp(16px, 3vw, 40px);
          padding: 0 24px;
          margin-bottom: clamp(20px, 3vw, 36px);
        }
        .dc-tab {
          background: none;
          border: none;
          padding: 8px 0;
          font-size: clamp(12px, 1.4vw, 15px);
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          position: relative;
          transition: color 0.3s ease;
          white-space: nowrap;
          font-family: inherit;
        }
        .dc-tab:hover { color: #94a3b8; }
        .dc-tab-active { color: var(--tab-accent, #3b82f6); font-weight: 600; }
        .dc-tab-active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--tab-accent, #3b82f6);
          border-radius: 1px;
        }

        .dc-carousel-wrap {
          position: relative;
          cursor: grab;
          touch-action: pan-y;
          padding: 20px 0;
        }
        .dc-carousel-wrap:active { cursor: grabbing; }
        .dc-track {
          display: flex;
          gap: 3vw;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .dc-slide {
          flex-shrink: 0;
          width: 60vw;
          cursor: pointer;
          transition: filter 0.4s ease;
        }
        .dc-slide:not(.dc-slide-active) {
          filter: brightness(0.6) saturate(0.7);
        }
        .dc-slide-active {
          filter: brightness(1) saturate(1);
        }

        .dc-video-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          transition: box-shadow 0.3s ease;
        }
        .dc-slide-active .dc-video-frame {
          box-shadow: 0 12px 48px rgba(0,0,0,0.4);
        }
        .dc-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .dc-play-badge {
          position: absolute;
          bottom: 12px; left: 12px;
          display: flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          color: #86efac;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          pointer-events: none;
        }
        .dc-paused-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
        }

        .dc-nav {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-top: 24px;
        }
        .dc-nav-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #94a3b8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dc-nav-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.2);
        }

        .dc-dots { display: flex; gap: 6px; }
        .dc-dot {
          width: 8px; height: 8px;
          border-radius: 999px; border: none;
          background: rgba(255,255,255,0.15);
          cursor: pointer;
          transition: all 0.3s ease; padding: 0;
        }
        .dc-dot-active {
          width: 28px;
          background: var(--dot-accent, #3b82f6);
        }

        @media (max-width: 768px) {
          .dc-tabs {
            gap: 12px;
            overflow-x: auto;
            justify-content: flex-start;
            padding: 0 20px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .dc-tabs::-webkit-scrollbar { display: none; }
          .dc-slide { width: 82vw; }
          .dc-track {
            gap: 4vw;
            transform: translateX(calc(50% - 41vw - ${activeIndex * 86}vw)) !important;
          }
        }
      `}</style>
    </section>
  );
};
