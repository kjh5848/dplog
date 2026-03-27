"use client";

import React, { useRef, useEffect, useState } from "react";

/* ─── Parallax Depth Slice ─── */
export default function ParallaxSliceV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [sliceCount, setSliceCount] = useState(5);
  const [depthMultiplier, setDepthMultiplier] = useState(1);
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

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/demo-after.png";

    img.onload = () => {
      const draw = () => {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Dark background
        ctx.fillStyle = "#050508";
        ctx.fillRect(0, 0, W, H);

        const sliceW = W / sliceCount;
        const t = scrollY / 100; // Normalized scroll

        for (let i = 0; i < sliceCount; i++) {
          ctx.save();

          // Each slice has different depth/speed
          const center = (sliceCount - 1) / 2;
          const distFromCenter = Math.abs(i - center);
          const depthFactor = (1 + distFromCenter * 0.5) * depthMultiplier;

          // Parallax offset
          const offsetY = t * 80 * depthFactor;
          const offsetX = (i - center) * t * 15 * depthMultiplier;

          // Scale varies by depth
          const scale = 1 - t * 0.04 * depthFactor;

          // Rotation for 3D effect
          const rotation = (i - center) * t * 0.02 * depthMultiplier;

          // Opacity falls off for slices moving faster
          const alpha = Math.max(0, 1 - t * 0.3 * depthFactor);

          // Shadow/depth
          const shadowBlur = t * 8 * depthFactor;

          // Clip to slice
          ctx.beginPath();
          ctx.rect(i * sliceW - 2, -100, sliceW + 4, H + 200);
          ctx.clip();

          ctx.globalAlpha = alpha;

          // Apply transforms
          const cx = i * sliceW + sliceW / 2;
          const cy = H / 2;
          ctx.translate(cx + offsetX, cy - offsetY);
          ctx.rotate(rotation);
          ctx.scale(scale, scale);
          ctx.translate(-cx, -cy);

          // Drop shadow
          if (shadowBlur > 0) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = shadowBlur;
            ctx.shadowOffsetY = shadowBlur * 0.5;
          }

          // Draw image slice
          ctx.drawImage(img, 0, 0, W, H);

          ctx.restore();
        }

        // Depth-of-field blur overlay on edges
        if (t > 0) {
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, `rgba(5,5,8,${t * 0.4})`);
          grad.addColorStop(0.4, "rgba(5,5,8,0)");
          grad.addColorStop(0.7, "rgba(5,5,8,0)");
          grad.addColorStop(1, `rgba(5,5,8,${t * 0.6})`);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }

        // Depth indicator lines
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        for (let i = 1; i < sliceCount; i++) {
          ctx.beginPath();
          ctx.moveTo(i * sliceW, 0);
          ctx.lineTo(i * sliceW, H);
          ctx.stroke();
        }
        ctx.restore();

        rafRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    return () => cancelAnimationFrame(rafRef.current);
  }, [scrollY, sliceCount, depthMultiplier]);

  return (
    <div style={{ background: "#050508", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#a78bfa", marginBottom: 8 }}>
          HIGHEND IMAGE TRANSITION
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          시차 깊이 슬라이스
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 640, marginInline: "auto" }}>
          각 조각이 서로 다른 깊이와 속도로 움직여 입체감을 만들어냅니다
        </p>
      </div>

      <div ref={containerRef} style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", aspectRatio: "16/9" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>
            스크롤 깊이: {scrollY}%
          </label>
          <input type="range" min="0" max="100" value={scrollY}
            onChange={(e) => setScrollY(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#a78bfa" }} />
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginRight: 8 }}>분할:</span>
            {[3, 5, 7].map(n => (
              <button key={n} onClick={() => setSliceCount(n)} style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6,
                border: `1px solid ${n === sliceCount ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
                background: n === sliceCount ? "rgba(167,139,250,0.12)" : "transparent",
                color: n === sliceCount ? "#c4b5fd" : "#6b7280",
              }}>{n}단</button>
            ))}
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginRight: 8 }}>깊이 배율:</span>
            {[0.5, 1, 2].map(m => (
              <button key={m} onClick={() => setDepthMultiplier(m)} style={{
                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6,
                border: `1px solid ${m === depthMultiplier ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
                background: m === depthMultiplier ? "rgba(167,139,250,0.12)" : "transparent",
                color: m === depthMultiplier ? "#c4b5fd" : "#6b7280",
              }}>{m}x</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 원리</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 각 조각별 깊이 계수
const depthFactor = 1 + distFromCenter * 0.5;

// 시차 오프셋 — 깊이가 깊을수록 더 많이 이동
const offsetY = scroll * 80 * depthFactor;
const offsetX = (i - center) * scroll * 15;
const rotation = (i - center) * scroll * 0.02;

// 깊이에 따른 투명도/그림자 조절
const alpha = 1 - scroll * 0.3 * depthFactor;
ctx.shadowBlur = scroll * 8 * depthFactor;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
