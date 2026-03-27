"use client";

import React, { useRef, useEffect } from "react";

/* ─── Scale-down & Reveal ─── */
const SECTIONS = [
  { title: "데이터 수집", desc: "네이버 플레이스, 리뷰, 키워드 데이터를 자동으로 수집합니다", bg: "#0c1222", accent: "#3b82f6" },
  { title: "AI 분석", desc: "수집된 데이터를 AI가 분석하여 인사이트를 도출합니다", bg: "#0c1220", accent: "#8b5cf6" },
  { title: "최적화 제안", desc: "분석 결과를 바탕으로 맞춤형 최적화 전략을 제안합니다", bg: "#0c1218", accent: "#06b6d4" },
  { title: "성과 모니터링", desc: "실행 후 성과를 모니터링하고 지속적으로 개선합니다", bg: "#0c1216", accent: "#10b981" },
];

export default function ScaleRevealV1Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const vh = window.innerHeight;

      sectionsRef.current.forEach((section, _i) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -rect.top / vh));

        // Current section scales down and fades
        const scale = 1 - progress * 0.15;
        const translateZ = -progress * 200;
        const opacity = 1 - progress * 0.5;
        const borderRadius = progress * 24;

        section.style.transform = `perspective(1200px) translateZ(${translateZ}px) scale(${scale})`;
        section.style.opacity = `${opacity}`;
        section.style.borderRadius = `${borderRadius}px`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#f43f5e", marginBottom: 8 }}>
          SECTION TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          축소 노출 전환
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          현재 섹션이 살짝 뒤로 밀려나며 축소되고, 새 섹션이 그 위를 덮으며 나타납니다
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 16 }}>↓ 아래로 스크롤하세요</p>
      </div>

      <div ref={containerRef}>
        {SECTIONS.map((sec, i) => (
          <div
            key={sec.title}
            ref={el => { sectionsRef.current[i] = el; }}
            style={{
              minHeight: "100vh",
              background: sec.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "sticky",
              top: 0,
              overflow: "hidden",
              transformOrigin: "center top",
              zIndex: i + 1,
              borderTop: `1px solid ${sec.accent}22`,
            }}
          >
            <div style={{ textAlign: "center", padding: "40px 24px", maxWidth: 640 }}>
              {/* Step indicator */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "6px 16px", borderRadius: 999,
                background: `${sec.accent}12`, border: `1px solid ${sec.accent}33`,
                marginBottom: 24,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: sec.accent, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff",
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: sec.accent }}>STEP {String(i + 1).padStart(2, "0")}</span>
              </div>

              <h2 style={{
                fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900,
                margin: "0 0 16px", letterSpacing: "-0.03em",
                background: `linear-gradient(135deg, #fff, ${sec.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {sec.title}
              </h2>
              <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#94a3b8", margin: 0, lineHeight: 1.7 }}>
                {sec.desc}
              </p>

              {/* Decorative ring */}
              <div style={{
                position: "absolute", right: "10%", bottom: "15%",
                width: 200, height: 200, borderRadius: "50%",
                border: `2px solid ${sec.accent}15`,
                pointerEvents: "none",
              }}>
                <div style={{
                  position: "absolute", inset: 20,
                  borderRadius: "50%",
                  border: `1px solid ${sec.accent}10`,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// position: sticky + z-index 순서로 자연스러운 겹침
section.style.transform = \`
  perspective(1200px)
  translateZ(\${-progress * 200}px)  // 뒤로 밀림
  scale(\${1 - progress * 0.15})      // 축소
\`;
section.style.opacity = 1 - progress * 0.5;
section.style.borderRadius = progress * 24 + "px";`}
          </pre>
        </div>
      </div>
    </div>
  );
}
