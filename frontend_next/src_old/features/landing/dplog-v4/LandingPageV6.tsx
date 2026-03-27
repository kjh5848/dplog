"use client";

import Link from "next/link";

const serviceHighlights = [
  "AI 매출 진단",
  "리뷰/상권 분석",
  "지원금 매칭",
  "콘텐츠 자동화",
  "마케팅 캠페인",
  "24/7 성과 모니터링",
];

const advantages = [
  {
    title: "20년 데이터 학습",
    description: "외식업 2,500개 매장의 운영 데이터를 기반으로 알고리즘을 고도화했습니다.",
  },
  {
    title: "현장 중심 실행",
    description: "사장님이 오늘 바로 실행할 수 있는 루틴을 자동으로 큐레이션합니다.",
  },
  {
    title: "전담 컨설턴트",
    description: "온보딩부터 성과 리포트까지 전담 매니저가 함께합니다.",
  },
  {
    title: "실시간 모니터링",
    description: "리뷰와 매출 변동을 실시간으로 감지하고 즉시 알립니다.",
  },
];

const serviceCards = [
  {
    number: "01",
    title: "AI 경영 진단",
    description: "매출, 리뷰, 상권 데이터를 통합해 경영 리스크를 분석합니다.",
  },
  {
    number: "02",
    title: "리뷰 자동화",
    description: "부정 리뷰 대응과 답글을 자동으로 생성해 평점을 유지합니다.",
  },
  {
    number: "03",
    title: "지원금 스캐닝",
    description: "사업 조건에 맞는 정부 지원사업을 실시간으로 추천합니다.",
  },
  {
    number: "04",
    title: "콘텐츠 제작",
    description: "SNS/블로그/전단지 카피까지 한 번에 제작합니다.",
  },
  {
    number: "05",
    title: "캠페인 실행",
    description: "쿠폰, 프로모션, 메시지를 자동으로 설계하고 발송합니다.",
  },
  {
    number: "06",
    title: "성과 리포트",
    description: "운영 지표를 한 눈에 보고 의사결정을 빠르게 합니다.",
  },
];

const partnerLogos = [
  "D-PLACE",
  "FOODLAB",
  "PRESTO",
  "BIZMATE",
  "GROWTHBOX",
  "MARKETLY",
];

export default function LandingPageV6() {
  return (
    <div className="landing-v6 gemini-root dplog-shell">
      <nav className="landing-v6-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link className="text-lg font-bold tracking-tight" href="/landing/dplog-alt">
            D-PLOG
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a className="hover-text-accent" href="#about">
              회사 소개
            </a>
            <a className="hover-text-accent" href="#services">
              서비스
            </a>
            <a className="hover-text-accent" href="#partners">
              파트너
            </a>
            <a className="hover-text-accent" href="#contact">
              문의
            </a>
          </div>
          <Link className="btn btn-primary btn-sm" href="/diagnosis/new">
            무료 진단
          </Link>
        </div>
      </nav>

      <main className="landing-v6-main">
        <section className="landing-v6-hero" id="hero">
          <div className="landing-v6-hero-overlay"></div>
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">D-PLOG V6</p>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                매장을 성장시키는
                <span className="block text-accent">AI 경영 파트너</span>
              </h1>
              <p className="text-base text-white/70 md:text-lg">
                데이터 기반으로 매출, 리뷰, 지원금, 마케팅을 통합 관리하세요. D-PLOG는 사장님의 부담을 줄이고
                실행을 돕는 운영 시스템입니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/diagnosis/new">
                  무료 진단 시작
                </Link>
                <Link className="btn btn-outline" href="/success-stories">
                  성과 사례 보기
                </Link>
              </div>
            </div>
            <div className="landing-v6-hero-panel">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>01 / 06</span>
                <span>OUR SERVICES</span>
              </div>
              <div className="mt-4 space-y-3">
                {serviceHighlights.map((item) => (
                  <div key={item} className="landing-v6-service-chip">
                    {item}
                  </div>
                ))}
              </div>
              <div className="landing-v6-hero-note">
                <p className="text-xs text-white/60">실시간 운영 제어</p>
                <p className="text-sm text-white/80">24시간 자동 분석과 알림</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-v6-about" id="about">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1fr]">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">ABOUT D-PLOG</p>
              <h2 className="text-3xl font-bold md:text-4xl">20년 현장 데이터를 담은 AI</h2>
              <p className="text-sm text-white/60 md:text-base">
                D-PLOG는 외식업 운영자의 경험을 데이터로 정리해 실행 가능한 전략을 제공합니다. 안정적인 성장과
                리스크 대응을 동시에 지원합니다.
              </p>
              <Link className="btn btn-outline btn-sm" href="/dashboard">
                대시보드 둘러보기
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "시장 경험", value: "20+년" },
                { label: "누적 매장", value: "2,500+" },
                { label: "리뷰 분석", value: "125만 건" },
                { label: "지원금 매칭", value: "45,000건" },
              ].map((item) => (
                <div key={item.label} className="landing-v6-stat">
                  <p className="text-2xl font-bold text-accent">{item.value}</p>
                  <p className="text-xs text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v6-advantages">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">OUR ADVANTAGES</p>
              <h2 className="text-3xl font-bold md:text-4xl">사장님을 위한 실행형 자동화</h2>
              <p className="text-sm text-white/60 md:text-base">
                현장에서 바로 활용 가능한 액션을 제공합니다. 복잡한 설정 없이 시작할 수 있습니다.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {advantages.map((item) => (
                <div key={item.title} className="landing-v6-card">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v6-services" id="services">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">OUR SERVICES</p>
              <h2 className="text-3xl font-bold md:text-4xl">경영을 움직이는 6가지 모듈</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {serviceCards.map((item) => (
                <div key={item.title} className="landing-v6-service-card">
                  <span className="text-xs text-accent-soft">{item.number}</span>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v6-partners" id="partners">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">파트너</h2>
              <span className="text-xs text-white/50">업계 리더들과 함께합니다</span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-6">
              {partnerLogos.map((logo) => (
                <div key={logo} className="landing-v6-logo">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v6-contact" id="contact">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">CONTACT</p>
              <h2 className="text-3xl font-bold md:text-4xl">상담 신청</h2>
              <p className="text-sm text-white/60 md:text-base">
                D-PLOG 전문가가 최적의 실행 플랜을 안내합니다. 상담 신청 후 24시간 이내 연락드립니다.
              </p>
            </div>
            <form className="landing-v6-form">
              <label className="text-sm text-white/60">
                성함
                <input className="landing-v6-input" placeholder="예: 김민수" />
              </label>
              <label className="text-sm text-white/60">
                전화번호
                <input className="landing-v6-input" placeholder="010-0000-0000" />
              </label>
              <label className="text-sm text-white/60">
                이메일
                <input className="landing-v6-input" placeholder="email@domain.com" />
              </label>
              <button className="btn btn-primary w-full" type="button">
                상담 요청 보내기
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
