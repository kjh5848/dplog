"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Canvas Slice Transition ─── */
export default function CanvasSliceV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliceCount, setSliceCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [staggerMode, setStaggerMode] = useState<"center" | "left" | "right">("center");

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const beforeImg = new Image();
    const afterImg = new Image();
    beforeImg.crossOrigin = "anonymous";
    afterImg.crossOrigin = "anonymous";
    beforeImg.src = "/images/demo-before.png";
    afterImg.src = "/images/demo-after.png";

    let loaded = 0;
    let animId: number;

    const onLoad = () => {
      loaded++;
      if (loaded < 2) return;

      const W = canvas.width;
      const H = canvas.height;

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        // Draw after image (background)
        ctx.drawImage(afterImg, 0, 0, W, H);

        // Draw sliced before image (foreground)
        const sliceW = W / sliceCount;

        for (let i = 0; i < sliceCount; i++) {
          // Compute staggered progress for each slice
          let delay: number;
          if (staggerMode === "center") {
            const center = (sliceCount - 1) / 2;
            delay = Math.abs(i - center) * 0.12;
          } else if (staggerMode === "left") {
            delay = i * 0.1;
          } else {
            delay = (sliceCount - 1 - i) * 0.1;
          }

          const sliceProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay * sliceCount * 0.08)));
          const offsetY = sliceProgress * H; // Slide up

          if (sliceProgress < 1) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(i * sliceW, 0, sliceW, H);
            ctx.clip();

            // Draw slice moving up
            ctx.drawImage(
              beforeImg,
              i * sliceW * (beforeImg.width / W), 0,
              sliceW * (beforeImg.width / W), beforeImg.height,
              i * sliceW, -offsetY,
              sliceW, H
            );

            // Divider line
            if (i > 0) {
              ctx.strokeStyle = "rgba(255,255,255,0.15)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(i * sliceW, -offsetY);
              ctx.lineTo(i * sliceW, H - offsetY);
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        animId = requestAnimationFrame(draw);
      };

      draw();
    };

    beforeImg.onload = onLoad;
    afterImg.onload = onLoad;

    // Resize canvas
    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [sliceCount, progress, staggerMode]);

  return (
    <div style={{ background: "#0a0b0f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#3b82f6", marginBottom: 8 }}>
          CANVAS IMAGE EFFECT
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          이미지 슬라이스 전환
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 600, marginInline: "auto" }}>
          Canvas drawImage()로 이미지를 N등분하여 각 조각이 시간차로 슬라이드되는 커튼 효과
        </p>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        aspectRatio: "16/9", position: "relative",
      }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }}
        />
        {/* Labels overlay */}
        <div style={{
          position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8,
          fontSize: 11, fontWeight: 600,
        }}>
          <span style={{
            padding: "4px 12px", borderRadius: 999,
            background: progress < 0.5 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
            border: `1px solid ${progress < 0.5 ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
            color: progress < 0.5 ? "#fca5a5" : "#86efac",
          }}>
            {progress < 0.5 ? "BEFORE" : "AFTER"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        maxWidth: 900, margin: "32px auto", padding: "0 24px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {/* Progress slider */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            전환 진행률: {Math.round(progress * 100)}%
          </label>
          <input
            type="range" min="0" max="100" value={progress * 100}
            onChange={(e) => setProgress(Number(e.target.value) / 100)}
            style={{ width: "100%", accentColor: "#3b82f6" }}
          />
        </div>

        {/* Slice count */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginRight: 8 }}>분할 수:</span>
          {[3, 4, 5, 7].map(n => (
            <button
              key={n}
              onClick={() => setSliceCount(n)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid",
                borderColor: n === sliceCount ? "#3b82f6" : "rgba(255,255,255,0.1)",
                background: n === sliceCount ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                color: n === sliceCount ? "#60a5fa" : "#94a3b8",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {n}단
            </button>
          ))}
        </div>

        {/* Stagger mode */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginRight: 8 }}>스태거:</span>
          {(["center", "left", "right"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setStaggerMode(mode)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "1px solid",
                borderColor: mode === staggerMode ? "#06b6d4" : "rgba(255,255,255,0.1)",
                background: mode === staggerMode ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                color: mode === staggerMode ? "#22d3ee" : "#94a3b8",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {mode === "center" ? "중앙→양옆" : mode === "left" ? "좌→우" : "우→좌"}
            </button>
          ))}
        </div>
      </div>

      {/* Code info */}
      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: 20,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 코드</h3>
          <pre style={{
            fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto",
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7,
          }}>
{`ctx.drawImage(
  image,
  sx, sy, sWidth, sHeight,  // 소스(원본) 영역
  dx, dy, dWidth, dHeight   // 대상(캔버스) 영역
);

// 각 조각의 y좌표를 스크롤/진행률에 따라 이동
const offsetY = sliceProgress * canvasHeight;
ctx.drawImage(img, sliceX, 0, sliceW, H, sliceX, -offsetY, sliceW, H);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
