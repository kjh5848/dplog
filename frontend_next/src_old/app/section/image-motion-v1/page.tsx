"use client";

import dynamic from "next/dynamic";

const ImageSliceTransition = dynamic(
  () => import("@/shared/ui/image-slice-transition"),
  { ssr: false }
);

const beforeLabels = [
  { text: "고액 대행비", icon: "💸" },
  { text: "불투명한 성과", icon: "🔒" },
  { text: "허위 계약", icon: "⚠️" },
  { text: "감에 의존", icon: "🎲" },
  { text: "시간 낭비", icon: "⏰" },
];

export default function ImageMotionV1Page() {
  return (
    <div style={{ background: "#0b0c10", minHeight: "100vh" }}>
      {/* Intro spacer */}
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 56px)",
            fontWeight: 900,
            color: "#f3f4f6",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Image Motion V1
        </h1>
        <p
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "#9ca3af",
            maxWidth: "600px",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          스크롤하면 이미지가 5단으로 쪼개지면서 각 조각이 시간차로 사라지고,
          새로운 이미지가 나타나는 Grid/Slice Transition 효과입니다.
        </p>
        <div
          style={{
            marginTop: "32px",
            fontSize: "14px",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ animation: "bounce 1.5s infinite" }}>↓</span>
          스크롤하여 효과를 확인하세요
        </div>
      </div>

      {/* Demo 1: 5-slice, center stagger */}
      <ImageSliceTransition
        beforeImage="/images/demo-before.png"
        afterImage="/images/demo-after.png"
        sliceCount={5}
        scrollHeight={300}
        staggerOrigin="center"
        beforeTitle="기존 방식"
        afterTitle="D-PLOG"
        beforeLabels={beforeLabels}
        afterLabel={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "24px",
              background: "rgba(0,0,0,0.5)",
              borderRadius: "16px",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(59,130,246,0.3)",
            }}
          >
            <span style={{ fontSize: "32px" }}>✨</span>
            <span
              style={{
                fontSize: "clamp(20px, 3vw, 32px)",
                fontWeight: 800,
                color: "#fff",
                textAlign: "center",
              }}
            >
              데이터 기반 자생력
            </span>
            <span
              style={{
                fontSize: "clamp(12px, 1.4vw, 15px)",
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
              }}
            >
              D-PLOG와 함께 성장하는 매장
            </span>
          </div>
        }
      />

      {/* Demo 2: 3-slice, left stagger */}
      <div
        style={{
          height: "40vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(22px, 4vw, 40px)",
            fontWeight: 800,
            color: "#f3f4f6",
            margin: 0,
          }}
        >
          3단 분할 + 좌→우 슬라이드
        </h2>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
          {`staggerOrigin="left" / sliceCount=3`}
        </p>
      </div>

      <ImageSliceTransition
        beforeImage="/images/demo-before.png"
        afterImage="/images/demo-after.png"
        sliceCount={3}
        scrollHeight={250}
        staggerOrigin="left"
        ease="power4.inOut"
        beforeTitle="Before"
        afterTitle="After"
        beforeLabels={[
          { text: "복잡한 과정", icon: "🔧" },
          { text: "높은 비용", icon: "💰" },
          { text: "낮은 효율", icon: "📉" },
        ]}
      />

      {/* End spacer */}
      <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>데모 종료</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
