"use client";

import Link from "next/link";

export default function DiagnosisStep1Page() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="min-h-screen px-4 pb-16">
        <header className="mx-auto flex max-w-4xl items-center justify-between py-6">
          <Link className="flex items-center gap-2" href="/landing/dplog-alt">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-15 text-accent">
              <span className="material-symbols-outlined">insights</span>
            </div>
            <span className="text-lg font-bold">D-PLOG</span>
          </Link>
          <Link className="text-sm text-white/60 hover:text-white" href="/landing/dplog-alt">
            진단 나가기
          </Link>
        </header>

        <main className="mx-auto flex max-w-4xl flex-col items-center justify-center">
          <div className="mb-8 w-full">
            <div className="mb-3 flex justify-between text-xs font-semibold text-white/60">
              <span className="text-accent">1단계: 사업 정보</span>
              <span>2단계: 데이터 연결</span>
              <span>3단계: AI 분석</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-accent"></div>
            </div>
          </div>

          <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
            <div className="text-center">
              <h1 className="text-3xl font-bold">매장 건강 상태를 분석합니다</h1>
              <p className="mt-3 text-sm text-white/60">
                기본 정보를 입력하면 무료 매출 리포트를 생성합니다.
              </p>
            </div>

            <form className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-semibold text-white/70" htmlFor="restaurant-name">
                  매장명
                </label>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black px-4 py-3">
                  <span className="material-symbols-outlined text-white/40">storefront</span>
                  <input
                    id="restaurant-name"
                    className="ml-3 flex-1 bg-transparent text-sm text-white placeholder-white/40 focus-visible:outline-none"
                    type="text"
                    defaultValue="라 트라토리아 다운타운"
                    placeholder="예: 더 이탈리안 테이블"
                  />
                  <span className="material-symbols-outlined text-accent">check_circle</span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-300">warning</span>
                  <div>
                    <p className="font-semibold">초기 스캔 알림</p>
                    <p className="mt-1 text-white/70">
                      최근 48시간 내 부정 리뷰 3건이 감지되었습니다. 지역 노출에 영향을 줄 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/70" htmlFor="location">
                  사업장 주소 또는 도시
                </label>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black px-4 py-3">
                  <span className="material-symbols-outlined text-white/40">location_on</span>
                  <input
                    id="location"
                    className="ml-3 flex-1 bg-transparent text-sm text-white placeholder-white/40 focus-visible:outline-none"
                    type="text"
                    placeholder="예: 서울 강남구 테헤란로 123"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-white/70" htmlFor="cuisine">
                    업종/음식 종류
                  </label>
                  <select
                    id="cuisine"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white"
                  >
                    <option>이탈리안</option>
                    <option>아메리칸</option>
                    <option>일식</option>
                    <option>한식</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/70" htmlFor="role">
                    직책
                  </label>
                  <select
                    id="role"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black px-3 py-3 text-sm text-white"
                  >
                    <option>대표</option>
                    <option>매니저</option>
                    <option>마케팅</option>
                  </select>
                </div>
              </div>

              <Link className="btn btn-primary btn-lg w-full" href="/diagnosis/new/age-group">
                분석 시작
              </Link>

              <p className="text-center text-xs text-white/50">
                <span className="material-symbols-outlined text-sm align-middle">lock</span> 데이터는 암호화되어
                안전하게 보호됩니다.
                <span className="block mt-1 text-[10px]">
                  <Link className="text-accent-soft hover-text-accent-softest" href="/diagnosis/new/age-group">
                    입력 없이 다음으로
                  </Link>
                </span>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
