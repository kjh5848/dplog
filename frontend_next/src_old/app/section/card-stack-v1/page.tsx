"use client";

import React, { useRef, useEffect } from "react";

/* ─── Card Stack Effect ─── */
const CARDS = [
  { title: "실시간 순위 분석", desc: "네이버 플레이스 순위를 실시간 추적합니다", color: "#3b82f6", icon: "📊" },
  { title: "AI 키워드 추천", desc: "AI가 최적의 검색 키워드를 분석합니다", color: "#06b6d4", icon: "🔍" },
  { title: "경쟁 업체 분석", desc: "주변 경쟁 매장의 전략을 파악합니다", color: "#8b5cf6", icon: "🌐" },
  { title: "주간 미션 가이드", desc: "매주 실행 가능한 최적화 미션을 제공합니다", color: "#10b981", icon: "📅" },
  { title: "알림 & 리포트", desc: "순위 변동과 리뷰를 실시간으로 알립니다", color: "#f59e0b", icon: "🔔" },
];

export default function CardStackV1Page() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const sectionRect = section.getBoundingClientRect();
      const sectionTop = -sectionRect.top;
      const cardHeight = window.innerHeight * 0.6;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const cardStart = i * cardHeight * 0.7;
        const progress = Math.max(0, Math.min(1, (sectionTop - cardStart) / cardHeight));

        // Card stacks: transforms
        const translateY = Math.max(0, (1 - progress) * 100);
        const scale = 1 - Math.max(0, progress - 0.5) * 0.1;
        const opacity = progress > 0.8 ? 1 - (progress - 0.8) * 5 : 1;

        card.style.transform = `translateY(${translateY}vh) scale(${scale})`;
        card.style.opacity = `${Math.max(0, opacity)}`;
        card.style.zIndex = `${CARDS.length - i}`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#3b82f6", marginBottom: 8 }}>
          SECTION TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          카드 스태킹 효과
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          스크롤하면 카드가 한 장씩 쌓이며 이전 카드는 뒤로 밀려납니다
        </p>
      </div>

      <div ref={sectionRef} style={{ minHeight: `${CARDS.length * 70 + 100}vh`, position: "relative" }}>
        {CARDS.map((card, i) => (
          <div
            key={card.title}
            ref={el => { cardsRef.current[i] = el; }}
            style={{
              position: "sticky",
              top: "15vh",
              maxWidth: 800,
              margin: "0 auto",
              padding: "0 24px",
              marginBottom: "5vh",
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.8))`,
              border: `1px solid ${card.color}22`,
              borderRadius: 20,
              padding: "clamp(32px, 5vw, 56px)",
              minHeight: "50vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${card.color}11`,
            }}>
              {/* Accent glow */}
              <div style={{
                position: "absolute", top: -100, right: -100,
                width: 300, height: 300, borderRadius: "50%",
                background: `radial-gradient(circle, ${card.color}15, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{ fontSize: 48, marginBottom: 16, display: "block" }}>{card.icon}</span>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                  color: card.color, marginBottom: 12, textTransform: "uppercase",
                }}>
                  Feature {String(i + 1).padStart(2, "0")}
                </div>
                <h2 style={{
                  fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900,
                  margin: "0 0 12px", letterSpacing: "-0.02em",
                }}>
                  {card.title}
                </h2>
                <p style={{ fontSize: "clamp(14px, 1.8vw, 18px)", color: "#94a3b8", margin: 0, maxWidth: 480 }}>
                  {card.desc}
                </p>
              </div>

              {/* Card number */}
              <div style={{
                position: "absolute", bottom: 24, right: 24,
                fontSize: 72, fontWeight: 900, color: `${card.color}08`,
                lineHeight: 1,
              }}>
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// CSS: position: sticky + top: 15vh
// JS: 스크롤 진행률에 따른 변환

const progress = (scrollTop - cardStart) / cardHeight;
card.style.transform = \`
  translateY(\${(1 - progress) * 100}vh)
  scale(\${1 - Math.max(0, progress - 0.5) * 0.1})
\`;

// 이전 카드는 축소+투명해지며 뒤로 밀림
// 새 카드는 아래에서 올라오며 전면에 배치`}
          </pre>
        </div>
      </div>
    </div>
  );
}
