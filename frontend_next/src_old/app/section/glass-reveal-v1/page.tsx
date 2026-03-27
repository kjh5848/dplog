"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Glassmorphism Reveal ─── */
export default function GlassRevealV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [glassWidth, setGlassWidth] = useState(60);
  const [autoPlay, setAutoPlay] = useState(false);
  const rafRef = useRef<number>(0);

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

    const beforeImg = new Image();
    const afterImg = new Image();
    beforeImg.crossOrigin = "anonymous";
    afterImg.crossOrigin = "anonymous";
    beforeImg.src = "/images/demo-before.png";
    afterImg.src = "/images/demo-after.png";

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;

      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        const boundary = progress * (W + glassWidth * 2) - glassWidth;

        ctx.clearRect(0, 0, W, H);

        // Before image (right of boundary)
        ctx.save();
        ctx.beginPath();
        ctx.rect(boundary + glassWidth, 0, W - boundary - glassWidth, H);
        ctx.clip();
        ctx.drawImage(beforeImg, 0, 0, W, H);
        ctx.restore();

        // After image (left of boundary)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, boundary, H);
        ctx.clip();
        ctx.drawImage(afterImg, 0, 0, W, H);
        ctx.restore();

        // Glass strip (frosted glass effect)
        if (boundary > -glassWidth && boundary < W) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(boundary, 0, glassWidth, H);
          ctx.clip();

          // Blurred base
          ctx.filter = "blur(16px) brightness(1.2) saturate(0.6)";
          ctx.drawImage(afterImg, 0, 0, W, H);
          ctx.filter = "none";

          // White frosted overlay
          const grad = ctx.createLinearGradient(boundary, 0, boundary + glassWidth, 0);
          grad.addColorStop(0, "rgba(255,255,255,0.15)");
          grad.addColorStop(0.3, "rgba(255,255,255,0.08)");
          grad.addColorStop(0.7, "rgba(255,255,255,0.12)");
          grad.addColorStop(1, "rgba(255,255,255,0.05)");
          ctx.fillStyle = grad;
          ctx.fillRect(boundary, 0, glassWidth, H);

          // Glass edge highlights
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(boundary, 0);
          ctx.lineTo(boundary, H);
          ctx.stroke();

          ctx.strokeStyle = "rgba(255,255,255,0.15)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(boundary + glassWidth, 0);
          ctx.lineTo(boundary + glassWidth, H);
          ctx.stroke();

          // Prismatic color refraction
          const prismGrad = ctx.createLinearGradient(boundary, 0, boundary + glassWidth, 0);
          prismGrad.addColorStop(0, "rgba(59,130,246,0.08)");
          prismGrad.addColorStop(0.3, "rgba(168,85,247,0.06)");
          prismGrad.addColorStop(0.6, "rgba(236,72,153,0.06)");
          prismGrad.addColorStop(1, "rgba(6,182,212,0.08)");
          ctx.fillStyle = prismGrad;
          ctx.fillRect(boundary, 0, glassWidth, H);

          // Subtle noise texture (stipple pattern)
          ctx.globalAlpha = 0.04;
          for (let x = boundary; x < boundary + glassWidth; x += 3) {
            for (let y = 0; y < H; y += 3) {
              if (Math.random() > 0.5) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(x, y, 1, 1);
              }
            }
          }
          ctx.globalAlpha = 1;

          ctx.restore();
        }

        // Light streak following glass
        if (boundary > 0 && boundary < W) {
          ctx.save();
          const streakGrad = ctx.createLinearGradient(boundary - 30, 0, boundary + 10, 0);
          streakGrad.addColorStop(0, "rgba(255,255,255,0)");
          streakGrad.addColorStop(0.5, "rgba(255,255,255,0.06)");
          streakGrad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = streakGrad;
          ctx.fillRect(boundary - 30, 0, 40, H);
          ctx.restore();
        }

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;

    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, glassWidth]);

  // Auto play
  useEffect(() => {
    if (!autoPlay) return;
    let p = 0;
    const start = performance.now();
    const duration = 2500;
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      p = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // ease-in-out cubic
      setProgress(p);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setAutoPlay(false);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoPlay]);

  const handlePlay = () => {
    setProgress(0);
    setAutoPlay(true);
  };

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#e879f9", marginBottom: 8 }}>
          DESIGN DETAIL
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          유리 마스킹 리빌
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          반투명 유리 조각이 스르릉 지나가며 그 뒤로 새로운 이미지가 드러납니다
        </p>
      </div>

      <div ref={containerRef} style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", aspectRatio: "16/9" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            전환 진행률: {Math.round(progress * 100)}%
          </label>
          <input type="range" min="0" max="100" value={progress * 100}
            onChange={(e) => setProgress(Number(e.target.value) / 100)}
            style={{ width: "100%", accentColor: "#e879f9" }} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginRight: 8 }}>유리 폭:</label>
            {[30, 60, 100, 160].map(w => (
              <button key={w} onClick={() => setGlassWidth(w)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6,
                border: `1px solid ${w === glassWidth ? "#e879f9" : "rgba(255,255,255,0.1)"}`,
                background: w === glassWidth ? "rgba(232,121,249,0.12)" : "transparent",
                color: w === glassWidth ? "#f0abfc" : "#6b7280",
              }}>{w}px</button>
            ))}
          </div>
          <button onClick={handlePlay} style={{
            padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: "1px solid rgba(232,121,249,0.3)",
            background: "rgba(232,121,249,0.1)", color: "#f0abfc",
          }}>▶️ 재생</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 유리 스트립 영역 클리핑
ctx.rect(boundary, 0, glassWidth, H);
ctx.clip();

// 블러된 기본 이미지
ctx.filter = "blur(16px) brightness(1.2)";
ctx.drawImage(afterImg, 0, 0, W, H);

// 반투명 프로스트 오버레이
gradient.addColorStop(0, "rgba(255,255,255,0.15)");

// 프리즘 색 굴절 (유리 질감)
prismGrad.addColorStop(0.3, "rgba(168,85,247,0.06)");

// 에지 하이라이트 (유리 테두리 빛)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
