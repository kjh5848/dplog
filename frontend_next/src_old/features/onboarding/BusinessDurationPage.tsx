"use client";

import Link from "next/link";

const options = [
  {
    title: "예비 창업자",
    subtitle: "사업자 등록 전",
    icon: "emoji_objects",
  },
  {
    title: "초기 창업자",
    subtitle: "1년 미만",
    icon: "rocket_launch",
  },
  {
    title: "도약기 창업자",
    subtitle: "3년 미만",
    icon: "trending_up",
  },
];

export default function BusinessDurationPage() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="min-h-screen px-4 pb-16">
        <header className="mx-auto flex max-w-3xl items-center justify-between py-6">
          <Link className="flex items-center gap-2" href="/landing/dplog-alt">
            <span className="material-symbols-outlined text-2xl text-accent">explore</span>
            <span className="text-lg font-bold">패스파인더</span>
          </Link>
          <Link className="text-sm text-white/60 hover:text-white" href="/landing/dplog-alt">
            저장 후 나가기
          </Link>
        </header>

        <main className="mx-auto flex max-w-3xl flex-col gap-8">
          <div>
            <div className="flex justify-between text-xs text-white/60">
              <span className="font-semibold uppercase">1단계 / 4</span>
              <span>온보딩 진행</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
              <div className="h-full w-1/4 rounded-full bg-accent"></div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold">창업하신 지 얼마나 되셨나요?</h1>
            <p className="mt-2 text-sm text-white/60">
              맞춤형 정부 지원사업과 로드맵을 추천해 드립니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {options.map((option) => (
              <label key={option.title} className="group cursor-pointer">
                <input className="peer sr-only" type="radio" name="duration" />
                <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition peer-checked:border-accent peer-checked:bg-accent-10 hover-border-accent-70">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-10 text-accent">
                    <span className="material-symbols-outlined text-3xl">{option.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{option.title}</h3>
                    <p className="text-sm text-white/60">{option.subtitle}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Link className="btn btn-outline btn-sm" href="/diagnosis/new/age-group">
              이전
            </Link>
            <Link className="btn btn-primary btn-sm" href="/diagnosis/new/region-selection">
              다음으로
            </Link>
          </div>

          <div className="text-center">
            <Link
              className="text-xs text-white/50 hover-text-accent-soft"
              href="/diagnosis/new/region-selection"
            >
              왜 이 정보가 필요한가요?
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
