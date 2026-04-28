'use client';

import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  CircleHelp,
  RefreshCw,
  Search,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/widgets/app-shell/ui/AppShell';
import { DiagnosticCopyButton } from '@/features/system-support/ui/DiagnosticCopyButton';

type Highlight = {
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  labelSide?: 'left' | 'right';
};

const articleSections: Array<{
  number: string;
  title: string;
  icon: any;
  image: string;
  alt: string;
  highlights: Highlight[];
  body: string;
  bullets: string[];
}> = [
  {
    number: '01',
    title: '빈 상태에서 상점을 검색합니다',
    icon: Search,
    image: '/help/demo/01-empty-store-form.png',
    alt: '빈 상태의 새 가게 검색 및 등록 화면',
    highlights: [
      { label: '클릭: 상호명 입력', left: '21.5%', top: '36%', width: '69.3%', height: '4.8%' },
    ],
    body: '로컬 데이터를 초기화한 뒤 처음 보이는 화면입니다. D-PLOG는 먼저 네이버 플레이스 기준 상점을 하나만 등록하도록 설계되어 있습니다.',
    bullets: [
      '상호명 검색창에 실제 등록할 상점명을 입력합니다.',
      '상호가 흔하면 지역명이나 지점명을 함께 입력합니다.',
      '이번 예시는 누구나 아는 성심당 본점을 기준으로 진행했습니다.',
    ],
  },
  {
    number: '02',
    title: '검색 결과에서 정확한 지점을 고릅니다',
    icon: Store,
    image: '/help/demo/03-search-results.png',
    alt: '성심당 본점 검색 결과 화면',
    highlights: [
      { label: '클릭: 성심당 본점 선택', left: '21.5%', top: '42.4%', width: '74.3%', height: '7.3%' },
    ],
    body: '성심당 본점을 입력하면 네이버 지도 검색 결과가 표시됩니다. 여기서는 이름만 보지 말고 주소까지 확인해야 합니다.',
    bullets: [
      '선택한 결과: 성심당 본점',
      '주소: 대전광역시 중구 대종로480번길 15',
      '카테고리: 베이커리',
    ],
  },
  {
    number: '03',
    title: '플레이스 URL이 채워졌는지 확인합니다',
    icon: CheckCircle2,
    image: '/help/demo/04-store-selected.png',
    alt: '성심당 본점을 선택해 플레이스 URL이 입력된 화면',
    highlights: [
      { label: '확인: 플레이스 URL', left: '21.5%', top: '83.9%', width: '42.1%', height: '4.7%' },
    ],
    body: '검색 결과를 선택하면 플레이스 URL이 자동 입력됩니다. 이 URL이 이후 이미지, 메뉴, 리뷰, 키워드 수집의 기준이 됩니다.',
    bullets: [
      'URL에 place ID가 들어갔는지 확인합니다.',
      '오른쪽 미리보기는 네이버 플레이스 화면을 확인하는 보조 영역입니다.',
      '잘못된 지점을 고르면 이후 데이터 전체가 잘못 수집됩니다.',
    ],
  },
  {
    number: '04',
    title: '라이선스 귀속을 확인하고 등록합니다',
    icon: RefreshCw,
    image: '/help/demo/05-license-confirmed.png',
    alt: '등록 전 라이선스 귀속 확인 체크 화면',
    highlights: [
      { label: '클릭: 필수 확인', left: '22.5%', top: '66.5%', width: '1.9%', height: '2.3%' },
      { label: '클릭: 등록 시작', left: '55.7%', top: '82.1%', width: '10.1%', height: '4.8%', labelSide: 'right' },
    ],
    body: 'D-PLOG는 한 라이선스에 한 상점을 묶는 구조입니다. 그래서 등록 직전 확인 체크를 두고 있습니다.',
    bullets: [
      '상점명과 주소가 맞으면 필수 확인 체크를 누릅니다.',
      '가게 등록 시작을 누르면 로컬 DB에 상점이 생성됩니다.',
      '등록 직후에는 백그라운드에서 상세 데이터 수집이 이어집니다.',
    ],
  },
  {
    number: '05',
    title: '수집된 상점 데이터를 확인합니다',
    icon: Store,
    image: '/help/demo/07-store-detail.png',
    alt: '성심당 본점 상점 상세 화면',
    highlights: [
      { label: '클릭: 데이터 업데이트', left: '80.3%', top: '10.3%', width: '10.2%', height: '4.2%', labelSide: 'right' },
    ],
    body: '상세 수집이 끝나면 이미지, 메뉴, 방문자 리뷰, 블로그 리뷰, 평점이 한 화면에 정리됩니다.',
    bullets: [
      '방문자 리뷰: 71,054',
      '블로그 리뷰: 36,467',
      '평점: 4.52',
      '대표 메뉴와 이미지가 보이면 기본 수집은 정상입니다.',
    ],
  },
  {
    number: '06',
    title: '대표 키워드와 검색량을 읽습니다',
    icon: Sparkles,
    image: '/help/demo/08-keywords.png',
    alt: '성심당 본점 황금 키워드 발굴 화면',
    highlights: [
      { label: '클릭: 발굴 시작', left: '87.1%', top: '70.1%', width: '9.8%', height: '4.3%', labelSide: 'right' },
    ],
    body: '황금 키워드 화면은 상점 메타데이터, 대표키워드, 지역/업종 조합 키워드를 한 번에 비교하는 곳입니다.',
    bullets: [
      '대표 키워드: 보문산메아리, 튀김소보로, 명란바게트, 판타롱부추빵, 성심당 베이커리',
      '검색량이 있는 키워드는 우선 검토 대상입니다.',
      '상호명 키워드와 지역 키워드를 나눠서 봐야 합니다.',
    ],
  },
  {
    number: '07',
    title: '순위 조회로 추적 키워드를 등록합니다',
    icon: TrendingUp,
    image: '/help/demo/09-ranking.png',
    alt: '성심당 본점 순위 조회 화면',
    highlights: [
      { label: '클릭: 키워드 입력', left: '20.6%', top: '37.1%', width: '70.5%', height: '4.2%' },
      { label: '클릭: 등록', left: '91.6%', top: '37%', width: '5.5%', height: '4.3%', labelSide: 'right' },
    ],
    body: '마지막으로 순위 조회에서 계속 볼 키워드를 등록합니다. 아직 등록된 키워드가 없으면 빈 상태가 보이고, 여기서 추적을 시작합니다.',
    bullets: [
      '예시 후보: 대전 빵집, 성심당 본점, 튀김소보로',
      '순위가 없으면 이탈로 봅니다.',
      '검색량은 있는데 이탈인 키워드는 개선 후보로 따로 봅니다.',
    ],
  },
];

