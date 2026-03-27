"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

/* ─── Canvas Pixel Manipulation ─── */
export default function CanvasPixelV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealRadius, setRevealRadius] = useState(0);
  const [filterMode, setFilterMode] = useState<"grayscale" | "threshold" | "invert" | "sepia">("grayscale");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const originalDataRef = useRef<ImageData | null>(null);

  const applyFilter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Draw original image
    ctx.drawImage(imgRef.current, 0, 0, W, H);
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;

    // Store original
    if (!originalDataRef.current) {
      originalDataRef.current = ctx.getImageData(0, 0, W, H);
    }

    const centerX = W / 2;
    const centerY = H / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const radius = (revealRadius / 100) * maxRadius;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

        if (dist > radius) {
          // Apply filter outside reveal radius
          const r = data[i], g = data[i + 1], b = data[i + 2];

          if (filterMode === "grayscale") {
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            data[i] = data[i + 1] = data[i + 2] = gray;
          } else if (filterMode === "threshold") {
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            const val = gray > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
          } else if (filterMode === "invert") {
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
          } else if (filterMode === "sepia") {
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          }
        }
        // Inside radius: keep original colors (already correct)
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw reveal ring
    if (revealRadius > 0 && revealRadius < 100) {
      ctx.save();
      ctx.strokeStyle = "rgba(59,130,246,0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }, [revealRadius, filterMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/demo-after.png";
    img.onload = () => {
      imgRef.current = img;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      applyFilter();
    };
  }, [applyFilter]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  return (
    <div style={{ background: "#0a0b0f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#8b5cf6", marginBottom: 8 }}>
          CANVAS IMAGE EFFECT
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          픽셀 조작 필터
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 600, marginInline: "auto" }}>
          getImageData()로 픽셀에 직접 접근하여 흑백, 반전, 세피아 등의 필터를 적용하고 중앙에서 컬러가 번지는 효과
        </p>
      </div>

      <div ref={containerRef} style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        aspectRatio: "16/9", position: "relative",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            컬러 리빌 반경: {revealRadius}%
          </label>
          <input type="range" min="0" max="100" value={revealRadius}
            onChange={(e) => setRevealRadius(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#8b5cf6" }} />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginRight: 8 }}>필터:</span>
          {(["grayscale", "threshold", "invert", "sepia"] as const).map(mode => (
            <button key={mode} onClick={() => setFilterMode(mode)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid",
                borderColor: mode === filterMode ? "#8b5cf6" : "rgba(255,255,255,0.1)",
                background: mode === filterMode ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                color: mode === filterMode ? "#a78bfa" : "#94a3b8",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
              {mode === "grayscale" ? "흑백" : mode === "threshold" ? "임계값" : mode === "invert" ? "반전" : "세피아"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 코드</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`const imageData = ctx.getImageData(0, 0, W, H);
const data = imageData.data; // [r,g,b,a, r,g,b,a, ...]

for (let i = 0; i < data.length; i += 4) {
  const gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
  data[i] = data[i+1] = data[i+2] = gray; // 흑백 변환
}

ctx.putImageData(imageData, 0, 0);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
