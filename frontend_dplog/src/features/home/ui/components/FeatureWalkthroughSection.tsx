'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';

const FEATURE_STEPS = [
  {
    step: '01',
    icon: Store,
    eyebrow: '내 가게 확인',
    title: '매장 데이터가 맞는지 먼저 확인',
    body: '이미지, 메뉴, 리뷰 수, 대표 키워드를 한 화면에서 확인합니다.',
    bullets: ['기본 데이터 점검', '대표 키워드 확인'],
    imageSrc: '/landing/dashboard/my-store.png',
    accent: '#2563eb',
    captionTitle: '기준 매장을 먼저 고정합니다',
    caption:
      '상점 이미지, 메뉴, 리뷰 수, 주소가 맞는지 확인해야 이후 키워드 추천과 순위 조회가 같은 기준으로 움직입니다.',
    details: ['플레이스 데이터 최신화', '대표 메뉴와 리뷰 수 확인', '기준 상점 링크 고정'],
    ownerTitle: '내 가게가 손님에게 어떻게 보이는지부터 알아야 합니다',
    ownerPerspective:
      '사장님은 매장 안의 맛과 서비스는 누구보다 잘 알지만, 손님이 검색 화면에서 처음 만나는 내 가게의 모습은 놓치기 쉽습니다. 대표 이미지가 예전 사진으로 남아 있거나, 메뉴 가격이 어긋나 있거나, 리뷰 수가 실제보다 적게 보이면 광고를 더 태워도 전환이 막힙니다. 그래서 D-PLOG는 마케팅을 시작하기 전에 먼저 내 가게의 기준 데이터를 확인하게 합니다. 이 단계는 단순 점검이 아니라, 앞으로 어떤 키워드를 밀고 어떤 콘텐츠를 만들어야 하는지 결정하는 출발점입니다.',
  },
  {
    step: '02',
    icon: Sparkles,
    eyebrow: '황금 키워드 발굴',
    title: '테스트할 키워드를 고릅니다',
    body: '지역, 업종, 메뉴, 검색량을 함께 보고 실행 후보를 좁힙니다.',
    bullets: ['검색량 비교', '상권 기반 추천'],
    imageSrc: '/landing/dashboard/keywords.png',
    accent: '#f97316',
    captionTitle: '감이 아니라 검색량으로 후보를 좁힙니다',
    caption:
      '지역, 업종, 메뉴 키워드를 한 화면에서 비교하고 실제로 노출을 테스트할 검색어만 남깁니다.',
    details: ['검색량과 난이도 비교', '지역 기반 키워드 조합', '실행 후보 선별'],
    ownerTitle: '광고비를 줄이려면 먼저 버릴 키워드를 알아야 합니다',
    ownerPerspective:
      '많은 사장님이 “우리 동네 맛집”, “한식 맛집”처럼 익숙한 단어부터 광고하거나 포스팅합니다. 문제는 그 키워드가 너무 넓거나 경쟁이 세면 돈과 시간을 써도 내 매장이 손님 앞까지 도달하지 못한다는 점입니다. 황금 키워드 발굴은 잘 팔릴 것 같은 감이 아니라, 실제 검색량과 지역 맥락을 보고 테스트할 키워드를 좁히는 과정입니다. 적은 예산으로 시작해야 하는 매장일수록 모든 키워드에 힘을 나눠 쓰는 것보다, 이길 가능성이 있는 키워드부터 집중하는 편이 훨씬 현실적입니다.',
  },
  {
    step: '03',
    icon: Search,
    eyebrow: '실시간 조회',
    title: '지금 몇 위인지 확인합니다',
    body: '선택한 키워드에서 내 매장과 경쟁 매장의 현재 위치를 봅니다.',
    bullets: ['현재 순위 확인', '이탈 키워드 분리'],
    imageSrc: '/landing/dashboard/ranking.png',
    accent: '#06b6d4',
    captionTitle: '지금 보이는 위치를 바로 확인합니다',
    caption:
      '선택한 키워드에서 내 매장과 경쟁 매장이 어디에 노출되는지 확인하고 순위권 밖 키워드는 이탈로 분리합니다.',
    details: ['현재 노출 순위 확인', '경쟁 매장 비교', '이탈 키워드 구분'],
    ownerTitle: '내가 안 보이는 키워드에는 손님도 오기 어렵습니다',
    ownerPerspective:
      '검색 결과에서 몇 위에 보이는지는 사장님이 매일 체감하는 매출과 연결됩니다. 손님은 대부분 첫 화면에서 몇 개의 매장만 비교하고, 멀리 내려가서 모든 가게를 확인하지 않습니다. 실시간 조회는 “내가 열심히 올린 콘텐츠가 실제로 노출되고 있는가”, “경쟁 매장은 어떤 키워드에서 위에 있는가”를 바로 확인하는 기능입니다. 순위권 밖인 키워드는 이탈로 보고, 무작정 계속 밀기보다 메뉴명, 지역명, 콘텐츠 방향을 다시 잡는 기준으로 삼을 수 있습니다.',
  },
  {
    step: '04',
    icon: TrendingUp,
    eyebrow: '순위 추적',
    title: '변화를 누적해서 판단합니다',
    body: '등록 키워드의 순위 변화를 쌓아 다음 실행 방향을 정합니다.',
    bullets: ['순위 변화 누적', '다음 액션 결정'],
    imageSrc: '/landing/dashboard/tracking.png',
    accent: '#8b5cf6',
    captionTitle: '변화가 쌓이면 다음 액션이 보입니다',
    caption:
      '단발 조회로 끝내지 않고 키워드별 변화를 누적해서 어떤 콘텐츠와 미션을 먼저 실행할지 판단합니다.',
    details: ['키워드별 변화 누적', '상승/하락 흐름 확인', '다음 실행 우선순위 결정'],
    ownerTitle: '하루 순위보다 중요한 건 변화의 방향입니다',
    ownerPerspective:
      '순위는 하루에도 흔들릴 수 있기 때문에 한 번 검색해서 나온 결과만 보고 판단하면 실행이 흔들립니다. 중요한 것은 지난주보다 올라가는 키워드가 무엇인지, 계속 밀어도 반응이 없는 키워드가 무엇인지, 갑자기 떨어진 키워드가 있는지를 보는 것입니다. 순위 추적은 사장님이 매번 대행사 보고서를 기다리지 않고도 직접 변화를 확인하게 해줍니다. 이렇게 쌓인 데이터가 있으면 이번 주에는 리뷰 요청을 강화할지, 메뉴 콘텐츠를 만들지, 다른 키워드로 갈아탈지 더 명확하게 결정할 수 있습니다.',
  },
];

