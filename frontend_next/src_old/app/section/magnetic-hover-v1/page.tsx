"use client";

import React, { useRef, useState } from "react";

/* ─── Magnetic Hover (Tilt) Effect ─── */
const FEATURES = [
  { icon: "📊", title: "실시간 순위", desc: "네이버 플레이스 순위 변동을 실시간으로 추적합니다", color: "#3b82f6" },
  { icon: "🔍", title: "키워드 분석", desc: "AI가 최적의 검색 키워드를 분석하고 제안합니다", color: "#8b5cf6" },
  { icon: "💬", title: "리뷰 모니터링", desc: "새 리뷰를 즉시 감지하고 감정 분석을 수행합니다", color: "#06b6d4" },
  { icon: "📈", title: "성장 리포트", desc: "주간/월간 성과를 시각화된 리포트로 제공합니다", color: "#10b981" },
  { icon: "⚡", title: "경쟁자 비교", desc: "주변 경쟁 매장의 전략과 성과를 비교합니다", color: "#f59e0b" },
  { icon: "🎯", title: "미션 가이드", desc: "매주 실행 가능한 맞춤형 최적화 미션을 제공합니다", color: "#f43f5e" },
];

function MagneticCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
    transition: "transform 0.1s ease-out",
  });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const tiltX = (y - 0.5) * -20; // max 10deg
    const tiltY = (x - 0.5) * 20;
    const scale = 1.03;

    setStyle({
      transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`,
      transition: "transform 0.1s ease-out",
    });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.15 });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.4s ease-out",
    });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        background: "rgba(15,23,42,0.8)",
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "clamp(24px, 3vw, 36px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        willChange: "transform",
      }}
    >
      {/* Glare highlight */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        transition: "opacity 0.2s",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${color}15`, border: `1px solid ${color}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, marginBottom: 16,
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", color: "#f1f5f9" }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
          {desc}
        </p>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: glare.opacity > 0 ? 1 : 0,
        transition: "opacity 0.3s",
      }} />
    </div>
  );
}

export default function MagneticHoverV1Page() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#22d3ee", marginBottom: 8 }}>
          DESIGN DETAIL
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          자석 틸트 효과
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          마우스 위치에 따라 카드가 미세하게 기울어지며, 빛 반사 효과가 따라다닙니다
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>🖱️ 카드 위에서 마우스를 움직여 보세요</p>
      </div>

      <div style={{
        maxWidth: 960, margin: "20px auto", padding: "0 24px 40px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {FEATURES.map(f => (
          <MagneticCard key={f.title} {...f} />
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 마우스 위치 → 기울기 각도 변환
const normX = (mouseX - rect.left) / rect.width; // 0~1
const normY = (mouseY - rect.top) / rect.height;

const tiltX = (normY - 0.5) * -20; // ±10°
const tiltY = (normX - 0.5) * 20;

card.style.transform = \`
  perspective(800px)
  rotateX(\${tiltX}deg)
  rotateY(\${tiltY}deg)
  scale(1.03)
\`;

// 빛 반사: radial-gradient를 마우스 위치에 맞춤
background: radial-gradient(
  circle at \${normX*100}% \${normY*100}%,
  rgba(255,255,255,0.15), transparent
);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
