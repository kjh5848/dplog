"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

/* ─── Canvas Composite Operations ─── */
export default function CanvasCompositeV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [compositeOp, setCompositeOp] = useState<GlobalCompositeOperation>("screen");
  const [overlayColor, setOverlayColor] = useState("#3b82f6");
  const [wavePhase, setWavePhase] = useState(0);
  const [animating, setAnimating] = useState(true);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Base image
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(imgRef.current, 0, 0, W, H);

    // Set composite mode
    ctx.globalCompositeOperation = compositeOp;

    // Draw animated overlay
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, overlayColor + "cc");
    gradient.addColorStop(0.5, overlayColor + "44");
    gradient.addColorStop(1, overlayColor + "99");

    // Animated wave pattern
    ctx.beginPath();
    ctx.moveTo(0, H);

    for (let x = 0; x <= W; x += 4) {
      const y = H * 0.5 +
        Math.sin((x / W) * Math.PI * 3 + wavePhase) * H * 0.15 +
        Math.sin((x / W) * Math.PI * 5 + wavePhase * 1.5) * H * 0.08;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Second wave layer
    ctx.beginPath();
    ctx.moveTo(0, H);

    for (let x = 0; x <= W; x += 4) {
      const y = H * 0.6 +
        Math.sin((x / W) * Math.PI * 4 + wavePhase * 0.8 + 1) * H * 0.1 +
        Math.cos((x / W) * Math.PI * 2 + wavePhase * 1.2) * H * 0.06;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = overlayColor + "55";
    ctx.fill();

    // Floating circles (data flow)
    ctx.globalCompositeOperation = compositeOp;
    const circleCount = 12;
    for (let i = 0; i < circleCount; i++) {
      const cx = (W * (i / circleCount) + wavePhase * 40) % (W + 60) - 30;
      const cy = H * (0.3 + Math.sin(wavePhase + i) * 0.2);
      const r = 8 + Math.sin(wavePhase * 2 + i * 0.5) * 6;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = overlayColor + "88";
      ctx.fill();
    }

    // Reset composite
    ctx.globalCompositeOperation = "source-over";

    // Op label
    ctx.save();
    ctx.font = "bold 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.textAlign = "right";
    ctx.fillText(`Mode: ${compositeOp}`, W - 16, 28);
    ctx.restore();
  }, [compositeOp, overlayColor, wavePhase]);

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
      draw();
    };
  }, [draw]);

  // Animate wave
  useEffect(() => {
    if (!animating) return;
    let phase = 0;
    const tick = () => {
      phase += 0.02;
      setWavePhase(phase);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animating]);

  useEffect(() => {
    draw();
  }, [draw]);

  const ops: { value: GlobalCompositeOperation; label: string; desc: string }[] = [
    { value: "screen", label: "Screen", desc: "밝음 합성" },
    { value: "multiply", label: "Multiply", desc: "어둠 합성" },
    { value: "overlay", label: "Overlay", desc: "대비 강화" },
    { value: "color-dodge", label: "Color Dodge", desc: "밝은 빛 효과" },
    { value: "difference", label: "Difference", desc: "차이 반전" },
    { value: "hard-light", label: "Hard Light", desc: "강한 조명" },
    { value: "luminosity", label: "Luminosity", desc: "명도 합성" },
  ];

  const colors = [
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#ef4444", label: "Red" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#06b6d4", label: "Cyan" },
  ];

  return (
    <div style={{ background: "#0a0b0f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#10b981", marginBottom: 8 }}>
          CANVAS IMAGE EFFECT
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          합성 모드
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 600, marginInline: "auto" }}>
          globalCompositeOperation으로 이미지와 그래픽 레이어의 블렌딩 효과를 실시간으로 변경
        </p>
      </div>

      <div ref={containerRef} style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        aspectRatio: "16/9", position: "relative",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
      </div>

      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Composite operations */}
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 10 }}>합성 모드:</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ops.map(op => (
              <button key={op.value} onClick={() => setCompositeOp(op.value)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "1px solid",
                  borderColor: op.value === compositeOp ? "#10b981" : "rgba(255,255,255,0.1)",
                  background: op.value === compositeOp ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.03)",
                  color: op.value === compositeOp ? "#34d399" : "#94a3b8",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "start", gap: 2,
                }}>
                <span>{op.label}</span>
                <span style={{ fontSize: 10, color: op.value === compositeOp ? "#6ee7b7" : "#6b7280" }}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 8 }}>오버레이 색상:</span>
          <div style={{ display: "flex", gap: 8 }}>
            {colors.map(c => (
              <button key={c.value} onClick={() => setOverlayColor(c.value)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "2px solid",
                  borderColor: c.value === overlayColor ? "#fff" : "transparent",
                  background: c.value, cursor: "pointer",
                  boxShadow: c.value === overlayColor ? `0 0 12px ${c.value}66` : "none",
                }} title={c.label} />
            ))}
          </div>
        </div>

        {/* Animate toggle */}
        <button onClick={() => setAnimating(!animating)}
          style={{
            alignSelf: "flex-start", padding: "8px 20px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            background: animating ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
            color: animating ? "#34d399" : "#94a3b8",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
          {animating ? "⏸ 애니메이션 정지" : "▶️ 애니메이션 시작"}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 코드</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 1단계: 원본 이미지
ctx.globalCompositeOperation = "source-over";
ctx.drawImage(image, 0, 0, W, H);

// 2단계: 합성 모드 설정
ctx.globalCompositeOperation = "screen"; // 또는 multiply, overlay 등

// 3단계: 오버레이 그래픽 그리기
ctx.fillStyle = gradient;
ctx.fill(); // 이 레이어가 원본과 합성됨`}
          </pre>
        </div>
      </div>
    </div>
  );
}
