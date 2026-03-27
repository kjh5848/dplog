"use client";

import React, { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ─────────────────────────────────────
   Types
   ───────────────────────────────────── */

export interface SliceLabel {
  /** 슬라이스 위에 표시할 텍스트 */
  text: string;
  /** 선택적 아이콘 이모지 */
  icon?: string;
}

export interface ImageSliceTransitionProps {
  /** Before 이미지 URL */
  beforeImage: string;
  /** After 이미지 URL */
  afterImage: string;
  /** 슬라이스 개수 (기본 5) */
  sliceCount?: 3 | 4 | 5;
  /** 스크롤 영역 높이 (vh 단위) */
  scrollHeight?: number;
  /** Before 슬라이스에 표시할 키워드 라벨 */
  beforeLabels?: SliceLabel[];
  /** After 이미지 위에 표시할 라벨 */
  afterLabel?: ReactNode;
  /** Before 섹션 타이틀 */
  beforeTitle?: string;
  /** After 섹션 타이틀 */
  afterTitle?: string;
  /** 스테거 방향: center(중앙→양옆), left(좌→우), right(우→좌) */
  staggerOrigin?: "center" | "left" | "right";
  /** 각 슬라이스의 이징 (GSAP ease string) */
  ease?: string;
  /** 추가 className */
  className?: string;
  /** 추가 style */
  style?: CSSProperties;
}

/* ─────────────────────────────────────
   Component
   ───────────────────────────────────── */

export default function ImageSliceTransition({
  beforeImage,
  afterImage,
  sliceCount = 5,
  scrollHeight = 300,
  beforeLabels = [],
  afterLabel,
  beforeTitle = "Before",
  afterTitle = "After",
  staggerOrigin = "center",
  ease = "power3.inOut",
  className,
  style,
}: ImageSliceTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsap: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ScrollTrigger: any;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any;

    const rootNode = rootRef.current;

    (async () => {
      const gsapPkg = await import("gsap");
      gsap = gsapPkg.gsap || gsapPkg.default || gsapPkg;

      const stPkg = await import("gsap/ScrollTrigger").catch(() =>
        import("gsap/dist/ScrollTrigger")
      );
      ScrollTrigger =
        (stPkg as Record<string, unknown>).ScrollTrigger ||
        (stPkg as Record<string, unknown>).default ||
        stPkg;

      gsap.registerPlugin(ScrollTrigger);

      if (cancelled || !rootNode || !stickyRef.current) return;

      const slices = rootNode.querySelectorAll<HTMLElement>(".ist-slice");
      const labels = rootNode.querySelectorAll<HTMLElement>(".ist-slice-label");
      const afterEl = rootNode.querySelector<HTMLElement>(".ist-after-wrap");
      const afterLabelEl = rootNode.querySelector<HTMLElement>(".ist-after-label");
      const beforeTitleEl = rootNode.querySelector<HTMLElement>(".ist-before-title");
      const afterTitleEl = rootNode.querySelector<HTMLElement>(".ist-after-title");
      const progressBar = rootNode.querySelector<HTMLElement>(".ist-progress-fill");

      if (!slices.length) return;

      /* Compute stagger order */
      const staggerConfig = (() => {
        switch (staggerOrigin) {
          case "center": return { each: 0.08, from: "center" as const };
          case "left": return { each: 0.08, from: "start" as const };
          case "right": return { each: 0.08, from: "end" as const };
        }
      })();

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootNode,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: false,
        },
      });

      /* Phase 1 (0 → 0.3): Before title fades in */
      if (beforeTitleEl) {
        tl.fromTo(
          beforeTitleEl,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          0
        );
      }

      /* Phase 2 (0.2 → 0.7): Slices slide away with stagger */
      tl.to(
        slices,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.4,
          ease: ease,
          stagger: staggerConfig,
        },
        0.2
      );

      /* Labels fade out slightly before slices */
      if (labels.length) {
        tl.to(
          labels,
          {
            opacity: 0,
            y: -20,
            duration: 0.15,
            stagger: staggerConfig,
            ease: "power2.in",
          },
          0.15
        );
      }

      /* Before title fades out */
      if (beforeTitleEl) {
        tl.to(
          beforeTitleEl,
          { opacity: 0, y: -20, duration: 0.1, ease: "power2.in" },
          0.3
        );
      }

      /* Phase 3 (0.5 → 0.8): After image reveals */
      if (afterEl) {
        gsap.set(afterEl, { scale: 1.05, filter: "blur(4px)" });
        tl.to(
          afterEl,
          { scale: 1, filter: "blur(0px)", duration: 0.3, ease: "power2.out" },
          0.4
        );
      }

      /* After title fades in */
      if (afterTitleEl) {
        tl.fromTo(
          afterTitleEl,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
          0.6
        );
      }

      /* After label fades in */
      if (afterLabelEl) {
        tl.fromTo(
          afterLabelEl,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "back.out(1.4)" },
          0.65
        );
      }

      /* Progress bar */
      if (progressBar) {
        tl.fromTo(
          progressBar,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "none" },
          0
        );
      }
    })();

    return () => {
      cancelled = true;
      try {
        tl?.kill?.();
      } catch { /* noop */ }
      try {
        if (ScrollTrigger?.getAll && rootNode) {
          ScrollTrigger.getAll().forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (t: any) => rootNode.contains(t.trigger) && t.kill(true)
          );
        }
      } catch { /* noop */ }
    };
  }, [sliceCount, ease, staggerOrigin, scrollHeight]);

  /* Generate clip-path for each slice */
  const getSliceClip = (index: number): string => {
    const w = 100 / sliceCount;
    const left = w * index;
    const right = 100 - w * (index + 1);
    return `inset(0 ${right}% 0 ${left}%)`;
  };

  return (
    <div
      ref={rootRef}
      className={["ist-root", className].filter(Boolean).join(" ")}
      style={{ height: `${scrollHeight}vh`, ...style }}
    >
      <div ref={stickyRef} className="ist-sticky">
        {/* Progress bar */}
        <div className="ist-progress">
          <div className="ist-progress-fill" />
        </div>

        {/* Stage labels */}
        <div className="ist-before-title">{beforeTitle}</div>
        <div className="ist-after-title">{afterTitle}</div>

        {/* Container */}
        <div className="ist-container">
          {/* After image (background) */}
          <div className="ist-after-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={afterImage} alt="After" className="ist-img" />
          </div>

          {/* After label overlay */}
          {afterLabel && (
            <div className="ist-after-label">{afterLabel}</div>
          )}

          {/* Before slices (foreground) */}
          {Array.from({ length: sliceCount }).map((_, i) => (
            <div
              key={i}
              className="ist-slice"
              style={{ clipPath: getSliceClip(i) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={beforeImage} alt="Before" className="ist-img" />

              {/* Slice divider line */}
              {i > 0 && <div className="ist-slice-divider" style={{ left: "0" }} />}
              {i < sliceCount - 1 && <div className="ist-slice-divider" style={{ right: "0" }} />}

              {/* Label */}
              {beforeLabels[i] && (
                <div className="ist-slice-label">
                  {beforeLabels[i].icon && (
                    <span className="ist-slice-icon">{beforeLabels[i].icon}</span>
                  )}
                  <span className="ist-slice-text">{beforeLabels[i].text}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ist-root {
          position: relative;
          font-family: "Noto Sans KR", Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
        }

        .ist-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Progress bar */
        .ist-progress {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          width: min(400px, 60vw);
          height: 3px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          z-index: 20;
          overflow: hidden;
        }
        .ist-progress-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #3b82f6, #22d3ee);
          transform-origin: left;
          border-radius: inherit;
        }

        /* Stage titles */
        .ist-before-title,
        .ist-after-title {
          position: absolute;
          top: clamp(20px, 4vh, 48px);
          left: 50%;
          transform: translateX(-50%);
          font-size: clamp(12px, 1.5vw, 16px);
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 20px;
          border-radius: 999px;
          z-index: 20;
        }
        .ist-before-title {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .ist-after-title {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #86efac;
          opacity: 0;
        }

        /* Container */
        .ist-container {
          position: relative;
          width: min(90vw, 1100px);
          height: min(70vh, 640px);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06);
        }

        /* Images */
        .ist-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          user-select: none;
          pointer-events: none;
        }

        /* After wrap */
        .ist-after-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        /* After label */
        .ist-after-label {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
        }

        /* Slice (before) */
        .ist-slice {
          position: absolute;
          inset: 0;
          z-index: 10;
          will-change: clip-path;
        }

        /* Slice divider lines */
        .ist-slice-divider {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          background: rgba(255,255,255,0.15);
          z-index: 11;
        }

        /* Slice label */
        .ist-slice-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 12;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          pointer-events: none;
        }
        .ist-slice-icon {
          font-size: clamp(20px, 3vw, 32px);
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
        }
        .ist-slice-text {
          font-size: clamp(11px, 1.4vw, 15px);
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5);
          padding: 4px 12px;
          border-radius: 8px;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .ist-container {
            width: 95vw;
            height: 50vh;
            border-radius: 14px;
          }
          .ist-slice-text {
            font-size: 10px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </div>
  );
}
