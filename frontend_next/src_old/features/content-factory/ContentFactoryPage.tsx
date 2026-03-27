"use client";

import Link from "next/link";

const templates = ["친근하고 캐주얼", "파인다이닝 & 고급", "긴급 프로모션"];
const outputs = ["인스타그램 게시물", "블로그 글", "이메일 뉴스레터"];
const navItems = [
  { label: "대시보드", href: "/dashboard", icon: "dashboard" },
  { label: "콘텐츠 팩토리", href: "/content-factory", icon: "auto_awesome" },
  { label: "진단", href: "/diagnosis/new", icon: "insights" },
  { label: "요금제", href: "/pricing", icon: "payments" },
  { label: "사례", href: "/success-stories", icon: "stars" },
];

export default function ContentFactoryPage() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="flex min-h-screen overflow-hidden">
        <aside className="glass-panel hidden w-20 flex-col border-r border-white/10 lg:flex lg:w-64">
          <div className="flex h-16 items-center justify-center border-b border-white/10 lg:justify-start lg:px-6">
            <Link className="flex items-center" href="/landing/dplog-alt">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-black">
                <span className="material-symbols-outlined text-sm">restaurant_menu</span>
              </div>
              <span className="ml-3 hidden text-sm font-bold lg:block">D-PLOG</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  item.label === "콘텐츠 팩토리"
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
                className="h-10 w-10 rounded-full object-cover"
                alt="대표 프로필"
                src="https://picsum.photos/100/100?random=15"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-medium">박지훈 셰프</p>
                <p className="text-xs text-white/50">라 트라토리아</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/70 px-6">
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>새 캠페인 / 주말 스페셜</span>
              <Link className="text-accent-soft hover-text-accent-softest" href="/dashboard">
                대시보드로 돌아가기
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden rounded-full border border-accent-30 bg-accent-10 px-3 py-1 text-xs font-semibold text-accent-soft md:inline-flex">
                45 크레딧
              </span>
              <Link className="text-white/60 hover-text-accent-soft" aria-label="저장" href="/dashboard">
                <span className="material-icons-outlined">save</span>
              </Link>
              <Link className="btn btn-primary btn-sm" href="/dashboard">
                원클릭 발행
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col lg:flex-row">
            <section className="flex-1 border-r border-white/10 bg-black/40">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <select className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white">
                    {templates.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <select className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white">
                    {outputs.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { icon: "autorenew", label: "재생성" },
                    { icon: "compress", label: "축약" },
                    { icon: "expand", label: "확장" },
                  ].map((action) => (
                    <button
                      key={action.icon}
                      className="rounded-lg p-2 text-white/60 hover-text-accent-soft"
                      aria-label={action.label}
                      type="button"
                    >
                      <span className="material-icons-outlined text-lg">{action.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-white/10 px-6 py-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  집중 항목
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-rgb))]"
                    type="text"
                    defaultValue="매운 참치 롤 - 20% 할인"
                  />
                  <button className="btn btn-outline btn-sm" type="button">
                    업데이트
                  </button>
                </div>
              </div>

              <div className="relative flex-1 overflow-y-auto px-6 py-6">
                <h2 className="text-2xl font-bold">금요일 밤 스페셜</h2>
                <div className="mt-4 space-y-4 text-sm text-white/70">
                  <p>
                    이번 주말에 매출을 올릴 가장 빠른 방법은 대표 메뉴를 집중 홍보하는 것입니다. 고객이
                    선호하는 매운 메뉴를 강조해보세요.
                  </p>
                  <p>
                    AI 분석 결과, 매운 메뉴와 시원한 음료의 조합이 금요일 매출을 18% 끌어올렸습니다.
                    오늘밤 한정 프로모션을 제안해보세요.
                  </p>
                  <p className="text-white/50">#매운참치 #금요일밤 #동네맛집</p>
                </div>
                <div className="absolute bottom-6 right-6 rounded-full border border-accent-30 bg-black/80 px-3 py-1 text-xs text-accent-soft animate-pulse motion-reduce:animate-none">
                  AI 작성 중...
                </div>
              </div>
            </section>

            <section className="flex w-full flex-col bg-black px-6 py-6 lg:w-1/3">
              <h3 className="text-lg font-semibold">미리보기</h3>
              <div className="mt-4 flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="aspect-[9/16] w-full rounded-xl border border-white/10 bg-black/80 p-4 text-sm text-white/70">
                  <p className="text-base font-semibold text-white">매운 참치 주말</p>
                  <p className="mt-2">오늘 밤 방문 시 20% 할인! 인기 메뉴와 함께하세요.</p>
                  <div className="mt-4 h-40 rounded-lg bg-white/10"></div>
                </div>
              </div>
              <Link className="btn btn-primary btn-sm mt-4 w-full" href="/dashboard">
                인스타그램으로 보내기
              </Link>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
