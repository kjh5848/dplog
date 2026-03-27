"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Horizontal Scroll in Vertical Scroll ─── */
const PANELS = [
  { title: "데이터 진단", desc: "매장 현황을 360° 분석합니다", icon: "🔬", color: "#3b82f6" },
  { title: "키워드 매핑", desc: "검색 트렌드와 매장을 매칭합니다", icon: "🗺️", color: "#8b5cf6" },
  { title: "순위 시뮬레이션", desc: "전략 적용 시 예상 순위를 보여줍니다", icon: "📈", color: "#06b6d4" },
  { title: "리뷰 분석", desc: "고객 리뷰에서 핵심 인사이트를 추출합니다", icon: "💬", color: "#10b981" },
  { title: "경쟁자 비교", desc: "주변 경쟁 매장과 객관적으로 비교합니다", icon: "⚡", color: "#f59e0b" },
];

export default function HorizontalScrollV1Page() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / sectionHeight));

      // Horizontal translateX
      const totalWidth = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(${-progress * totalWidth}px)`;

      // Active panel
      const panelIndex = Math.min(PANELS.length - 1, Math.floor(progress * PANELS.length));
      setActiveIndex(panelIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#ec4899", marginBottom: 8 }}>
          SECTION TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          종스크롤 중 횡이동
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          세로로 스크롤하지만 특정 구간에서 화면이 횡으로 이동하며 콘텐츠를 보여줍니다
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 16 }}>↓ 아래로 스크롤하세요</p>
      </div>

      {/* Horizontal scroll section */}
      <div ref={sectionRef} style={{ height: `${PANELS.length * 100 + 100}vh`, position: "relative" }}>
        <div style={{
          position: "sticky", top: 0, height: "100vh",
          overflow: "hidden",
          display: "flex", alignItems: "center",
        }}>
          {/* Progress bar */}
          <div style={{
            position: "absolute", top: 24, left: 24, right: 24,
            height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, zIndex: 10,
          }}>
            <div style={{
              height: "100%",
              width: `${((activeIndex + 1) / PANELS.length) * 100}%`,
              background: PANELS[activeIndex].color,
              borderRadius: 2,
              transition: "width 0.3s ease, background-color 0.3s ease",
              boxShadow: `0 0 12px ${PANELS[activeIndex].color}66`,
            }} />
          </div>

          {/* Counter */}
          <div style={{
            position: "absolute", top: 40, right: 24, zIndex: 10,
            fontSize: 12, fontWeight: 600, color: "#6b7280",
          }}>
            <span style={{ color: PANELS[activeIndex].color, fontSize: 16, fontWeight: 800 }}>
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span style={{ margin: "0 4px" }}>/</span>
            <span>{String(PANELS.length).padStart(2, "0")}</span>
          </div>

          {/* Horizontal track */}
          <div ref={trackRef} style={{
            display: "flex",
            gap: 0,
            willChange: "transform",
            transition: "transform 0.1s linear",
          }}>
            {PANELS.map((panel, i) => (
              <div key={panel.title} style={{
                minWidth: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 40px",
                position: "relative",
              }}>
                <div style={{
                  maxWidth: 600,
                  textAlign: "center",
                  opacity: i === activeIndex ? 1 : 0.4,
                  transform: i === activeIndex ? "scale(1)" : "scale(0.92)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}>
                  {/* Large icon */}
                  <div style={{
                    fontSize: 64,
                    marginBottom: 24,
                    filter: `drop-shadow(0 0 20px ${panel.color}44)`,
                  }}>
                    {panel.icon}
                  </div>

                  {/* Badge */}
                  <div style={{
                    display: "inline-flex", padding: "4px 12px", borderRadius: 999,
                    background: `${panel.color}15`, border: `1px solid ${panel.color}33`,
                    fontSize: 11, fontWeight: 700, color: panel.color,
                    letterSpacing: "0.1em", marginBottom: 20,
                  }}>
                    STEP {String(i + 1).padStart(2, "0")}
                  </div>

                  <h2 style={{
                    fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900,
                    margin: "0 0 12px", letterSpacing: "-0.02em",
                  }}>
                    {panel.title}
                  </h2>
                  <p style={{ fontSize: 16, color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>
                    {panel.desc}
                  </p>
                </div>

                {/* Background accent */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `radial-gradient(circle at 50% 50%, ${panel.color}06, transparent 70%)`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 세로 스크롤을 가로 이동으로 변환
const sectionHeight = section.offsetHeight - window.innerHeight;
const progress = -rect.top / sectionHeight; // 0→1

const totalWidth = track.scrollWidth - window.innerWidth;
track.style.transform = \`translateX(\${-progress * totalWidth}px)\`;

// 섹션 높이를 패널 수 × 100vh + 여유로 설정
// sticky 포지셔닝으로 뷰포트에 고정`}
          </pre>
        </div>
      </div>
    </div>
  );
}