export const FeatureWalkthroughSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeStep = FEATURE_STEPS[activeIndex] ?? FEATURE_STEPS[0];
  const ActiveIcon = activeStep.icon;

  useEffect(() => {
    let frame = 0;

    const updateActiveStep = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const anchorY = window.innerHeight * 0.24;
        let nextIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        cardRefs.current.forEach((card, index) => {
          if (!card) return;

          const rect = card.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;

          const cardAnchorY = rect.top + rect.height * 0.06;
          const distance = Math.abs(cardAnchorY - anchorY);

          if (distance < closestDistance) {
            closestDistance = distance;
            nextIndex = index;
          }
        });

        setActiveIndex(nextIndex);
      });
    };

    updateActiveStep();
    window.addEventListener('scroll', updateActiveStep, { passive: true });
    window.addEventListener('resize', updateActiveStep);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateActiveStep);
      window.removeEventListener('resize', updateActiveStep);
    };
  }, []);

  const scrollToStep = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;

    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    section.style.setProperty('--flow-x', x.toFixed(3));
    section.style.setProperty('--flow-y', y.toFixed(3));
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative text-slate-950"
      style={{ '--flow-x': 0.52, '--flow-y': 0.36 } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 hidden overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, #000 22%, #000 92%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, #000 22%, #000 92%, transparent 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-35 transition-transform duration-500 ease-out"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            transform:
              'translate3d(calc((var(--flow-x) - 0.5) * 28px), calc((var(--flow-y) - 0.5) * 28px), 0)',
          }}
        />
        <div
          className="absolute -right-28 top-36 h-[540px] w-[520px] border border-blue-200/30 opacity-35"
          style={{
            clipPath: 'polygon(14% 0, 100% 18%, 86% 100%, 0 76%)',
            background: 'repeating-linear-gradient(135deg, rgba(37,99,235,0.06) 0 1px, transparent 1px 18px)',
            transform:
              'translate3d(calc((var(--flow-x) - 0.5) * -42px), calc((var(--flow-y) - 0.5) * 26px), 0) rotate(10deg)',
          }}
        />
        <div
          className="absolute -left-20 bottom-40 h-[360px] w-[420px] border border-blue-200/30 opacity-30"
          style={{
            clipPath: 'polygon(0 8%, 76% 0, 100% 80%, 20% 100%)',
            background:
              'linear-gradient(120deg, rgba(255,255,255,0.38), rgba(37,99,235,0.06)), repeating-linear-gradient(90deg, rgba(37,99,235,0.06) 0 1px, transparent 1px 22px)',
            transform:
              'translate3d(calc((var(--flow-x) - 0.5) * 32px), calc((var(--flow-y) - 0.5) * -28px), 0) rotate(-8deg)',
          }}
        />
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-12 px-6 pb-20 pt-12 md:pb-28 md:pt-16 lg:grid-cols-[0.58fr_1.42fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-blue-600">
              기능 흐름
            </p>

            <motion.span
              key={activeStep.step}
              initial={{ opacity: 0.7, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="block font-mono text-[92px] font-black leading-none text-slate-950 md:text-[124px]"
            >
              {activeStep.step}
            </motion.span>

            <div className="mt-7 flex items-center gap-3">
              <div
                className="flex size-11 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: activeStep.accent }}
              >
                <ActiveIcon className="size-5" />
              </div>
              <p className="text-sm font-black text-slate-900">{activeStep.eyebrow}</p>
            </div>

            <h2 className="mt-5 max-w-sm text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">
              {activeStep.title}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 md:text-base">
              {activeStep.body}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {activeStep.bullets.map((bullet) => (
                <li key={bullet} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex gap-2">
              {FEATURE_STEPS.map((item, index) => (
                <button
                  key={item.step}
                  type="button"
                  aria-label={`${item.eyebrow} 보기`}
                  onClick={() => scrollToStep(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex ? 'w-10 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </aside>

        <div className="space-y-10 lg:space-y-12">
          {FEATURE_STEPS.map((item, index) => (
            <motion.article
              key={item.step}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.28 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="scroll-mt-32"
            >
              <div className="mb-5 flex items-center gap-4">
                <span
                  className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em]"
                  style={{ color: item.accent }}
                >
                  section {item.step}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-slate-300 via-slate-200 to-transparent" />
              </div>
              <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-red-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-black text-slate-400">
                    {item.eyebrow}
                  </div>
                </div>
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={item.imageSrc}
                    alt={`${item.eyebrow} 화면 예시`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className="block h-auto w-full select-none object-contain"
                  />
                </div>
                <div className="border-t border-slate-200 bg-white px-5 py-5 md:px-6">
                  <div className="grid gap-5 md:grid-cols-[0.92fr_1.08fr] md:items-start">
                    <div>
                      <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                        화면에서 보는 것
                      </p>
                      <h3 className="text-lg font-black leading-snug text-slate-950">
                        {item.captionTitle}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {item.caption}
                      </p>
                    </div>
                    <ul className="grid gap-2 pt-1">
                      {item.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.accent }}
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <p
                      className="mb-3 text-[11px] font-black uppercase tracking-[0.18em]"
                      style={{ color: item.accent }}
                    >
                      사장님 입장에서 왜 필요한가
                    </p>
                    <h4 className="text-xl font-black leading-snug text-slate-950">
                      {item.ownerTitle}
                    </h4>
                    <p className="mt-3 text-[15px] leading-8 text-slate-700">
                      {item.ownerPerspective}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
