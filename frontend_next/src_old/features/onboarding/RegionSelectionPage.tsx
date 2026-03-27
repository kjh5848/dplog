"use client";

import Link from "next/link";

const regions = [
  { name: "서울", local: "특별시", icon: "location_city", active: true },
  { name: "부산", local: "광역시", icon: "sailing" },
  { name: "대구", local: "광역시", icon: "temple_buddhist" },
  { name: "인천", local: "광역시", icon: "flight_takeoff" },
  { name: "광주", local: "광역시", icon: "palette" },
  { name: "대전", local: "광역시", icon: "science" },
  { name: "울산", local: "광역시", icon: "factory" },
  { name: "세종", local: "특별자치시", icon: "account_balance" },
  { name: "경기", local: "도", icon: "subway" },
  { name: "강원", local: "도", icon: "landscape" },
  { name: "충북", local: "도", icon: "nature" },
  { name: "제주", local: "특별자치도", icon: "sunny" },
];

export default function RegionSelectionPage() {
  return (
    <div className="gemini-root dplog-shell">
      <div className="min-h-screen px-4 pb-16">
        <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
          <Link className="flex items-center gap-2" href="/landing/dplog-alt">
            <span className="material-symbols-outlined text-2xl text-accent">explore</span>
            <span className="text-lg font-bold">패스파인더</span>
          </Link>
          <Link className="text-sm text-white/60 hover:text-white" href="/landing/dplog-alt">
            저장 후 나가기
          </Link>
        </header>

        <main className="mx-auto flex max-w-5xl flex-col gap-8">
          <div>
            <div className="flex justify-between text-xs text-white/60">
              <span className="font-semibold uppercase">2단계 / 4</span>
              <span className="text-accent">25%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/10">
              <div className="h-full w-1/4 rounded-full bg-accent"></div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold">어디서 시작하시나요?</h1>
            <p className="mt-2 text-sm text-white/60">
              사업자 등록 예정지 혹은 현재 사업장 소재지를 선택해주세요. 해당 지역의 지원금과 혜택을
              찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {regions.map((region) => (
              <button
                key={region.name}
                className={`relative flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition ${
                  region.active
                    ? "border-accent bg-accent-10"
                    : "border-white/10 bg-white/5 hover-border-accent-70"
                }`}
                type="button"
              >
                {region.active ? (
                  <span className="material-symbols-outlined absolute right-2 top-2 text-accent">
                    check_circle
                  </span>
                ) : null}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-accent-soft">
                  <span className="material-symbols-outlined text-3xl">{region.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{region.name}</p>
                  <p className="text-xs text-white/60">{region.local}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
            <Link className="btn btn-outline btn-sm" href="/diagnosis/new/business-duration">
              이전
            </Link>
            <Link className="btn btn-primary btn-sm" href="/diagnosis/new/grant-results">
              다음
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
