"use client";

import React, { useRef, useEffect } from "react";

/* ─── Velocity-Based Blur ─── */
export default function VelocityBlurV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const blurRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/demo-after.png";

    const labelEl = document.getElementById("velocity-label");
    const barEl = document.getElementById("velocity-bar");

    let lastTime = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollRef.current);
      const instantVelocity = (delta / dt) * 16; // Normalize to ~60fps
      velocityRef.current = velocityRef.current * 0.7 + instantVelocity * 0.3; // Smooth
      lastScrollRef.current = scrollY;
      lastTime = now;
    };

    img.onload = () => {
      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;

        // Decay velocity when not scrolling
        velocityRef.current *= 0.95;

        // Map velocity to blur
        const targetBlur = Math.min(20, velocityRef.current * 0.8);
        blurRef.current += (targetBlur - blurRef.current) * 0.15;
        const blur = blurRef.current;

        // Map velocity to saturation
        const saturation = Math.max(0.3, 1 - blur / 25);

        // Map velocity to brightness
        const brightness = 1 + blur * 0.01;

        ctx.clearRect(0, 0, W, H);

        // Draw with velocity-dependent filter
        ctx.save();
        ctx.filter = `blur(${blur}px) saturate(${saturation}) brightness(${brightness})`;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.filter = "none";
        ctx.restore();

        // Motion streak effect when fast
        if (blur > 2) {
          ctx.save();
          ctx.globalAlpha = Math.min(0.3, blur * 0.02);
          // Vertical motion lines
          const lineCount = Math.floor(blur * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 1;
          for (let i = 0; i < lineCount; i++) {
            const x = Math.random() * W;
            const len = blur * 8 + Math.random() * 40;
            ctx.beginPath();
            ctx.moveTo(x, Math.random() * H);
            ctx.lineTo(x + (Math.random() - 0.5) * 4, Math.random() * H + len);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Chromatic aberration when fast
        if (blur > 4) {
          const abOffset = blur * 0.3;
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = blur * 0.008;
          // Red channel shift
          ctx.drawImage(canvas, -abOffset, 0);
          // Blue channel shift
          ctx.drawImage(canvas, abOffset, 0);
          ctx.restore();
        }

        // Speed overlay
        ctx.save();
        ctx.fillStyle = `rgba(5,5,8,${blur * 0.015})`;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // HUD info
        ctx.save();
        ctx.font = "bold 12px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";

        // Blur indicator
        ctx.fillStyle = blur > 5 ? "rgba(239,68,68,0.8)" : blur > 1 ? "rgba(251,191,36,0.8)" : "rgba(52,211,153,0.8)";
        ctx.fillText(`blur: ${blur.toFixed(1)}px`, 16, 28);

        ctx.fillStyle = "rgba(148,163,184,0.6)";
        ctx.fillText(`velocity: ${velocityRef.current.toFixed(1)}`, 16, 46);
        ctx.fillText(blur < 1 ? "🟢 SHARP" : blur < 5 ? "🟡 MOTION" : "🔴 FAST", 16, 64);
        ctx.restore();

        // Update DOM indicators
        if (labelEl) {
          labelEl.textContent = blur < 1 ? "선명 — 스크롤 멈춤" : blur < 5 ? "미세 블러 — 천천히 스크롤 중" : "강한 블러 — 빠르게 스크롤 중";
          labelEl.style.color = blur < 1 ? "#34d399" : blur < 5 ? "#fbbf24" : "#ef4444";
        }
        if (barEl) {
          barEl.style.width = `${Math.min(100, blur * 5)}%`;
          barEl.style.background = blur < 1 ? "#34d399" : blur < 5 ? "#fbbf24" : "#ef4444";
        }

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div style={{ background: "#050508", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#ef4444", marginBottom: 8 }}>
          DESIGN DETAIL
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          속도 기반 블러
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          스크롤 속도에 비례하여 블러가 강해지고, 멈추면 선명하게 복원됩니다
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12 }}>↕ 빠르게/느리게 스크롤해 보세요</p>
      </div>

      <div style={{ height: "400vh", position: "relative" }}>
        <div ref={containerRef} style={{
          position: "sticky", top: "10vh",
          maxWidth: 900, margin: "0 auto", padding: "0 24px",
          aspectRatio: "16/9",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />

          {/* Speed indicator */}
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            padding: "8px 20px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div id="velocity-bar" style={{
                height: "100%", width: "0%", borderRadius: 2,
                transition: "width 0.1s, background 0.3s",
              }} />
            </div>
            <span id="velocity-label" style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", transition: "color 0.3s" }}>
              선명 — 스크롤 멈춤
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 스크롤 속도 측정
const delta = |scrollY - prevScrollY|;
const velocity = velocity * 0.7 + instantVelocity * 0.3;

// 속도→블러 매핑
const blur = Math.min(20, velocity * 0.8);
ctx.filter = \`blur(\${blur}px) saturate(\${1 - blur/25})\`;

// 고속 시 모션 라인 + 색수차(Chromatic Aberration)
ctx.globalCompositeOperation = "screen";
ctx.drawImage(canvas, -offset, 0); // Red 채널 쉬프트
ctx.drawImage(canvas, +offset, 0); // Blue 채널 쉬프트`}
          </pre>
        </div>
      </div>
    </div>
  );
}
