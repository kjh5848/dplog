import React from 'react';
import { ArrowUpRight, BarChart3, Radar, Sparkles, ShieldCheck } from 'lucide-react';

interface LandingPageAltProps {
  onStart: () => void;
}

const LandingPageAlt: React.FC<LandingPageAltProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-black tracking-tight">
            D-PLOG
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="#signal" className="hover:text-slate-900">Signal</a>
            <a href="#insight" className="hover:text-slate-900">Insight</a>
            <a href="#proof" className="hover:text-slate-900">Proof</a>
            <a href="#cta" className="hover:text-slate-900">Start</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/?variant=base"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400"
            >
              기본 버전
            </a>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              바로 진단 <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            Local SEO Intelligence
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            매장 순위를
            <br />
            <span className="text-blue-800">데이터로 설계</span>
            합니다.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            네이버 플레이스 순위, 경쟁 매장, 키워드 흐름을 통합 분석해 실행 가능한 성장 로드맵을 제공합니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300"
            >
              맞춤 리포트 생성 <ArrowUpRight className="h-4 w-4" />
            </button>
            <button className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400">
              샘플 리포트 보기
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-3" id="signal">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-400">상위 5위 진입률</div>
              <div className="mt-4 text-3xl font-black text-slate-900">78%</div>
              <div className="mt-2 text-sm text-slate-500">4주 내 개선 사례 기준</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-400">분석 키워드</div>
              <div className="mt-4 text-3xl font-black text-slate-900">1,240+</div>
              <div className="mt-2 text-sm text-slate-500">카테고리별 추천 데이터</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-400">실행 체크리스트</div>
              <div className="mt-4 text-3xl font-black text-slate-900">16</div>
              <div className="mt-2 text-sm text-slate-500">진단 결과 기본 제공</div>
            </div>
          </div>
        </section>

        <section id="insight" className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Insight Flow</p>
                <h2 className="mt-4 text-3xl font-black text-slate-900 md:text-4xl">
                  AI가 시장과 경쟁을 읽고 바로 실행 가능한 전략을 만듭니다.
                </h2>
                <p className="mt-4 text-slate-600">
                  진단 요청 후 5분 내에 핵심 문제와 성장 기회를 요약합니다. 실행 포인트는 바로 적용 가능한 체크리스트로 제공됩니다.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-800" />
                    <h3 className="text-lg font-bold">시장 강도 스코어링</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">지역별/업종별 경쟁 강도를 수치화해 진입 전략을 제안합니다.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <Radar className="h-5 w-5 text-blue-800" />
                    <h3 className="text-lg font-bold">경쟁 매장 포지셔닝</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">상위 5개 매장과 비교해 부족한 리뷰, 사진, 키워드를 확인합니다.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-blue-800" />
                    <h3 className="text-lg font-bold">맞춤 실행 로드맵</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">우선순위 기반 액션 플랜을 즉시 실행하도록 제공합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="proof" className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-amber-500" />
              <h3 className="mt-6 text-xl font-bold">검증된 성과</h3>
              <p className="mt-3 text-sm text-slate-600">실제 매장 데이터를 기반으로 검증된 리포트만 제공합니다.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:col-span-2">
              <div className="text-sm font-semibold text-slate-400">최근 사례</div>
              <div className="mt-4 text-2xl font-bold text-slate-900">
                “리포트의 우선순위를 따라 실행했더니 3주 만에 2위까지 올랐어요.”
              </div>
              <p className="mt-4 text-sm text-slate-500">카페 운영자 · 서울</p>
            </div>
          </div>
        </section>

        <section id="cta" className="bg-slate-900 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Start Now</p>
              <h2 className="mt-4 text-3xl font-black md:text-4xl">지금 바로 매장 진단을 시작하세요.</h2>
              <p className="mt-3 text-sm text-slate-300">첫 리포트는 무료로 제공됩니다.</p>
            </div>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300"
            >
              무료 진단 시작 <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPageAlt;
