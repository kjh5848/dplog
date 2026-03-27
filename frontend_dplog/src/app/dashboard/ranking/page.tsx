import { RankingDashboard } from '@/features/ranking';

/**
 * 순위 조회 페이지
 *
 * 대시보드 사이드바 > "순위 조회" 메뉴에서 접근합니다.
 * 내순이 서버 연동 전까지 MSW 목데이터로 동작합니다.
 */
export default function RankingPage() {
  return <RankingDashboard storeId={1} />;
}
