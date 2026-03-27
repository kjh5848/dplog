"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

/* ─── Canvas Pixelation ─── */
export default function CanvasPixelateV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixelSize, setPixelSize] = useState(40);
  const [autoAnimate, setAutoAnimate] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animRef = useRef<number>(0);

  const drawPixelated = useCallback((size: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const px = Math.max(1, Math.round(size));

    // Step 1: Draw image at reduced size
    const smallW = Math.ceil(W / px);
    const smallH = Math.ceil(H / px);

    // Create offscreen canvas for downscaling
    const offscreen = document.createElement("canvas");
    offscreen.width = smallW;
    offscreen.height = smallH;
    const octx = offscreen.getContext("2d")!;

    // Disable smoothing for pixelated look
    octx.imageSmoothingEnabled = false;
    octx.drawImage(imgRef.current, 0, 0, smallW, smallH);

    // Step 2: Draw back to main canvas at full size with no smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, W, H);

    // Step 3: If nearly resolved, draw the original crisp
    if (px <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(imgRef.current, 0, 0, W, H);
    }

    // Grid lines for visible pixels
    if (px > 4) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += px) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += px) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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
      drawPixelated(pixelSize);
    };
  }, [drawPixelated, pixelSize]);

  useEffect(() => {
    drawPixelated(pixelSize);
  }, [pixelSize, drawPixelated]);

  // Auto-animation
  useEffect(() => {
    if (!autoAnimate) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    let currentPx = 60;
    const targetPx = 1;
    const start = performance.now();
    const duration = 3000;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      currentPx = 60 - (60 - targetPx) * eased;
      setPixelSize(Math.round(currentPx));
      drawPixelated(currentPx);

      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setAutoAnimate(false);
      }
    };

    animRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animRef.current);
  }, [autoAnimate, drawPixelated]);

  const handleAutoPlay = () => {
    setPixelSize(60);
    setAutoAnimate(true);
  };

  return (
    <div style={{ background: "#0a0b0f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#f59e0b", marginBottom: 8 }}>
          CANVAS IMAGE EFFECT
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          픽셀레이션 트랜지션
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 600, marginInline: "auto" }}>
          해상도를 강제로 낮춰 모자이크 상태에서 점점 선명해지는 효과 — imageSmoothingEnabled로 제어
        </p>
      </div>

      <div ref={containerRef} style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        aspectRatio: "16/9", position: "relative",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
        <div style={{
          position: "absolute", top: 16, right: 16,
          padding: "6px 14px", borderRadius: 8,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          fontSize: 12, fontWeight: 600, color: "#f59e0b",
        }}>
          {pixelSize <= 1 ? "원본 해상도" : `${pixelSize}px 블록`}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            픽셀 크기: {pixelSize}px {pixelSize <= 1 && "✨ 선명!"}
          </label>
          <input type="range" min="1" max="60" value={pixelSize}
            onChange={(e) => setPixelSize(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#f59e0b" }} />
        </div>

        <button onClick={handleAutoPlay}
          style={{
            alignSelf: "flex-start", padding: "10px 24px", borderRadius: 10,
            border: "1px solid rgba(245,158,11,0.3)",
            background: "rgba(245,158,11,0.1)", color: "#fbbf24",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s",
          }}>
          ▶️ 자동 전환 재생
        </button>
      </div>


      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 코드</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 1. 작은 캔버스에 이미지 축소
const smallW = Math.ceil(W / pixelSize);
offCtx.drawImage(image, 0, 0, smallW, smallH);

// 2. 큰 캔버스에 확대 (스무딩 OFF)
ctx.imageSmoothingEnabled = false;
ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, W, H);

// pixelSize를 60→1로 서서히 줄이면 모자이크→선명 전환!`}
          </pre>
        </div>
      </div>
    </div>
  );
}
