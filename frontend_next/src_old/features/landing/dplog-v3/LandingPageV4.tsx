"use client";

import Link from "next/link";

const stats = [
  { label: "운영 시간 절감", value: "-32%" },
  { label: "매출 상승", value: "+21%" },
  { label: "리뷰 응답 속도", value: "4배" },
];

const bento = [
  {
    title: "RAG 기반 경영 레이더",
    description: "리뷰, 상권, 매출을 한 화면에서 통합 분석해 핵심 시그널만 요약합니다.",
    span: "md:col-span-2 md:row-span-2",
    tone: "landing-v4-card-strong",
  },
  {
    title: "오늘의 미션",
    description: "10분 안에 실행 가능한 액션 플랜을 자동 생성합니다.",
  },
  {
    title: "지원금 스캐너",
    description: "사업자 조건과 매칭되는 지원사업을 실시간 추천합니다.",
  },
  {
    title: "콘텐츠 팩토리",
    description: "블로그, 인스타그램, 전단지 카피까지 한 번에 제작합니다.",
    span: "md:col-span-2",
  },
  {
    title: "상권 인텔리전스",
    description: "경쟁 매장과 비교 지표를 한눈에 제공합니다.",
  },
];

const testimonials = [
  {
    name: "박지훈 셰프",
    role: "라 트라토리아",
    quote: "주간 미션만 따라갔는데 매출이 다시 살아났습니다."
  },
  {
    name: "김민수 대표",
    role: "강남 브런치",
    quote: "리뷰 대응이 자동화되니 고객 문의 응대 시간이 줄었어요."
  },
  {
    name: "이서윤 대표",
    role: "카페 루멘",
    quote: "지원금 추천 덕분에 인테리어 비용을 절감했습니다."
  },
];

export default function LandingPageV4() {
  return (
    <div className="landing-v4 gemini-root dplog-shell">
      <nav className="landing-v4-nav">
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

      <main className="landing-v4-main">
        <section className="landing-v4-hero">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">v4 경영 운영체제</p>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                사장님을 위한
                <span className="block text-accent">올인원 경영 레이더</span>
              </h1>
              <p className="text-base text-white/70 md:text-lg">
                매출, 리뷰, 지원금, 마케팅을 한 곳에서 관리하세요. 오늘 실행할 액션까지 자동으로 설계합니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn-primary" href="/diagnosis/new">
                  무료 진단 시작
                </Link>
                <Link className="btn btn-outline" href="/success-stories">
                  성과 사례 보기
                </Link>
              </div>
              <div className="grid gap-4 pt-6 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="landing-v4-stat">
                    <p className="text-2xl font-bold text-accent">{item.value}</p>
                    <p className="text-xs text-white/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-v4-hero-panel">
              <div className="landing-v4-panel-card">
                <p className="text-xs uppercase tracking-widest text-white/50">이번 주 핵심 요약</p>
                <h3 className="mt-3 text-xl font-semibold">고객 유입이 18% 하락했습니다</h3>
                <p className="mt-2 text-sm text-white/60">
                  리뷰 답변 속도를 높이고, 점심 쿠폰 캠페인을 바로 실행하세요.
                </p>
                <div className="mt-6 grid gap-3">
                  {[
                    "리뷰 답변 자동화",
                    "점심 시간 쿠폰 발행",
                    "메뉴 사진 업데이트",
                  ].map((item) => (
                    <div key={item} className="landing-v4-pill">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="landing-v4-panel-card landing-v4-panel-card-muted">
                <p className="text-xs uppercase tracking-widest text-white/50">지원금 매칭</p>
                <h3 className="mt-3 text-xl font-semibold">2.5억 원 지원금 후보</h3>
                <p className="mt-2 text-sm text-white/60">
                  창업 패키지 1건, 정책자금 42건이 추가 매칭되었습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-v4-bento">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">핵심 기능</p>
              <h2 className="text-3xl font-bold md:text-4xl">경영에 필요한 모든 순간</h2>
              <p className="text-sm text-white/60 md:text-base">
                실시간 데이터와 실행 루틴을 한 화면에 담아 즉시 행동할 수 있게 합니다.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {bento.map((item) => (
                <div
                  key={item.title}
                  className={`landing-v4-card ${item.span ?? ""} ${item.tone ?? ""}`}
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v4-proof">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-accent-soft">신뢰 지표</p>
              <h2 className="text-3xl font-bold md:text-4xl">현장에서 검증된 루틴</h2>
              <p className="text-sm text-white/60 md:text-base">
                2,500개 매장이 실행한 루틴을 표준화해 제공합니다. 리뷰, 쿠폰, 콘텐츠 제작까지 자동화합니다.
              </p>
              <Link className="btn btn-outline btn-sm" href="/pricing">
                요금제 확인
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.name} className="landing-v4-testimonial">
                  <p className="text-sm text-white/70">“{item.quote}”</p>
                  <div className="mt-4 text-xs text-white/50">
                    {item.name} · {item.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v4-cta">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-3xl font-bold">오늘부터 성장 루틴을 시작하세요</h3>
              <p className="mt-2 text-sm text-white/60">
                무료 진단으로 시작하고, 맞춤형 실행 플랜을 받아보세요.
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
