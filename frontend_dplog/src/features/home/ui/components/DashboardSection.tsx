'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── Slide Data ─── */
interface DashboardSlide {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  accent: string; // gradient color
}

const slides: DashboardSlide[] = [
  {
    id: 'store',
    title: '내 가게 확인',
    description: '대표메뉴, 리뷰수, 평점, 키워드를 한 화면에서 확인합니다',
    imageSrc: '/landing/dashboard/my-store.png',
    accent: '#3b82f6',
  },
  {
    id: 'keywords',
    title: '황금 키워드 발굴',
    description: '지역·업종·검색량을 조합해 실행할 키워드를 추천합니다',
    imageSrc: '/landing/dashboard/keywords.png',
    accent: '#f97316',
  },
  {
    id: 'ranking',
    title: '실시간 조회',
    description: '키워드를 입력하면 현재 네이버 플레이스 노출 순위를 바로 확인합니다',
    imageSrc: '/landing/dashboard/ranking.png',
    accent: '#06b6d4',
  },
  {
    id: 'tracking',
    title: '순위 추적',
    description: '등록 키워드의 순위 변화를 차트로 추적합니다',
    imageSrc: '/landing/dashboard/tracking.png',
    accent: '#8b5cf6',
  },
];

/* ─── Component ─── */
export const DashboardSection = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Start on keywords (center)
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

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
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = e.clientX - startX;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (Math.abs(diff) > 38) {
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

  // slide=72vw, gap=3vw, stride=75vw, half=36vw
  const SLIDE_VW = 72;
  const GAP_VW = 3;
  const STRIDE_VW = SLIDE_VW + GAP_VW; // 75
  const HALF_VW = SLIDE_VW / 2; // 36

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
      <div className="dc-tabs" role="tablist" aria-label="대시보드 기능 선택">
        {slides.map((slide, i) => (
          <button
            type="button"
            key={slide.id}
            className={`dc-tab ${i === activeIndex ? 'dc-tab-active' : ''}`}
            onClick={() => goTo(i)}
            style={{ ['--tab-accent' as string]: slide.accent }}
            role="tab"
            aria-selected={i === activeIndex}
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
                {/* Product Screenshot Frame */}
                <div className="dc-video-frame">
                  <img
                    src={slide.imageSrc}
                    alt={`${slide.title} 화면 예시`}
                    className="dc-video dc-image"
                    loading={i === activeIndex ? 'eager' : 'lazy'}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
        <button
          type="button"
          className="dc-side-btn dc-side-prev"
          onClick={goPrev}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="이전 대시보드 화면"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="dc-side-btn dc-side-next"
          onClick={goNext}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="다음 대시보드 화면"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="dc-nav">
        <div className="dc-dots">
          {slides.map((slide, i) => (
            <button
              type="button"
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
      </div>

      {/* Styles */}
      <style>{`
        .dashboard-carousel-section {
          padding: clamp(48px, 8vw, 100px) 0 clamp(0px, 1.6vw, 18px);
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
        .dc-side-btn {
          position: absolute;
          top: 50%;
          z-index: 5;
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(148,163,184,0.24);
          background: rgba(255,255,255,0.82);
          color: #1e3a8a;
          box-shadow: 0 12px 28px rgba(15,23,42,0.12);
          backdrop-filter: blur(12px);
          transform: translateY(-50%);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .dc-side-btn:hover {
          background: rgba(255,255,255,0.94);
          box-shadow: 0 16px 34px rgba(15,23,42,0.14);
        }
        .dc-side-btn:active {
          transform: translateY(-50%) scale(0.96);
        }
        .dc-side-prev {
          left: max(18px, 8vw);
        }
        .dc-side-next {
          right: max(18px, 8vw);
        }
        .dc-track {
          display: flex;
          gap: 3vw;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        .dc-slide {
          position: relative;
          flex-shrink: 0;
          width: 72vw;
          cursor: pointer;
          transition: filter 0.4s ease;
        }
        .dc-slide::after {
          content: '';
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: -34px;
          height: 86px;
          border-radius: 999px;
          background:
            radial-gradient(ellipse at center, rgba(37,99,235,0.14) 0%, rgba(37,99,235,0.06) 38%, transparent 72%);
          filter: blur(18px);
          opacity: 0.38;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .dc-slide:not(.dc-slide-active) {
          filter: brightness(0.88) saturate(0.92);
        }
        .dc-slide-active {
          filter: brightness(1) saturate(1);
        }
        .dc-slide-active::after {
          opacity: 0.64;
          transform: translateY(-4px);
        }

        .dc-video-frame {
          position: relative;
          z-index: 1;
          width: 100%;
          aspect-ratio: 3 / 2;
          border-radius: 16px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,0.24);
          box-shadow:
            0 12px 28px -24px rgba(37,99,235,0.28),
            0 4px 12px -10px rgba(15,23,42,0.18),
            0 1px 0 rgba(255,255,255,0.92) inset;
          transition: box-shadow 0.3s ease;
        }
        .dc-slide-active .dc-video-frame {
          box-shadow:
            0 16px 36px -28px rgba(37,99,235,0.32),
            0 6px 16px -12px rgba(15,23,42,0.18),
            0 1px 0 rgba(255,255,255,0.95) inset;
        }
        .dc-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .dc-image {
          object-position: top center;
          background: #f8fafc;
        }

        .dc-paused-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.25);
          pointer-events: none;
        }

        .dc-nav {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; margin-top: 8px;
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

        .dc-dots { display: flex; gap: 8px; }
        .dc-dot {
          width: 36px; height: 28px;
          border-radius: 999px; border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease; padding: 0;
          position: relative;
        }
        .dc-dot::after {
          content: '';
          position: absolute;
          left: 8px;
          right: 8px;
          top: 50%;
          height: 6px;
          border-radius: 999px;
          background: rgba(148,163,184,0.35);
          transform: translateY(-50%);
          transition: all 0.3s ease;
        }
        .dc-dot-active::after {
          left: 4px;
          right: 4px;
          width: 28px;
          background: var(--dot-accent, #3b82f6);
        }

        @media (max-width: 1024px) and (min-width: 769px) {
          .dashboard-carousel-section {
            padding-top: clamp(52px, 7vw, 72px);
          }
          .dc-tabs {
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
            padding: 0 32px;
          }
          .dc-tab {
            min-height: 44px;
            border-radius: 999px;
            background: rgba(255,255,255,0.56);
            border: 1px solid rgba(148,163,184,0.24);
            padding: 0 18px;
            box-shadow: 0 6px 18px rgba(15,23,42,0.04);
          }
          .dc-tab-active {
            background: rgba(255,255,255,0.9);
            border-color: color-mix(in srgb, var(--tab-accent, #3b82f6) 46%, transparent);
          }
          .dc-tab-active::after {
            display: none;
          }
          .dc-carousel-wrap {
            padding: 12px 0 18px;
          }
          .dc-slide {
            width: 82vw;
          }
          .dc-track {
            gap: 2.5vw;
            transform: translateX(calc(50% - 41vw - ${activeIndex * 84.5}vw)) !important;
          }
          .dc-video-frame {
            border-radius: 14px;
          }
          .dc-side-prev {
            left: 22px;
          }
          .dc-side-next {
            right: 22px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-carousel-section {
            padding-top: clamp(34px, 10vw, 56px);
          }
          .dc-header {
            margin-bottom: 16px;
            padding: 0 18px;
          }
          .dc-label {
            font-size: 11px;
            margin-bottom: 7px;
          }
          .dc-title {
            font-size: clamp(22px, 7vw, 30px);
            line-height: 1.12;
          }
          .dc-subtitle {
            font-size: 13px;
            line-height: 1.55;
          }
          .dc-tabs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            padding: 0 20px;
            margin-bottom: 18px;
          }
          .dc-tabs::-webkit-scrollbar { display: none; }
          .dc-tab {
            min-width: 0;
            min-height: 44px;
            border-radius: 14px;
            background: rgba(255,255,255,0.58);
            border: 1px solid rgba(148,163,184,0.22);
            padding: 0 10px;
            font-size: 13px;
            font-weight: 700;
            box-shadow: 0 6px 18px rgba(15,23,42,0.035);
          }
          .dc-tab-active {
            background: rgba(255,255,255,0.94);
            border-color: color-mix(in srgb, var(--tab-accent, #3b82f6) 46%, transparent);
          }
          .dc-tab-active::after {
            display: none;
          }
          .dc-carousel-wrap {
            padding: 8px 0 8px;
          }
          .dc-slide { width: 92vw; }
          .dc-track {
            gap: 4vw;
            transform: translateX(calc(50% - 46vw - ${activeIndex * 96}vw)) !important;
          }
          .dc-video-frame {
            border-radius: 14px;
            box-shadow:
              0 12px 28px -24px rgba(37,99,235,0.28),
              0 4px 12px -10px rgba(15,23,42,0.16),
              0 1px 0 rgba(255,255,255,0.92) inset;
          }
          .dc-slide::after {
            left: 9%;
            right: 9%;
            bottom: -22px;
            height: 58px;
            filter: blur(16px);
            opacity: 0.45;
          }
          .dc-slide-active::after {
            opacity: 0.62;
            transform: translateY(-2px);
          }
          .dc-side-btn {
            width: 42px;
            height: 42px;
            border-color: transparent;
            background: transparent;
            color: #2563eb;
            box-shadow: none;
            backdrop-filter: none;
          }
          .dc-side-btn:hover {
            background: transparent;
            box-shadow: none;
          }
          .dc-side-prev {
            left: 14px;
          }
          .dc-side-next {
            right: 14px;
          }
          .dc-nav {
            margin-top: 2px;
          }
          .dc-dots {
            gap: 2px;
          }
          .dc-dot {
            width: 34px;
            height: 30px;
          }
        }
      `}</style>
    </section>
  );
};
