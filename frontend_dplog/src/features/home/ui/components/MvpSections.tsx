'use client';

import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  KeyRound,
  Mail,
} from 'lucide-react';

const FLOW = [
  {
    step: '01',
    title: '상점 등록',
    body: '네이버 플레이스 URL 또는 상점 검색으로 기준 상점을 등록합니다.',
  },
  {
    step: '02',
    title: '데이터 업데이트',
    body: '리뷰, 메뉴, 이미지, 대표 키워드를 최신 상태로 가져옵니다.',
  },
  {
    step: '03',
    title: '키워드 선택',
    body: '대표 키워드와 추천 키워드 중 실제로 검증할 검색어를 고릅니다.',
  },
  {
    step: '04',
    title: '순위 확인',
    body: '실시간 조회와 추적 그래프로 변화가 있는지 확인합니다.',
  },
];

const INCLUDED = [
  'macOS 데스크톱 앱 테스트 빌드',
  '내 컴퓨터에 데이터 저장',
  '상점 등록 및 데이터 업데이트',
  '키워드 발굴, 실시간 조회, 순위 추적',
  '제품키로 앱 실행',
];

const NOT_INCLUDED = [
  '자동 결제와 계정 관리',
  '대량 매장 관리',
  'PDF 리포트 다운로드',
  '대행사용 고객 리포트',
  '완전 자동 마케팅 실행',
];

export const MvpSections = () => {
  return (
    <section className="bg-transparent text-slate-950">
      <div className="border-y border-white/45 bg-white/42 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                사용 순서
              </p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                처음 사용하는 순서
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              처음 실행한 사용자가 막히지 않도록, 제품 안의 실제 메뉴 순서와 같은 흐름으로 설명합니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {FLOW.map((item, index) => (
              <div key={item.step} className="relative rounded-2xl bg-white/72 p-5 shadow-sm ring-1 ring-blue-100/70 backdrop-blur">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-blue-600">{item.step}</span>
                  {index < FLOW.length - 1 && (
                    <ArrowRight className="hidden size-4 text-slate-300 md:block" />
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-24 lg:grid-cols-[1fr_0.95fr]">
        <div className="rounded-3xl border border-white/60 bg-white/72 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="mb-8">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
              제공 범위
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              지금 제공하는 것
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                제공
              </h3>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900">
                <Clock3 className="size-4 text-slate-500" />
                아직 제외
              </h3>
              <ul className="space-y-3">
                {NOT_INCLUDED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-500">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-blue-300">
            신청 안내
          </p>
          <h2 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
            파일과 제품키를 받아 사용합니다
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            댓글이나 이메일로 신청한 사용자에게 사용 방법, 다운로드 파일, 제품키를 전달하는 방식으로
            먼저 제공합니다. Windows용 파일은 배포 안정화 후 같은 방식으로 전달합니다.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
              <Download className="size-5 text-blue-300" />
              <span className="text-sm font-semibold text-slate-100">앱 설치 파일 전달</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
              <KeyRound className="size-5 text-blue-300" />
              <span className="text-sm font-semibold text-slate-100">제품키 발급 후 라이선스 인증</span>
            </div>
          </div>

          <a
            href="mailto:eo25.kr@gmail.com?subject=D-PLOG%20사용%20신청"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-blue-50"
          >
            <Mail className="size-4" />
            사용 신청 메일 보내기
          </a>
        </div>
      </div>
    </section>
  );
};
