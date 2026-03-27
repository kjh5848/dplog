"use client";

import Link from "next/link";

const stories = [
  {
    name: "버거 앤 배럴",
    location: "브루클린",
    tag: "캐주얼 다이닝",
    roi: "+215%",
    quote:
      "부정 리뷰 대응 속도가 핵심이었어요. AI 답변으로 3주 만에 평점이 회복됐습니다.",
    metric: "4,200만 원",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZZiwLzCaLfSEQ3v8mPyW1sybx8n5rHd86kH89sdR0_tcqZNuluhCXg2FZP0DOkgBthdujpfV0CRXF-fY3Bx_0yDTtGOTEAV2RVDKbAUIDZlcmDhmV56SSWOoG5_jKog_KUs0H1JltmI2b0gD-f2pqiFniHDidRWVWZsMyeO810889vM34CEzSr8kIlcaLT7I9Q46mUSmgnuvW9ChLLZcUHYJGq6N-Kbm1FkTA92RaBpOUUPh1XINo8cq8Rp9eJ6-cQb59uUnZ-ql7",
  },
  {
    name: "카페 루멘",
    location: "서울",
    tag: "커피/카페",
    roi: "+140%",
    quote:
      "키워드 최적화와 콘텐츠 자동화가 매출을 바꿨습니다. 리뷰 유입이 2배로 늘었어요.",
    metric: "4.9/5",
    image: "https://picsum.photos/800/600?random=21",
  },
  {
    name: "소라 이자카야",
    location: "부산",
    tag: "파인다이닝",
    roi: "+180%",
    quote:
      "지역 타깃 캠페인을 자동화하니 예약이 다시 꽉 찼습니다.",
    metric: "22%",
    image: "https://picsum.photos/800/600?random=22",
  },
];

export default function SuccessStoriesPage() {
  return (
    <div className="gemini-root dplog-shell">
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link className="flex items-center gap-3" href="/landing/dplog-alt">
            <span className="material-symbols-outlined text-accent">restaurant_menu</span>
            <span className="text-lg font-bold">D-PLOG</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <Link className="hover:text-white" href="/landing/dplog-alt">
              플랫폼
            </Link>
            <Link className="hover:text-white" href="/pricing">
              요금제
            </Link>
            <Link className="hover:text-white" href="/dashboard">
              대시보드
            </Link>
            <Link className="text-accent" href="/success-stories">
              성공 사례
            </Link>
          </div>
          <Link className="btn btn-primary btn-sm" href="/diagnosis/new">
            데모 신청
          </Link>
        </div>
      </nav>

      <main className="pt-24">
        <section className="relative overflow-hidden px-4 pb-16">
          <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-accent-20 blur-[120px]"></div>
          <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-accent-10 blur-[120px]"></div>
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-30 bg-accent-10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse motion-reduce:animate-none"></span>
              검증된 성과
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
              현장에서 증명된 <span className="text-accent">실제 성과</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 md:text-lg">
              2,500+ 사장님이 90일 내 평균 22% 성장을 경험했습니다.
            </p>
            <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left md:grid-cols-4">
              <div>
                <p className="text-2xl font-bold">4,500만+</p>
                <p className="text-xs uppercase tracking-widest text-white/50">누적 매출</p>
              </div>
              <div className="border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="text-2xl font-bold text-accent">22%</p>
                <p className="text-xs uppercase tracking-widest text-white/50">평균 성장</p>
              </div>
              <div className="border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="text-2xl font-bold">12.5만</p>
                <p className="text-xs uppercase tracking-widest text-white/50">리뷰 분석</p>
              </div>
              <div className="border-t border-white/10 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                <p className="text-2xl font-bold">4.8/5</p>
                <p className="text-xs uppercase tracking-widest text-white/50">플랫폼 평점</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-16 z-40 border-y border-white/10 bg-black/80 px-4 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              {["전체 사례", "파인다이닝", "캐주얼 다이닝", "커피/카페", "고스트 키친"].map(
                (label, index) => (
                <button
                  key={label}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
                    index === 0
                      ? "bg-accent text-black"
                      : "border border-white/15 text-white/70 hover-border-accent hover:text-white"
                  }`}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>정렬</span>
              <select className="rounded-md border border-white/10 bg-black px-3 py-2 text-xs text-white">
                <option>수익률 높은 순</option>
                <option>최신 순</option>
                <option>매출 영향 순</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.name}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover-border-accent-60"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={`${story.name} 매장 사진`}
                  className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="rounded-full border border-accent-30 bg-accent-10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-soft">
                        {story.tag}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-white">{story.name}</h3>
                      <p className="text-xs text-white/70">
                        <span className="material-symbols-outlined text-[14px] align-middle">place</span> {story.location}
                      </p>
                    </div>
                    <div className="rounded-lg border border-accent-30 bg-black/70 px-3 py-2 text-center">
                      <div className="text-[10px] uppercase text-accent-soft">수익률</div>
                      <div className="text-base font-bold text-accent">{story.roi}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-white/40">월간 매출 추이</p>
                  <div className="mt-4 flex items-end gap-2">
                    {[30, 35, 32, 55, 70, 85].map((height, index) => (
                      <div
                        key={`${story.name}-${index}`}
                        className={`w-full rounded-t-sm ${index < 3 ? "bg-white/20" : "bg-accent-70"}`}
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 border-l-2 border-accent-40 pl-4 text-sm text-white/70 italic">
                  “{story.quote}”
                </div>
                <div className="mt-auto pt-6 text-xs text-white/50">
                  핵심 지표: <span className="text-accent font-semibold">{story.metric}</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