const quickLinks = [
  { label: '내 가게', href: '/dashboard/stores/new', icon: Store },
  { label: '데이터 업데이트', href: '/settings', icon: RefreshCw },
  { label: '황금 키워드', href: '/dashboard/keywords', icon: Sparkles },
  { label: '순위 조회', href: '/dashboard/ranking', icon: TrendingUp },
];

function ArticleShot({ src, alt, highlights = [] }: { src: string; alt: string; highlights?: Highlight[] }) {
  return (
    <figure className="relative mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <img src={src} alt={alt} className="w-full" draggable={false} />
      {highlights.map(highlight => (
        <span
          key={highlight.label}
          className="pointer-events-none absolute rounded-lg border-2 border-blue-600 bg-blue-500/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.08),0_0_0_4px_rgba(37,99,235,0.18)] ring-2 ring-white/90"
          style={{
            left: highlight.left,
            top: highlight.top,
            width: highlight.width,
            height: highlight.height,
          }}
        >
          <span
            className="absolute top-0 -translate-y-[115%] whitespace-nowrap rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white shadow-lg"
            style={highlight.labelSide === 'right' ? { right: 0 } : { left: 0 }}
          >
            {highlight.label}
          </span>
        </span>
      ))}
    </figure>
  );
}

export default function HelpPage() {
  return (
    <AppShell>
      <article className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-300">
            <BookOpen className="size-4" />
            실제 등록 캡처 가이드
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            성심당 본점으로 D-PLOG 시작하기
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-slate-600 dark:text-slate-300">
            이 글은 로컬 데이터를 초기화한 뒤 성심당 본점을 실제로 검색하고 등록하면서 만든 도움말입니다.
            상점 등록부터 데이터 수집, 황금 키워드 확인, 순위 조회까지 한 번에 따라갈 수 있도록 구성했습니다.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ['방문자 리뷰', '71,054'],
              ['블로그 리뷰', '36,467'],
              ['평점', '4.52'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                <p className="text-xs font-bold text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </header>

        <nav className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickLinks.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-200"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-6">
          {articleSections.map(section => {
            const Icon = section.icon;
            return (
              <section key={section.number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                    {section.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-blue-600 dark:text-blue-300" />
                      <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                      {section.body}
                    </p>
                  </div>
                </div>

                <ArticleShot src={section.image} alt={section.alt} highlights={section.highlights} />

                <ul className="mt-4 grid grid-cols-1 gap-2">
                  {section.bullets.map(item => (
                    <li key={item} className="flex gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <CircleHelp className="size-4 text-orange-500" />
            <h2 className="text-xl font-black text-slate-950 dark:text-white">문제가 생기면 먼저 확인할 것</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ['리뷰 수가 0이면', '데이터 업데이트를 다시 실행하고 수집 상태를 확인합니다.'],
              ['이미지가 이전 상점이면', '로컬 이미지 캐시가 남은 상태이므로 데이터 업데이트 후 새로고침합니다.'],
              ['검색량이 안 뜨면', '검색광고 API 응답 또는 캐시 상태를 확인합니다.'],
              ['순위가 안 나오면', '순위권 밖이면 이탈로 표시되는 것이 정상입니다.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                <p className="text-sm font-black text-slate-900 dark:text-white">{title}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">지원</h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              문의할 때는 진단 정보를 함께 전달하면 원인 파악이 빨라집니다.
            </p>
          </div>
          <DiagnosticCopyButton />
        </section>
      </article>
    </AppShell>
  );
}
