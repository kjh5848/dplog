"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Diagonal Staggered Reveal ─── */
export default function DiagonalRevealV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [sliceCount, setSliceCount] = useState(5);
  const [direction, setDirection] = useState<"tl" | "tr" | "bl" | "br">("tl");
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
        ctx.clearRect(0, 0, W, H);

        // Background: after image with slight blur
        ctx.save();
        ctx.filter = `blur(${(1 - progress) * 4}px)`;
        ctx.drawImage(afterImg, 0, 0, W, H);
        ctx.filter = "none";
        ctx.restore();

        // Diagonal slices of before image
        const diagW = (W + H) / sliceCount;

        for (let i = sliceCount - 1; i >= 0; i--) {
          const delay = i * 0.08;
          const sliceP = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          if (sliceP >= 1) continue; // Fully revealed, skip drawing before

          ctx.save();

          // Create diagonal clip path
          const offset = i * diagW;
          const skew = H * 0.4; // Angle of diagonal

          let x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number;

          if (direction === "tl") {
            x0 = offset - skew; y0 = 0;
            x1 = offset + diagW - skew; y1 = 0;
            x2 = offset + diagW; y2 = H;
            x3 = offset; y3 = H;
          } else if (direction === "tr") {
            x0 = W - offset; y0 = 0;
            x1 = W - offset - diagW; y1 = 0;
            x2 = W - offset - diagW + skew; y2 = H;
            x3 = W - offset + skew; y3 = H;
          } else if (direction === "bl") {
            x0 = offset; y0 = 0;
            x1 = offset + diagW; y1 = 0;
            x2 = offset + diagW - skew; y2 = H;
            x3 = offset - skew; y3 = H;
          } else {
            x0 = W - offset + skew; y0 = 0;
            x1 = W - offset - diagW + skew; y1 = 0;
            x2 = W - offset - diagW; y2 = H;
            x3 = W - offset; y3 = H;
          }

          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x3, y3);
          ctx.closePath();
          ctx.clip();

          // Animate: translate + scale + opacity
          const translateY = sliceP * H * 0.6;
          const translateX = sliceP * 80 * (direction.includes("l") ? -1 : 1);
          const scale = 1 + sliceP * 0.08;
          const alpha = 1 - sliceP;

          ctx.globalAlpha = alpha;
          ctx.translate(W / 2 + translateX, H / 2 - translateY);
          ctx.scale(scale, scale);
          ctx.translate(-W / 2, -H / 2);

          // Apply blur based on slice progress
          ctx.filter = `blur(${sliceP * 6}px)`;
          ctx.drawImage(beforeImg, 0, 0, W, H);
          ctx.filter = "none";

          ctx.restore();
        }

        // Subtle diagonal guide lines
        if (progress > 0 && progress < 1) {
          ctx.save();
          ctx.globalAlpha = 0.08;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 1;
          for (let i = 0; i <= sliceCount; i++) {
            const offset = i * diagW;
            ctx.beginPath();
            if (direction === "tl" || direction === "bl") {
              const skew = direction === "tl" ? H * 0.4 : -H * 0.4;
              ctx.moveTo(offset - (direction === "tl" ? skew : -skew), 0);
              ctx.lineTo(offset - (direction === "tl" ? 0 : 0), H);
            } else {
              ctx.moveTo(W - offset, 0);
              ctx.lineTo(W - offset + H * 0.3, H);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;

    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, sliceCount, direction]);

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#f97316", marginBottom: 8 }}>
          HIGHEND IMAGE TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          대각선 시차 노출
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          사선으로 구역을 나누고, 각 조각이 확대+블러+시간차를 두고 사라지며 다음 이미지가 드러납니다
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
            style={{ width: "100%", accentColor: "#f97316" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>분할:</span>
          {[3, 5, 7, 9].map(n => (
            <button key={n} onClick={() => setSliceCount(n)} style={{
              padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${n === sliceCount ? "#f97316" : "rgba(255,255,255,0.1)"}`,
              background: n === sliceCount ? "rgba(249,115,22,0.12)" : "transparent",
              color: n === sliceCount ? "#fb923c" : "#6b7280",
            }}>{n}단</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>방향:</span>
          {([["tl","↖ 좌상"],["tr","↗ 우상"],["bl","↙ 좌하"],["br","↘ 우하"]] as const).map(([d, label]) => (
            <button key={d} onClick={() => setDirection(d)} style={{
              padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${d === direction ? "#f97316" : "rgba(255,255,255,0.1)"}`,
              background: d === direction ? "rgba(249,115,22,0.12)" : "transparent",
              color: d === direction ? "#fb923c" : "#6b7280",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 대각선 클리핑 경로 생성
ctx.beginPath();
ctx.moveTo(offset - skew, 0);     // 상단: skew만큼 앞으로
ctx.lineTo(offset + diagW - skew, 0);
ctx.lineTo(offset + diagW, H);     // 하단: 정위치
ctx.lineTo(offset, H);
ctx.closePath();
ctx.clip();

// 각 조각에 독립적 변환 적용
ctx.globalAlpha = 1 - sliceProgress;
ctx.filter = \`blur(\${sliceProgress * 6}px)\`;
ctx.scale(1 + sliceProgress * 0.08);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
