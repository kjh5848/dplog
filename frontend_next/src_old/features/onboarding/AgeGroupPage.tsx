"use client";

import Link from "next/link";

const options = [
  {
    title: "만 39세 이하",
    desc: "청년 창업 우대 혜택을 받을 수 있습니다.",
    icon: "face_6",
  },
  {
    title: "만 39세 초과",
    desc: "일반 창업 및 중장년 기술창업 지원을 매칭합니다.",
    icon: "psychology",
  },
];

export default function AgeGroupPage() {
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
              <span className="font-semibold uppercase">2단계 / 5</span>
              <span>프로필 설정</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
              <div className="h-full w-2/5 rounded-full bg-accent"></div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold">대표님의 연령대는?</h1>
            <p className="mt-2 text-sm text-white/60">
              정부 지원사업 매칭을 위해 필요한 정보입니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {options.map((option) => (
              <label key={option.title} className="group cursor-pointer">
                <input className="peer sr-only" type="radio" name="age" />
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition peer-checked:border-accent peer-checked:bg-accent-10 hover-border-accent-70">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-10 text-accent">
                    <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold">{option.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-white/70">
            <span className="material-symbols-outlined align-middle text-accent">info</span>
            <span className="ml-2">
              만 39세는 주요 지원사업의 청년 우대 기준이 됩니다. 정확히 선택해주세요.
            </span>
          </div>

          <div className="flex items-center justify-between">
            <Link className="btn btn-outline btn-sm" href="/diagnosis/new">
              이전
            </Link>
            <Link className="btn btn-primary btn-sm" href="/diagnosis/new/business-duration">
              다음
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
