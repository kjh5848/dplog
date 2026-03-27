"use client";

import Link from "next/link";

const messages = [
  {
    role: "ai",
    text: "안녕하세요. 비즈니스 플랜 작성을 이어갈게요. 먼저 시그니처 메뉴를 알려주세요.",
  },
  {
    role: "user",
    text: "지역 농장에서 공급받는 꿀과 오트밀크로 만든 라떼가 있습니다.",
  },
];

export default function AiInterviewPage() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/80 px-6">
          <div className="flex items-center gap-3">
            <Link className="flex items-center gap-3" href="/landing/dplog-alt">
              <span className="material-symbols-outlined text-2xl text-accent">explore</span>
              <span className="text-lg font-bold">패스파인더</span>
            </Link>
            <span className="hidden text-xs text-white/50 md:inline">프로젝트: 내 카페 사업계획서</span>
          </div>
          <div className="flex items-center gap-3">
            <Link className="hidden btn btn-outline btn-sm md:inline-flex" href="/dashboard">
              임시 저장
            </Link>
            <Link className="btn btn-primary btn-sm" href="/dashboard">
              인터뷰 종료
            </Link>
          </div>
        </header>

        <main className="flex flex-1 overflow-hidden">
          <section className="flex w-full flex-col border-r border-white/10 bg-black/60 md:w-[55%]">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-widest text-white/50">진행률</span>
                <span className="text-sm font-semibold text-accent">47% 완료</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div className="h-full w-[47%] rounded-full bg-accent"></div>
              </div>
              <p className="mt-2 text-xs text-white/50">15개 중 7개 완료</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex max-w-[90%] gap-3 ${
                    message.role === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                      message.role === "user"
                        ? "border-accent-30 bg-accent-10 text-accent-soft"
                        : "border-white/10 bg-white/5 text-accent-soft"
                    }`}
                  >
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-accent text-black"
                        : "border border-white/10 bg-white/5 text-white/80"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div className="flex max-w-[90%] items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-accent-soft">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
                  <span className="h-2 w-2 rounded-full bg-white/40 animate-pulse motion-reduce:animate-none"></span>
                  <span className="h-2 w-2 rounded-full bg-white/40 animate-pulse motion-reduce:animate-none"></span>
                  <span className="h-2 w-2 rounded-full bg-white/40 animate-pulse motion-reduce:animate-none"></span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {[
                  "예시 보여줘",
                  "용어 설명",
                  "질문 건너뛰기",
                ].map((label) => (
                  <button
                    key={label}
                    className="whitespace-nowrap rounded-full border border-white/10 bg-black px-3 py-2 text-xs text-white/60 hover-border-accent hover:text-white"
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-rgb))]"
                  placeholder="답변을 입력하세요..."
                />
                <Link className="btn btn-primary btn-sm" href="/dashboard">
                  전송
                </Link>
              </div>
            </div>
          </section>

          <section className="hidden w-[45%] flex-col gap-6 bg-black/80 px-6 py-6 md:flex">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">사업계획서 구성</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">check_circle</span>
                  브랜드 요약
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">check_circle</span>
                  타깃 고객
                </li>
                <li className="flex items-center gap-2 text-white/50">
                  <span className="material-symbols-outlined">radio_button_unchecked</span>
                  시그니처 메뉴
                </li>
                <li className="flex items-center gap-2 text-white/50">
                  <span className="material-symbols-outlined">radio_button_unchecked</span>
                  마케팅 전략
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">AI 팁</h3>
              <p className="mt-2 text-sm text-white/60">
                고객에게 가장 강하게 각인되는 요소는 "지역성"과 "시그니처 스토리"입니다. 재료의 출처를 강조해 보세요.
              </p>
              <Link className="btn btn-outline btn-sm mt-4" href="/dashboard">
                완료하고 대시보드로
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
