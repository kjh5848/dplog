"use client";

import Link from "next/link";

const chapters = [
  {
    step: "CHAPTER 01",
    title: "현장 문제를 바로 읽다",
    description:
      "매출 하락, 리뷰 대응, 인건비 압박까지. 운영 리스크를 신호로 변환해 우선순위를 정합니다.",
    bullets: ["리뷰 리스크 탐지", "상권 변동 알림", "매출 구간 경보"],
  },
  {
    step: "CHAPTER 02",
    title: "실행 루틴을 자동 설계",
    description:
      "사장님이 오늘 해야 할 일만 남깁니다. 매장 상황에 맞는 액션을 한 번에 제시합니다.",
    bullets: ["10분 루틴 생성", "캠페인 자동화", "콘텐츠 즉시 제작"],
  },
  {
    step: "CHAPTER 03",
    title: "성과를 축적하는 운영체제",
    description:
      "매일의 실행 데이터가 다음 성장을 설계합니다. 실적과 학습이 쌓이는 구조를 만듭니다.",
    bullets: ["지원금 매칭", "성과 리포트", "재구매 리텐션"],
  },
];

const metrics = [
  { label: "리뷰 응답 속도", value: "3.8배" },
  { label: "운영 시간 절감", value: "-28%" },
  { label: "월간 순매출", value: "+18%" },
];

const highlights = [
  {
    title: "AI 경영 요약",
    description: "하루 요약 리포트와 우선순위 액션을 자동 제공",
  },
  {
    title: "콘텐츠 자동 제작",
    description: "블로그·SNS·배너 카피를 즉시 생성",
  },
  {
    title: "지원금 추천",
    description: "조건에 맞는 지원사업을 실시간 매칭",
  },
];

export default function LandingPageV5() {
  return (
    <div className="landing-v5 gemini-root dplog-shell">
      <nav className="landing-v5-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link className="text-lg font-bold tracking-tight" href="/landing/dplog-alt">
            D-PLOG
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <Link className="hover-text-accent" href="/success-stories">
              성공 사례
            </Link>
            <Link className="hover-text-accent" href="/pricing">
              요금제
            </Link>
            <Link className="hover-text-accent" href="/dashboard">
              대시보드
            </Link>
          </div>
          <Link className="btn btn-primary btn-sm" href="/diagnosis/new">
            무료 진단 시작
          </Link>
        </div>
      </nav>

      <main className="landing-v5-main">
        <section className="landing-v5-hero">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">v5 리부트</p>
              <h1 className="landing-v5-hero-title font-black leading-tight">
                사장님은 현장에 집중하고,
                <span className="block text-accent">운영은 D-PLOG가 책임집니다</span>
              </h1>
              <p className="text-base text-white/70 md:text-lg">
                매출, 리뷰, 지원금, 마케팅을 한 흐름으로 묶어주는 경영 운영체제. 오늘의 실행 루틴까지
                자동으로 제공합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/diagnosis/new">
                  무료 진단 시작
                </Link>
                <Link className="btn btn-outline" href="/success-stories">
                  성과 사례 보기
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {["리뷰 자동화", "매출 경보", "지원금 추천", "콘텐츠 팩토리"].map((item) => (
                  <span key={item} className="landing-v5-chip">
                    {item}
                  </span>
                ))}
              </div>
              <div className="landing-v5-divider"></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((item) => (
                  <div key={item.label} className="landing-v5-metric">
                    <p className="text-2xl font-bold text-accent">{item.value}</p>
                    <p className="text-xs text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-v5-hero-media flex flex-col justify-between p-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60">오늘의 경영 리포트</p>
                <h3 className="mt-3 text-xl font-semibold">점심 매출이 14% 감소했습니다</h3>
                <p className="mt-2 text-sm text-white/60">
                  점심 쿠폰 자동 발행과 리뷰 알림 응답을 권장합니다.
                </p>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  "점심 쿠폰 캠페인 시작",
                  "리뷰 응답 자동화 활성화",
                  "메뉴 사진 리프레시",
                ].map((item) => (
                  <div key={item} className="landing-v5-chip">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[0.6fr_1.4fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">운영 스토리</p>
            <h2 className="text-3xl font-bold md:text-4xl">하루가 구조화되는 순간</h2>
            <p className="text-sm text-white/60 md:text-base">
              문제 인식부터 실행, 성과 축적까지 한 흐름으로 이어집니다. 이제 경영은 반복 가능한
              루틴이 됩니다.
            </p>
          </div>
          <div className="grid gap-6">
            {chapters.map((item) => (
              <div key={item.title} className="landing-v5-chapter">
                <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">{item.step}</p>
                <h3 className="mt-3 text-2xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/60">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.bullets.map((bullet) => (
                    <span key={bullet} className="landing-v5-chip">
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="landing-v5-card">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="landing-v5-cta">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-3xl font-bold">지금 바로 경영 루틴을 시작하세요</h3>
              <p className="mt-2 text-sm text-white/60">
                무료 진단으로 시작하고, 맞춤 실행 플랜을 받아보세요.
              </p>
            </div>
            <Link className="btn btn-primary" href="/diagnosis/new">
              무료 진단 시작
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
