'use client';

import React from 'react';
import { DashboardStoreProfile } from './components/DashboardStoreProfile';
import { DashboardBriefing } from './components/DashboardBriefing';
import { DashboardActionTasks } from './components/DashboardActionTasks';
import { DashboardCurationReport } from './components/DashboardCurationReport';
import { LocalPortalHub } from './components/LocalPortalHub';

export default function DashboardClient() {
  const isLocalMode = process.env.NEXT_PUBLIC_APP_MODE === 'local';

  if (isLocalMode) {
    return <LocalPortalHub />;
  }

  const data = {
    shopName: "커리플라",
    shopAddress: "부산 연제구 연제로 21 연제힐스테이트 상가 1동 102호",
    targetKeywords: ["부산시청맛집", "연산동카레", "연제구점심", "부산카레맛집", "연제맛집"],
    statusText: "지금 상권 1위를 뺏길 위기예요.",
    
    keywords: [
      { name: "강남역 삼겹살", rank: 15, diff: -2, status: 'down' },
      { name: "서초동 맛집", rank: 8, diff: 3, status: 'up' },
      { name: "강남역 회식", rank: 12, diff: 0, status: 'same' },
      { name: "교대역 고기집", rank: 21, diff: -5, status: 'down' },
    ],
    searchWeekly: "1,200",
    searchDiff: "+20%",
    badReviewCount: 1,

    task1_title: "서초구 1위 매장보다\n최신 리뷰가 15개 부족해요.",
    task1_sub: "최신성 점수가 깎이기 전에 블로그 리뷰를 채워주세요.",
    task1_cta: "체험단 5팀 지시하기",

    task2_title: "답글 안 달린 별점 2점짜리\n리뷰가 방치되어 있어요.",
    task2_sub: "가장 상단에 노출되고 있습니다. 민심을 돌릴 AI 사과문을 준비했어요.",
    task2_targetReview: "고기는 맛있었는데 알바생이 너무 불친절해서 다신 안 갈듯요 ㅡㅡ",
    task2_aiReply: "안녕하세요 고객님, 먼저 소중한 시간 내어 방문해주셨는데 서비스로 불편을 드려 진심으로 사과드립니다. 해당 직원 재교육을 통해...",
    
    task3_title: "오늘 저녁 비 예보가 있어요.\n단골들에게 파전을 서비스해 볼까요?",
    task3_feedText: "[비 오는 날 한정 ☔️] 지금 당근마켓 보고 오시면 바삭한 해물파전을 테이블당 1접시 서비스로 드립니다!",
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 pb-32">
      <DashboardStoreProfile data={data} />
      <DashboardBriefing data={data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-2">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <DashboardActionTasks data={data} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6 h-fit sticky top-8">
          <DashboardCurationReport />
        </div>
      </div>
    </div>
  );
}
