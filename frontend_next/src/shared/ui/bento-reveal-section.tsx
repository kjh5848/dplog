"use client";

import React, { type ReactNode } from "react";

/* ─── types ─── */
export interface BentoRevealCard {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  href?: string;
  cta?: string;
}

interface BentoRevealSectionProps {
  cards: BentoRevealCard[];
  heading?: ReactNode;
  subheading?: ReactNode;
}

/* ─── component ─── */
export default function BentoRevealSection({
  cards,
  heading = "주요 기능",
  subheading = "D-PLOG가 제공하는 핵심 기능을 확인하세요",
}: BentoRevealSectionProps) {
  return (
    <section className="brs-section">
      {/* Heading */}
      <div className="brs-heading-wrap">
        <h2 className="brs-heading">{heading}</h2>
        {subheading && <p className="brs-subheading">{subheading}</p>}
      </div>

      {/* Bento Grid */}
      <div className="brs-grid">
        {cards.map((card, i) => (
          <div
            key={card.name}
            className={`brs-card brs-card-${i} brs-card-anim`}
            style={{ animationDelay: `${0.1 + i * 0.12}s` }}
          >
            <div className="brs-card-accent" />
            <div className="brs-card-content">
              <div className="brs-card-icon-wrap">
                <card.Icon className="brs-card-icon" />
              </div>
              <h3 className="brs-card-title">{card.name}</h3>
              <p className="brs-card-desc">{card.description}</p>
            </div>
            {card.cta && (
              <a href={card.href || "#"} className="brs-card-cta">
                {card.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .brs-section {
          position: relative;
          padding: clamp(16px, 2vw, 32px) clamp(12px, 3vw, 40px);
          overflow: hidden;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Heading */
        .brs-heading-wrap {
          text-align: center;
          margin-bottom: clamp(16px, 2.5vw, 28px);
          position: relative;
          z-index: 2;
        }
        .brs-heading {
          font-size: clamp(20px, 3.5vw, 36px);
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 0 0 0.3rem 0;
          color: #f1f5f9;
        }
        .brs-subheading {
          font-size: clamp(12px, 1.4vw, 15px);
          color: rgba(148,163,184,0.8);
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* Grid layout */
        .brs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, minmax(0, 1fr));
          gap: 10px;
          max-width: 960px;
          width: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          flex: 1;
          max-height: 65vh;
        }

        /* Card positions — bento layout */
        .brs-card-0 { grid-column: 2 / 3; grid-row: 1 / 4; }
        .brs-card-1 { grid-column: 1 / 2; grid-row: 1 / 3; }
        .brs-card-2 { grid-column: 1 / 2; grid-row: 3 / 4; }
        .brs-card-3 { grid-column: 3 / 4; grid-row: 1 / 2; }
        .brs-card-4 { grid-column: 3 / 4; grid-row: 2 / 4; }

        /* Card entrance animation */
        .brs-card-anim {
          animation: brs-card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes brs-card-in {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Card styling — D-PLOG dark blue theme */
        .brs-card {
          position: relative;
          border-radius: 14px;
          padding: clamp(14px, 1.8vw, 22px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7));
          border: 1px solid rgba(51,65,85,0.5);
          transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .brs-card:hover {
          border-color: rgba(59,130,246,0.5);
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(59,130,246,0.15), 0 0 0 1px rgba(59,130,246,0.2);
        }

        /* Accent gradient stripe at top of card */
        .brs-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .brs-card:hover .brs-card-accent {
          opacity: 1;
        }

        /* Card content */
        .brs-card-content {
          position: relative;
          z-index: 1;
        }
        .brs-card-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.1));
          border: 1px solid rgba(59,130,246,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .brs-card-icon {
          width: 18px;
          height: 18px;
          color: #60a5fa;
        }
        .brs-card-title {
          font-size: clamp(13px, 1.6vw, 17px);
          font-weight: 800;
          color: #e2e8f0;
          margin: 0 0 5px 0;
          letter-spacing: -0.01em;
        }
        .brs-card-desc {
          font-size: clamp(10px, 1.1vw, 12px);
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
        }

        /* CTA link */
        .brs-card-cta {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          font-size: 11px;
          font-weight: 600;
          color: #60a5fa;
          text-decoration: none;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.3s ease, transform 0.3s ease, color 0.3s ease;
        }
        .brs-card:hover .brs-card-cta {
          opacity: 1;
          transform: translateY(0);
        }
        .brs-card-cta:hover {
          color: #93c5fd;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .brs-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
            max-height: unset;
            gap: 8px;
          }
          .brs-card-0,
          .brs-card-1,
          .brs-card-2,
          .brs-card-3,
          .brs-card-4 {
            grid-column: auto;
            grid-row: auto;
          }
        }
      `}</style>
    </section>
  );
}
