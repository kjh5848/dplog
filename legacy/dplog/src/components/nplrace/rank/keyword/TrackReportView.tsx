import React from 'react';
import { CompareKeywordData } from '@/src/viewModel/nplace/keword/nplaceRankKeywordCompareViewModel';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Chart.js 설정
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrackReportViewProps {
  compareData?: CompareKeywordData | null;
  selectedKeyword?: string | null;
}

export default function TrackReportView({ compareData, selectedKeyword }: TrackReportViewProps) {
  if (!compareData || !selectedKeyword) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>선택된 상점과 키워드가 없습니다.</p>
      </div>
    );
  }
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // 최근 10일간 데이터로 제한
  const recentData = compareData.trackList.slice(0, 10).reverse();
  
  // 차트 데이터 구성
  const chartData: ChartData<'line'> = {
    labels: recentData.map((data) => formatDate(data.chartDate)),
    datasets: [
      {
        label: '순위',
        data: recentData.map((data) => data.rank),
        fill: false,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: '방문리뷰',
        data: recentData.map((data) => data.visitorReviewCount),
        fill: false,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.1,
        yAxisID: 'y1',
      },
      {
        label: '블로그리뷰',
        data: recentData.map((data) => data.blogReviewCount),
        fill: false,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.1,
        yAxisID: 'y1',
      }
    ],
  };
  
  // 차트 옵션
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        reverse: true, // 순위는 낮을수록 좋으므로 역순으로 표시
        min: 1,
        title: {
          display: true,
          text: '순위'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: '리뷰수'
        }
      },
    },
  };

  return (
    <div className="h-full flex flex-col">
      {/* 리포트 헤더 */}
      <div className="mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">트래킹 데이터 리포트</h3>
          <p className="text-xs text-gray-500 mt-1">
            {selectedKeyword} 키워드에 대한 {compareData.shopName}의 최근 10일 추세
          </p>
        </div>
      </div>
      
      {/* 차트 영역 */}
      <div className="flex-grow">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <StatCard 
          title="현재 순위" 
          value={compareData.currentRank} 
          change={compareData.previousRank - compareData.currentRank}
        />
        <StatCard 
          title="방문리뷰" 
          value={recentData[recentData.length - 1]?.visitorReviewCount || 0} 
          change={recentData[recentData.length - 1]?.visitorReviewCount - recentData[0]?.visitorReviewCount || 0}
        />
        <StatCard 
          title="블로그리뷰" 
          value={recentData[recentData.length - 1]?.blogReviewCount || 0} 
          change={recentData[recentData.length - 1]?.blogReviewCount - recentData[0]?.blogReviewCount || 0}
        />
        <StatCard 
          title="저장수" 
          value={recentData[recentData.length - 1]?.saveCount || 0} 
          change={recentData[recentData.length - 1]?.saveCount - recentData[0]?.saveCount || 0}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  change: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500">{title}</p>
      <div className="flex items-baseline">
        <p className="text-lg font-semibold text-gray-800">{value}</p>
        {change !== 0 && (
          <span className={`ml-2 text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? `+${change}` : change}
          </span>
        )}
      </div>
    </div>
  );
};
