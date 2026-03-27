"use client";

import React, { useRef, useEffect } from "react";

/* ─── Canvas Dynamic Masking ─── */
export default function CanvasMaskV1Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const imgsRef = useRef<{ blur: HTMLImageElement | null; sharp: HTMLImageElement | null }>({ blur: null, sharp: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };
    resize();

    const draw = () => {
      if (!imgsRef.current.blur || !imgsRef.current.sharp) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;
      const radius = Math.min(W, H) * 0.18;

      ctx.clearRect(0, 0, W, H);
      ctx.filter = "blur(8px) brightness(0.4)";
      ctx.drawImage(imgsRef.current.blur, 0, 0, W, H);
      ctx.filter = "none";

      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(imgsRef.current.sharp, 0, 0, W, H);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(59,130,246,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(59,130,246,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mx - radius - 20, my);
      ctx.lineTo(mx + radius + 20, my);
      ctx.moveTo(mx, my - radius - 20);
      ctx.lineTo(mx, my + radius + 20);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = "bold 11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(96,165,250,0.8)";
      ctx.textAlign = "center";
      ctx.fillText("🔍 상세 보기", mx, my + radius + 24);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/demo-after.png";
    img.onload = () => {
      imgsRef.current.blur = img;
      imgsRef.current.sharp = img;
    };

    rafRef.current = requestAnimationFrame(draw);

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    const handleTouch = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      mouseRef.current = {
        x: (t.clientX - rect.left) / rect.width,
        y: (t.clientY - rect.top) / rect.height,
      };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("resize", resize);
    };
  }, []);


  return (
    <div style={{ background: "#0a0b0f", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "60px 24px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#06b6d4", marginBottom: 8 }}>
          CANVAS IMAGE EFFECT
        </p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          동적 마스킹
        </h1>
        <p style={{ fontSize: "clamp(13px, 1.6vw, 16px)", color: "#94a3b8", margin: 0, maxWidth: 600, marginInline: "auto" }}>
          마우스 위치에 따라 선명한 영역이 이동하는 돋보기 효과 — clip()으로 원형 마스크를 생성합니다
        </p>
      </div>

      <div ref={containerRef} style={{
        maxWidth: 900, margin: "0 auto", padding: "0 24px",
        aspectRatio: "16/9", position: "relative", cursor: "none",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: 16, display: "block" }} />
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 999,
          backdropFilter: "blur(8px)",
        }}>
          <span>🖱️</span> 마우스를 이미지 위에서 움직여 보세요
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px 60px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#e2e8f0" }}>핵심 코드</h3>
          <pre style={{ fontSize: 12, color: "#94a3b8", margin: 0, overflow: "auto", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
{`// 흐린 배경 그리기
ctx.filter = "blur(8px) brightness(0.4)";
ctx.drawImage(image, 0, 0, W, H);

// 원형 클리핑 마스크로 선명한 이미지 표시
ctx.save();
ctx.beginPath();
ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
ctx.clip();
ctx.filter = "none";
ctx.drawImage(image, 0, 0, W, H);
ctx.restore();`}
          </pre>
        </div>
      </div>
    </div>
  );
}
