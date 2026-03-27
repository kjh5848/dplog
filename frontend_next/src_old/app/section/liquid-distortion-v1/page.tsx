"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Liquid Distortion Transition ─── */
export default function LiquidDistortionV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [waveIntensity, setWaveIntensity] = useState(30);
  const [waveFrequency, setWaveFrequency] = useState(3);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

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

    // Create offscreen canvases for pixel-level manipulation
    const offBefore = document.createElement("canvas");
    const offAfter = document.createElement("canvas");

    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;

      const W = canvas.width;
      const H = canvas.height;

      offBefore.width = W;
      offBefore.height = H;
      offAfter.width = W;
      offAfter.height = H;

      const ctxB = offBefore.getContext("2d")!;
      const ctxA = offAfter.getContext("2d")!;
      ctxB.drawImage(beforeImg, 0, 0, W, H);
      ctxA.drawImage(afterImg, 0, 0, W, H);

      const beforeData = ctxB.getImageData(0, 0, W, H);
      const afterData = ctxA.getImageData(0, 0, W, H);

      const draw = () => {
        timeRef.current += 0.02;
        const t = timeRef.current;

        const output = ctx.createImageData(W, H);
        const outData = output.data;
        const bData = beforeData.data;
        const aData = afterData.data;

        // The wave boundary position
        const boundary = progress * W;
        const waveAmp = waveIntensity * (1 - Math.abs(progress - 0.5) * 2); // Strongest at middle

        for (let y = 0; y < H; y++) {
          // Liquid wave distortion at the boundary
          const wave = Math.sin(y / H * Math.PI * waveFrequency + t * 2) * waveAmp +
                       Math.sin(y / H * Math.PI * (waveFrequency * 2.3) + t * 1.5) * waveAmp * 0.3;

          const localBoundary = boundary + wave;

          for (let x = 0; x < W; x++) {
            const i = (y * W + x) * 4;

            // Distort coordinates near the boundary
            const dist = Math.abs(x - localBoundary);
            const distortZone = 60;

            let srcX = x;
            if (dist < distortZone) {
              const factor = 1 - dist / distortZone;
              const ripple = Math.sin(factor * Math.PI * 3 + t * 4) * factor * 12;
              srcX = Math.round(x + ripple);
              srcX = Math.max(0, Math.min(W - 1, srcX));
            }

            const si = (y * W + srcX) * 4;

            if (x < localBoundary) {
              // After image (revealed)
              outData[i] = aData[si];
              outData[i + 1] = aData[si + 1];
              outData[i + 2] = aData[si + 2];
              outData[i + 3] = 255;
            } else {
              // Before image
              outData[i] = bData[si];
              outData[i + 1] = bData[si + 1];
              outData[i + 2] = bData[si + 2];
              outData[i + 3] = 255;
            }

            // Edge glow near boundary
            if (dist < 8) {
              const glow = 1 - dist / 8;
              outData[i] = Math.min(255, outData[i] + 120 * glow);
              outData[i + 1] = Math.min(255, outData[i + 1] + 160 * glow);
              outData[i + 2] = Math.min(255, outData[i + 2] + 255 * glow);
            }
          }
        }

        ctx.putImageData(output, 0, 0);

        // Organic boundary line overlay
        ctx.save();
        ctx.strokeStyle = "rgba(100,200,255,0.3)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(59,130,246,0.5)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let y = 0; y < H; y += 2) {
          const wave = Math.sin(y / H * Math.PI * waveFrequency + t * 2) * waveAmp +
                       Math.sin(y / H * Math.PI * (waveFrequency * 2.3) + t * 1.5) * waveAmp * 0.3;
          const bx = boundary + wave;
          if (y === 0) ctx.moveTo(bx, y);
          else ctx.lineTo(bx, y);
        }
        ctx.stroke();
        ctx.restore();

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;

    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, waveIntensity, waveFrequency]);

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#06b6d4", marginBottom: 8 }}>
          HIGHEND IMAGE TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          액체형 왜곡 전환
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          경계선이 물결처럼 일렁이며 픽셀 단위 왜곡과 함께 다음 이미지로 전환됩니다
        </p>
      </div>

      <div ref={containerRef} style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", aspectRatio: "16/9" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            전환 위치: {Math.round(progress * 100)}%
          </label>
          <input type="range" min="0" max="100" value={progress * 100}
            onChange={(e) => setProgress(Number(e.target.value) / 100)}
            style={{ width: "100%", accentColor: "#06b6d4" }} />
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
              파형 강도: {waveIntensity}
            </label>
            <input type="range" min="5" max="80" value={waveIntensity}
              onChange={(e) => setWaveIntensity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#06b6d4" }} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 6 }}>
              파형 주파수: {waveFrequency}
            </label>
            <input type="range" min="1" max="8" value={waveFrequency}
              onChange={(e) => setWaveFrequency(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#06b6d4" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 물결 경계선 계산
const wave = Math.sin(y/H * π * freq + time) * amplitude;
const boundary = progress * W + wave;

// 경계 부근 픽셀 왜곡 (ripple)
if (dist < distortZone) {
  const ripple = Math.sin(factor * π * 3 + time) * factor * 12;
  srcX = x + ripple; // 소스 좌표 왜곡
}

// 경계 발광 효과 (Edge Glow)
if (dist < 8) outData[i+2] += 255 * (1 - dist/8);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
