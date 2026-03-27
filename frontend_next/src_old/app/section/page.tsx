"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SectionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

interface SectionCategory {
  title: string;
  items: SectionItem[];
}

const CATEGORIZED_SECTIONS: SectionCategory[] = [
  {
    title: "Dashboard & Features",
    items: [
      {
        id: "dashboard-scroll-v1",
        title: "Dashboard Scroll V1",
        description: "3D 스크롤 애니메이션이 적용된 대시보드 데모",
        href: "/section/dashboard-scroll-v1",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "feature-sticky",
        title: "Feature Sticky Section",
        description: "스크롤에 따라 좌측 타이틀이 고정되고 우측 콘텐츠가 스크롤되는 레이아웃",
        href: "/section/feature-sticky",
        image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "feature-tabs",
        title: "Feature Sticky Scroll",
        description: "스크롤 위치에 따라 카드가 변경되며 배경색이 전환되는 인터랙티브 섹션",
        href: "/section/feature-tabs",
        image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "accordion-v1",
        title: "Accordion FAQ V1",
        description: "카테고리별 탭과 유려한 애니메이션이 결합된 고퀄리티 아코디언 FAQ 섹션",
        href: "/section/accordion",
        image: "https://images.unsplash.com/photo-1484417856246-a311c2027a5d?q=80&w=2664&auto=format&fit=crop",
      },
      {
        id: "bento-grid-v2",
        title: "Bento Grid V2",
        description: "호버 시 CTA가 나타나는 프리미엄 벤토 그리드 카드 레이아웃",
        href: "/section/bento-grid-v2",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "pricing-v1",
        title: "Interactive Pricing V1",
        description: "월간/연간 토글, 콘페티 이펙트, 숫자 애니메이션이 포함된 인터랙티브 요금제 카드",
        href: "/section/pricing-v1",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    title: "Hero Sections",
    items: [
      {
        id: "hero",
        title: "Premium Hero Section V1",
        description: "Bento Grid 기반의 중앙 집중형 헤로 섹션",
        href: "/section/hero",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "hero-v2",
        title: "Immersive Hero Section V2",
        description: "3D Tilt 인터랙션이 포함된 몰입형 헤로 섹션",
        href: "/section/hero-v2",
        image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "hero-v3",
        title: "Cinematic Hero Section V3",
        description: "시네마틱한 배경 슬라이더를 적용한 감성적인 헤로 섹션",
        href: "/section/hero-v3",
        image: "https://images.unsplash.com/photo-1761839257946-4616bcfafec7?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "hero-v4",
        title: "Cinematic Interactive V4",
        description: "V2의 3D 인터랙티브 구성과 V3의 시네마틱 이미지가 만난 최종 진화형",
        href: "/section/hero-v4",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "hero-v5",
        title: "Interactive Fluid V5",
        description: "인터랙티브 물결 배경과 PRD 가치를 결합한 최첨단 히어로 섹션",
        href: "/section/hero-v5",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "hero-v6",
        title: "Drive to Growth V6",
        description: "자동차의 속도감과 비즈니스의 데이터 흐름을 대시보드 UI로 시각화한 섹션",
        href: "/section/hero-v6",
        image: "/brain/6a8c9298-8a8c-41b8-9c18-f4f77db30130/hero_v6_car_drive_1770876573910.png",
      },
      {
        id: "hero-v7",
        title: "Diagnostic Cockpit V7",
        description: "사용자를 비즈니스의 지휘관으로 격상시키는 미래형 AR HUD 콕핏 섹션",
        href: "/section/hero-v7",
        image: "/brain/6a8c9298-8a8c-41b8-9c18-f4f77db30130/hero_v7_cockpit_view_1770876793783.png",
      },
      {
        id: "hero-v8",
        title: "Bright Motion V8",
        description: "이미지 없이 끊임없이 지나가는 라인 모션만으로 정결한 가속감을 표현한 한국형 플랫폼 섹션",
        href: "/section/hero-v8",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    title: "Navigation",
    items: [
      {
        id: "nav-v1",
        title: "Transforming Navbar V1",
        description: "스크롤 시 캡슐 형태로 변형되는 플로팅 내비게이션 바",
        href: "/section/nav-v1",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "nav-v2",
        title: "Expandable Navbar V2",
        description: "호버 시 메뉴가 확장되는 미니멀한 인터랙티브 내비게이션 바",
        href: "/section/nav-v2",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "nav-v3",
        title: "Refined Sticky Navbar V3",
        description: "정교한 스택 및 플로팅 변형이 포함된 차세대 내비게이션 바",
        href: "/section/nav-v3",
        image: "https://images.unsplash.com/photo-1510511459019-5dee9954889c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "nav-v4",
        title: "Diagnostic Gear Navbar V4",
        description: "PRD 기반의 신뢰감 있는 진단 상태 인디케이터 포함 디자인",
        href: "/section/nav-v4",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    title: "Scroll & Motion Effects",
    items: [
      {
        id: "background-v1",
        title: "Aurora Background V1",
        description: "오로라 빛줄기가 은은하게 흐르는 몰입형 그라데이션 배경 효과",
        href: "/section/background-v1",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "animation-image-v1",
        title: "Scroll Animated Video V1",
        description: "스크롤 기반 비디오 확장 애니메이션 + GSAP ScrollTrigger + 오버레이 리빌",
        href: "/section/animation-image-v1",
        image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "image-motion-v1",
        title: "Image Motion V1",
        description: "GSAP 기반 이미지 슬라이스 트랜지션 — Before/After 이미지를 3~5단으로 분할하여 스태거 애니메이션으로 전환",
        href: "/section/image-motion-v1",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "diagonal-reveal-v1",
        title: "Diagonal Reveal V1",
        description: "사선으로 구역을 나누고 각 조각이 확대+블러+시간차를 두고 사라지는 대각선 시차 노출",
        href: "/section/diagonal-reveal-v1",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "liquid-distortion-v1",
        title: "Liquid Distortion V1",
        description: "경계선이 물결처럼 일렁이며 픽셀 단위 왜곡으로 다음 이미지로 전환되는 액체형 효과",
        href: "/section/liquid-distortion-v1",
        image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "parallax-slice-v1",
        title: "Parallax Slice V1",
        description: "각 조각이 서로 다른 깊이와 속도로 움직여 입체감을 주는 시차 깊이 슬라이스",
        href: "/section/parallax-slice-v1",
        image: "https://images.unsplash.com/photo-1634017839464-5c339afa0df4?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "card-stack-v1",
        title: "Card Stack V1",
        description: "스크롤 시 카드가 한 장씩 sticky로 쌓이며 이전 카드는 뒤로 축소되는 스태킹 효과",
        href: "/section/card-stack-v1",
        image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "scale-reveal-v1",
        title: "Scale Reveal V1",
        description: "현재 섹션이 perspective+translateZ로 뒤로 밀려나며 새 섹션이 위를 덮는 축소 노출",
        href: "/section/scale-reveal-v1",
        image: "https://images.unsplash.com/photo-1618172193622-10b9526adf32?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "horizontal-scroll-v1",
        title: "Horizontal Scroll V1",
        description: "세로 스크롤을 가로 이동으로 변환하여 콘텐츠를 순차적으로 보여주는 횡이동 효과",
        href: "/section/horizontal-scroll-v1",
        image: "https://images.unsplash.com/photo-1618556450994-a163d8bf661c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "glass-reveal-v1",
        title: "Glass Reveal V1",
        description: "반투명 유리 조각이 스르릉 지나가며 프리즘 굴절과 함께 새 이미지를 드러내는 유리 마스킹",
        href: "/section/glass-reveal-v1",
        image: "https://images.unsplash.com/photo-1604076913837-52ab5f2798bc?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "velocity-blur-v1",
        title: "Velocity Blur V1",
        description: "스크롤 속도에 비례하여 블러+채도감소+색수차가 적용되고 멈추면 선명해지는 속도 기반 블러",
        href: "/section/velocity-blur-v1",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "magnetic-hover-v1",
        title: "Magnetic Hover V1",
        description: "마우스 위치에 따라 카드가 3D 틸트되고 빛 반사가 따라다니는 자석 효과",
        href: "/section/magnetic-hover-v1",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "timeline-v1",
        title: "Animated Timeline V1",
        description: "스크롤에 따라 진행 표시줄이 차오르는 동적인 타임라인 섹션",
        href: "/section/timeline",
        image: "https://images.unsplash.com/photo-1506784919141-935049939562?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    title: "Canvas & Advanced Effects",
    items: [
      {
        id: "canvas-slice-v1",
        title: "Canvas Slice V1",
        description: "Canvas drawImage()로 이미지를 N등분하여 각 조각이 시간차로 슬라이드되는 커튼 전환 효과",
        href: "/section/canvas-slice-v1",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "canvas-pixel-v1",
        title: "Canvas Pixel V1",
        description: "getImageData()로 픽셀 직접 조작 — 흑백/반전/세피아 필터 + 중앙 컬러 리빌 효과",
        href: "/section/canvas-pixel-v1",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "canvas-mask-v1",
        title: "Canvas Mask V1",
        description: "clip()으로 마우스 추적 원형 마스크 — 흐린 배경에서 돋보기처럼 선명한 영역이 이동",
        href: "/section/canvas-mask-v1",
        image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "canvas-pixelate-v1",
        title: "Canvas Pixelate V1",
        description: "imageSmoothingEnabled를 활용한 모자이크→선명 픽셀레이션 전환 효과",
        href: "/section/canvas-pixelate-v1",
        image: "https://images.unsplash.com/photo-1618556450994-a163d8bf661c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "canvas-composite-v1",
        title: "Canvas Composite V1",
        description: "globalCompositeOperation으로 screen/multiply/overlay 등 실시간 블렌딩 + 웨이브 애니메이션",
        href: "/section/canvas-composite-v1",
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];


export default function SectionWarehousePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="border-b border-white/5 py-12">
        <div className="container mx-auto px-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            Section Warehouse
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-lg"
          >
            D-PLOG의 프리미엄 컴포넌트 및 섹션 라이브러리입니다.
          </motion.p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20 bg-[#050505]">
        {CATEGORIZED_SECTIONS.map((category, catIdx) => (
          <div key={category.title} className="mb-24 last:mb-0">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: catIdx * 0.1 }}
              className="text-2xl font-bold mb-8 flex items-center gap-4 text-emerald-400"
            >
              <span className="w-1 h-8 bg-emerald-500 rounded-full" />
              {category.title}
            </motion.h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((section, idx) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (catIdx * 0.1) + (idx * 0.05) }}
                >
                  <Link 
                    href={section.href}
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="aspect-video w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                      {section.image.startsWith('/') ? (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-white/20">
                           {/* Placeholder for local assets if needed, or simple img tag */}
                           <img 
                            src={section.image} 
                            alt={section.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                           />
                        </div>
                      ) : (
                        <img 
                          src={section.image} 
                          alt={section.title}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors pointer-events-none" />
                      
                      {/* ID Badge */}
                      <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-xs font-mono text-white/60 border border-white/10">
                        {section.id}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">{section.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed mb-6 flex-grow">
                        {section.description}
                      </p>
                      <div className="inline-flex items-center text-sm font-medium text-white/60 group-hover:text-white mt-auto">
                        View Component
                        <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-sm text-white/20 bg-[#050505]">
        <p>© 2026 D-PLOG Section Archive.</p>
      </footer>
    </div>
  );
}
