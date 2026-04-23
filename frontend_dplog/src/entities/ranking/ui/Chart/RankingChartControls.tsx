import React from 'react';
import { cn } from '@/shared/lib/utils';
import { Activity, LayoutGrid, List, CalendarDays, BarChart3 } from 'lucide-react';
import { LINE_COLORS } from './RankingChartConstants';

interface Props {
  dateRange: 7 | 30 | 90;
  setDateRange: (days: 7 | 30 | 90) => void;
  viewMode: 'chart' | 'split' | 'list' | 'cards';
  setViewMode: (mode: 'chart' | 'split' | 'list' | 'cards') => void;
  keywords: string[];
  visibleKeywords: Set<string>;
  toggleKeyword: (kw: string) => void;
  toggleAllKeywords: () => void;
  showReviews: boolean;
  setShowReviews: (show: boolean) => void;
  cardWidth: number;
  setCardWidth: (width: number) => void;
  chartInterval: 'daily' | 'hourly';
  setChartInterval: (interval: 'daily' | 'hourly') => void;
}

export const RankingChartControls = ({
  dateRange, setDateRange, viewMode, setViewMode,
  keywords, visibleKeywords, toggleKeyword, toggleAllKeywords,
  showReviews, setShowReviews, cardWidth, setCardWidth,
  chartInterval, setChartInterval
}: Props) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            순위 추이 ({dateRange}일)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            키워드별 일일 순위 변동 차트 및 표 데이터
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 기간 필터 버튼 */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days as 7|30|90)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                  dateRange === days 
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {days === 7 ? '1주일' : days === 30 ? '1개월' : '3개월'}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          
          {/* 시간/일간 차트 토글 */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setChartInterval('daily')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                chartInterval === 'daily' 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              일간 트렌드
            </button>
            <button
              onClick={() => {
                setChartInterval('hourly');
                if (dateRange !== 7) setDateRange(7); // 강제로 7일로 변경 (밀집 방지)
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-md transition-colors",
                chartInterval === 'hourly' 
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              시간별 탐색
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

          {/* 뷰 모드 토글 */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('chart')}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center gap-1",
                viewMode === 'chart' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="통합 차트 뷰"
            >
              <Activity className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center gap-1",
                viewMode === 'split' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="4분할 차트 뷰"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center gap-1",
                viewMode === 'list' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="데이터 표(List) 뷰"
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center gap-1",
                viewMode === 'cards' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
              title="일간 카드(Grid) 뷰"
            >
              <CalendarDays className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 키워드 & 리뷰 필터 토글 */}
      <div className="flex flex-col gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            조회할 키워드 <span className="text-slate-400 font-normal ml-1">({visibleKeywords.size}/{keywords.length})</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 pr-3 border-r border-slate-200 dark:border-slate-700">
            {keywords.map((kw, idx) => (
              <button
                key={kw}
                onClick={() => toggleKeyword(kw)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                  visibleKeywords.has(kw)
                    ? 'text-white shadow-md'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500',
                )}
                style={
                  visibleKeywords.has(kw)
                    ? { backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }
                    : undefined
                }
              >
                <div
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor: visibleKeywords.has(kw) ? '#ffffff' : LINE_COLORS[idx % LINE_COLORS.length],
                    opacity: visibleKeywords.has(kw) ? 1 : 0.4,
                  }}
                />
                {kw}
              </button>
            ))}
            
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            
            <button
              onClick={toggleAllKeywords}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              {visibleKeywords.size === keywords.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            {viewMode === 'cards' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">카드 크기</span>
                <input 
                  type="range" 
                  min="90" 
                  max="240" 
                  step="5"
                  value={cardWidth} 
                  onChange={(e) => setCardWidth(Number(e.target.value))}
                  className="w-16 sm:w-24 accent-slate-400 hover:accent-blue-500 transition-colors cursor-pointer"
                  title="카드폭 늘리기/줄이기"
                />
              </div>
            )}
            
            {/* 지표 차트 토글 (방문자, 블로그, 저장) */}
            <button
              onClick={() => setShowReviews(!showReviews)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                showReviews
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
              )}
            >
              <BarChart3 className={cn("size-3.5", showReviews ? "text-emerald-400" : "")} />
              리뷰 추이 보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
