// Mock API for dashboard data
import { DashboardData } from "../model/useDashboardViewModel";

export const getDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    stats: [
      { id: '1', title: '방문 고객 수', value: '12,482', change: 12.5, trend: 'up', iconName: 'Users' },
      { id: '2', title: '예약 전환율', value: '4.2%', change: 0.8, trend: 'up', iconName: 'Zap' },
      { id: '3', title: '지출 광고비', value: '142만원', change: -5.2, trend: 'down', iconName: 'TrendingUp' },
      { id: '4', title: 'AI 콘텐츠 조회', value: '45,201', change: 24.1, trend: 'up', iconName: 'Sparkles' },
    ],
    chartData: [20, 45, 30, 65, 55, 80, 75, 95],
  };
};
