"use client";

import Link from "next/link";

const stats = [
  {
    title: "전체 지원금",
    value: "45",
    sub: "건",
    accent: "text-accent",
    icon: "analytics",
    note: "동종 업계 평균 대비 +12%",
  },
  {
    title: "예상 지원 규모",
    value: "2.5",
    sub: "억 원",
    accent: "text-accent",
    icon: "savings",
    note: "높은 매칭 확률",
  },
];

const breakdown = [
  {
    title: "연구개발 지원",
    desc: "기술개발 지원 2건이 확인되었습니다.",
    icon: "science",
    badge: "우선 추천",
  },
  {
    title: "창업 패키지",
    desc: "성장 패키지 1건이 확인되었습니다.",
    icon: "rocket_launch",
    badge: "추천",
  },
  {
    title: "정책자금",
    desc: "금융 지원 옵션 42건이 있습니다.",
    icon: "account_balance",
    badge: "최다",
  },
];

export default function GrantResultsPage() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="min-h-screen px-4 pb-20">
        <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
          <Link className="flex items-center gap-2" href="/landing/dplog-alt">
            <span className="material-symbols-outlined text-2xl text-accent">explore</span>
            <span className="text-lg font-bold">패스파인더</span>
          </Link>
          <Link
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
            href="/dashboard"
          >
            내 프로필
          </Link>
        </header>

        <main className="mx-auto flex max-w-5xl flex-col gap-12">
          <section className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-15 text-accent">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-accent">
              분석 완료
            </p>
            <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
              받을 수 있는 지원금 <span className="text-accent">총 45건</span>
              <br className="hidden md:block" />
              (약 <span className="text-accent">2.5억 원</span>) 입니다.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60">
              대표님 프로필 기준으로 높은 확률의 매칭이 확인되었습니다. 지금 바로 계획서를 이어서 작성해보세요.
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover-border-accent-60"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
                  <span className="material-symbols-outlined text-accent">{stat.icon}</span>
                  {stat.title}
                </div>
                <div className="mt-4 text-4xl font-bold">
                  <span className={stat.accent}>{stat.value}</span>
                  <span className="ml-2 text-base text-white/50">{stat.sub}</span>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4 text-xs text-accent-soft">
                  {stat.note}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold">지원금 구성</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {breakdown.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-10 text-accent">
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <span className="rounded-full border border-accent-30 px-2 py-1 text-[10px] text-accent-soft">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-black/80 p-8 text-center">
            <h2 className="text-2xl font-bold">이제 계획서를 써볼까요?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              AI 비서가 단계별로 계획서 작성을 도와드립니다. 매칭된 45건의 지원금에 바로 도전해보세요.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className="btn btn-primary btn-sm" href="/diagnosis/new/ai-interview">
                사업계획서 시작
              </Link>
              <Link className="btn btn-outline btn-sm" href="/dashboard">
                전체 목록 보기
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
