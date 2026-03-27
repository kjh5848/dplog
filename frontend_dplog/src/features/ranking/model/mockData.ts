import type { TrackInfo, TrackState, RealtimeRank, TrackChartResponse, KeywordChart, DailyRank } from './types';

export const mockTrackInfoList: TrackInfo[] = [
  { id: 1, keyword: '부산시청맛집', province: '부산', businessSector: '식당', shopId: '1', rankChange: 2 },
  { id: 2, keyword: '연산동카레', province: '부산', businessSector: '식당', shopId: '1', rankChange: -1 },
  { id: 3, keyword: '연제구점심', province: '부산', businessSector: '식당', shopId: '1', rankChange: 5 },
  { id: 4, keyword: '부산카레맛집', province: '부산', businessSector: '식당', shopId: '1', rankChange: 1 },
  { id: 5, keyword: '연제맛집', province: '부산', businessSector: '식당', shopId: '1', rankChange: 0 },
];

export const mockTrackState: TrackState = {
  totalCount: 5,
  completedCount: 5,
  completedKeywords: [
    { keyword: '부산시청맛집', province: '부산' },
    { keyword: '연산동카레', province: '부산' },
    { keyword: '연제구점심', province: '부산' },
    { keyword: '부산카레맛집', province: '부산' },
    { keyword: '연제맛집', province: '부산' },
  ],
};

export const mockRealtimeRanks: RealtimeRank[] = [
  {
    shopId: '1',
    shopName: '커리플라',
    shopImageUrl: 'https://via.placeholder.com/150',
    category: '카레',
    address: '부산 연제구 연제로 21 연제힐스테이트 상가 1동 102호',
    roadAddress: '부산 연제구 연제로 21 연제힐스테이트 상가 1동 102호',
    visitorReviewCount: '102',
    blogReviewCount: '48',
    scoreInfo: '4.8',
    saveCount: '150',
    rank: 3,
    totalCount: 150,
  },
  {
    shopId: '2',
    shopName: '아비꼬 연산점',
    shopImageUrl: 'https://via.placeholder.com/150',
    category: '카레',
    address: '부산 연제구 카레로 1',
    roadAddress: '부산 연제구 카레로 1',
    visitorReviewCount: '500',
    blogReviewCount: '150',
    scoreInfo: '4.5',
    saveCount: '600',
    rank: 1,
    totalCount: 150,
  },
];

export function generateMockChartData(daysCount: number = 90): TrackChartResponse {
  const charts: Record<string, KeywordChart> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const keywords = mockTrackInfoList;
  
  // 90일 후 102, 48이 되도록 시작점을 낮춤
  let baseVisitorReview = 10;
  let baseBlogReview = 5;
  let baseSaveCount = 20;

  keywords.forEach((kw) => {
    const dailyRanks: DailyRank[] = [];
    let currentRank = Math.floor(Math.random() * 20) + 5; // 5등 ~ 25등 사이에서 시작
    
    // 과거(daysCount 이전)부터 오늘까지 순차적으로 생성
    for (let i = daysCount; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      
      // 순위 변동 로직 (-3 ~ +3)
      const change = Math.floor(Math.random() * 7) - 3;
      currentRank = Math.max(1, currentRank + change);
      
      // 리뷰 수 점진적 증가 (확률적으로 0~1개씩 증가하여 90일 뒤 102/48 부근 도착 유도)
      if (kw.id === 1) { 
        baseVisitorReview += Math.random() > 0.3 ? 1 : 0; // 약 60~70 증가
        baseBlogReview += Math.random() > 0.5 ? 1 : 0;    // 약 40~50 증가
        baseSaveCount += Math.random() > 0.2 ? 1 : 0;     // 약 70~80 증가
      }
      
      // 만약 오늘(i===0)이라면 정확히 스크래핑된 실제 데이터로 맞춤
      const finalVisitor = i === 0 ? 102 : baseVisitorReview;
      const finalBlog = i === 0 ? 48 : baseBlogReview;
      const finalSave = i === 0 ? 150 : baseSaveCount;

      dailyRanks.push({
        rank: currentRank,
        prevRank: currentRank - change,
        visitorReviewCount: finalVisitor.toLocaleString(),
        blogReviewCount: finalBlog.toLocaleString(),
        scoreInfo: '4.8',
        saveCount: finalSave.toLocaleString(),
        ampm: 'AM',
        isValid: true,
        chartDate: d.toISOString().split('T')[0], // YYYY-MM-DD
      });
    }

    charts[kw.keyword] = {
      id: kw.id,
      keyword: kw.keyword,
      province: kw.province,
      shopId: kw.shopId,
      rankChange: kw.rankChange,
      dailyRanks,
    };
  });

  return { charts };
}
