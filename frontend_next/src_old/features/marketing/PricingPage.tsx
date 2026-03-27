"use client";

import Link from "next/link";

const plans = [
  {
    name: "베이직",
    price: "₩20,000",
    period: "/월",
    description:
      "단일 매장을 위한 기본 진단 패키지. 데이터 기반 운영을 시작하는 단계에 적합합니다.",
    cta: "베이직 시작",
    highlight: false,
    features: [
      "일일 매출 분석",
      "기본 AI 리뷰 요약",
      "카카오톡 데일리 리포트",
      "마케팅 자동화 제외",
    ],
  },
  {
    name: "프로",
    price: "₩50,000",
    period: "/월",
    description:
      "자동화 마케팅까지 포함한 풀 스택. 하루 커피 한 잔으로 AI 팀을 운영하세요.",
    cta: "시작하기",
    highlight: true,
    badge: "인기 선택",
    features: [
      "베이직 포함 전 기능",
      "자동 쿠폰 캠페인",
      "AI 경쟁사 분석",
      "메뉴 엔지니어링 제안",
      "우선 이메일 지원",
    ],
  },
  {
    name: "엔터프라이즈",
    price: "맞춤형",
    period: "",
    description:
      "프랜차이즈 및 멀티 매장용 맞춤형 API/리포트 제공.",
    cta: "상담 요청",
    highlight: false,
    features: [
      "프로 포함 전 기능",
      "멀티 매장 대시보드",
      "맞춤 API 연동",
      "전담 매니저 지원",
      "본사 리포팅",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="gemini-root dplog-shell">
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="flex items-center gap-3" href="/landing/dplog-alt">
            <span className="material-symbols-outlined text-accent">analytics</span>
            <span className="text-lg font-bold tracking-tight">D-PLOG</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link className="hover:text-white" href="/landing/dplog-alt">
              랜딩
            </Link>
            <Link className="hover:text-white" href="/success-stories">
              사례
            </Link>
            <Link className="hover:text-white" href="/dashboard">
              대시보드
            </Link>
            <Link className="text-accent" href="/pricing">
              요금제
            </Link>
          </div>
          <Link className="btn btn-primary btn-sm" href="/diagnosis/new">
            무료 시작
          </Link>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-16">
        <section className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            매출 성장을 자동화하세요
          </h1>
          <p className="mt-4 text-base text-white/70 md:text-lg">
            AI 진단과 자동화 마케팅으로 매출을 끌어올립니다. 복잡한 설정 없이 바로 시작하세요.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-accent-30 bg-white/5 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent-10 px-3 py-1 text-xs font-semibold uppercase text-accent">
                  정부 지원
                </span>
                <span className="text-xs text-white/60">한정 운영</span>
              </div>
              <h2 className="text-2xl font-bold">스마트상점·클라우드 바우처 매칭</h2>
              <p className="text-sm text-white/70 md:text-base">
                자격 요건에 따라 최대 80%까지 지원받을 수 있습니다. 사업자 정보를 입력해 확인하세요.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" type="button">
              지원 자격 확인
            </button>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              투명한 요금제
            </p>
            <h2 className="mt-3 text-3xl font-bold">알바 1시간 비용으로 시작하세요</h2>
            <p className="mt-2 text-sm text-white/60">
              숨겨진 비용 없이, 언제든 취소 가능합니다.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 transition ${
                  plan.highlight
                    ? "border-accent bg-white/10 shadow-[0_0_40px_var(--accent-glow)]"
                    : "border-white/10 bg-white/5 hover-border-accent-60"
                }`}
              >
                {plan.badge ? (
                  <span className="absolute -top-4 right-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-white/60">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-white/70">{plan.description}</p>
              <Link
                className={`mt-6 w-full ${
                  plan.highlight ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"
                }`}
                href="/diagnosis/new"
              >
                {plan.cta}
              </Link>
                <ul className="mt-6 space-y-3 text-sm text-white/70">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-accent">check_circle</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
