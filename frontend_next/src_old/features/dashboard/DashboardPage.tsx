"use client";

import Link from "next/link";

const missions = [
  {
    title: "부정 리뷰 3건 답변",
    tag: "긴급",
    insight:
      "부정 리뷰에 답변하지 않으면 신뢰도가 15% 하락합니다. 24시간 내 답변 시 손실의 40%를 회복할 수 있습니다.",
  },
  {
    title: "신규 음식 사진 2장 업로드",
    tag: "성장",
    insight:
      "최근 14일간 신규 사진 게시 매장은 클릭률이 27% 높습니다.",
  },
  {
    title: "점심 시간 쿠폰 발행",
    tag: "기회",
    insight:
      "오피스 밀집 지역 점심 매출은 쿠폰 적용 시 평균 18% 상승합니다.",
  },
];

export default function DashboardPage() {
  const navItems = [
    { label: "대시보드", href: "/dashboard", icon: "dashboard" },
    { label: "콘텐츠 팩토리", href: "/content-factory", icon: "auto_awesome" },
    { label: "진단", href: "/diagnosis/new", icon: "insights" },
    { label: "요금제", href: "/pricing", icon: "payments" },
    { label: "사례", href: "/success-stories", icon: "stars" },
  ];

  return (
    <div className="gemini-root dplog-shell theme-v2">
      <div className="flex min-h-screen">
        <aside className="glass-panel hidden w-20 flex-col justify-between border-r border-white/10 lg:flex lg:w-64">
          <div className="border-b border-white/10 px-6 py-6">
            <Link className="flex items-center gap-3" href="/landing/dplog-alt">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-15 text-accent">
                <span className="material-symbols-outlined">auto_graph</span>
              </div>
              <span className="hidden text-lg font-bold lg:block">D-PLOG</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 text-sm">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  index === 0
                    ? "bg-accent-15 text-accent-soft"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
                href={item.href}
              >
                <span className="material-symbols-outlined text-base">{item.icon}</span>
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3">
              <img
                alt="대표 프로필"
                className="h-10 w-10 rounded-full object-cover"
                src="https://picsum.photos/100/100?random=12"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-semibold">김민수 셰프</p>
                <p className="text-xs text-white/50">서울 강남</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-10">
          <div className="mx-auto max-w-4xl">
            <header className="mb-8">
              <h1 className="text-3xl font-bold">이번 주 매출 미션</h1>
              <p className="mt-2 text-sm text-white/60">
                AI 추천 액션을 완료하면 네이버 플레이스 지수가 상승합니다.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="btn btn-primary btn-sm" href="/content-factory">
                  콘텐츠 팩토리 이동
                </Link>
                <Link className="btn btn-outline btn-sm" href="/diagnosis/new">
                  진단 시작
                </Link>
              </div>
            </header>

            <section className="glass-panel rounded-2xl p-6">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-semibold">주간 미션 TOP 5</h2>
                  <p className="text-sm text-white/60">5개 중 3개 완료</p>
                </div>
                <div className="text-3xl font-bold text-accent">60%</div>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-white/10">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[rgb(var(--accent-rgb)/0.6)] to-[rgb(var(--accent-rgb))] glow-ring"></div>
              </div>
            </section>

            <section className="mt-8 space-y-4">
              {missions.map((mission) => (
                <div
                  key={mission.title}
                  className="glass-card rounded-xl p-5 transition hover-border-accent-40"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{mission.title}</h3>
                        <span className="rounded-full border border-accent-40 bg-accent-10 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-soft">
                          {mission.tag}
                        </span>
                      </div>
                      <div className="mt-3 rounded-lg border border-accent-20 bg-accent-5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-soft">
                          AI 인사이트
                        </p>
                        <p className="mt-1 text-sm text-white/70">{mission.insight}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" type="button">
                      자동 초안
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
