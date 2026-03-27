import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { TrackChartResponse } from '../model/types';
import { SkeletonChart } from './components/SkeletonChart';
import { RankingChartControls } from './components/RankingChartControls';
import { RankingChartViewChart } from './components/RankingChartViewChart';
import { RankingChartViewList } from './components/RankingChartViewList';
import { RankingChartViewCards } from './components/RankingChartViewCards';

interface RankingChartProps {
  chartData: TrackChartResponse | null;
  isLoading: boolean;
}

export default function RankingChartClient({ chartData, isLoading }: RankingChartProps) {
  const [visibleKeywords, setVisibleKeywords] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [showReviews, setShowReviews] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'split' | 'list' | 'cards'>('chart');
  const [cardWidth, setCardWidth] = useState(150);

  const { fullData, keywords } = useMemo(() => {
    if (!chartData || Object.keys(chartData.charts).length === 0) {
      return { fullData: [], keywords: [] };
    }

    const charts = chartData.charts;
    const keywordEntries = Object.values(charts);
    const kws = keywordEntries.map((c) => c.keyword);

    const dateMap = new Map<string, Record<string, any>>();

    keywordEntries.forEach((chart) => {
      chart.dailyRanks.forEach((dr) => {
        const rawDate = dr.chartDate;
        if (!dateMap.has(rawDate)) {
          dateMap.set(rawDate, { rawDate });
        }
        const entry = dateMap.get(rawDate)!;
        entry[chart.keyword] = dr.isValid ? dr.rank : null;

        if (entry.visitorReview === undefined && dr.visitorReviewCount) {
          const v = dr.visitorReviewCount.replace(/[^0-9]/g, '');
          const b = dr.blogReviewCount?.replace(/[^0-9]/g, '') || '0';
          const s = dr.saveCount?.replace(/[^0-9]/g, '') || '0';
          entry.visitorReview = v ? parseInt(v, 10) : 0;
          entry.blogReview = b ? parseInt(b, 10) : 0;
          entry.saveCount = s ? parseInt(s, 10) : 0;
        }
      });
    });

    const sorted = Array.from(dateMap.values()).sort((a, b) => {
      return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
    });

    return { fullData: sorted, keywords: kws };
  }, [chartData]);

  const formattedData = useMemo(() => {
    if (!fullData || fullData.length === 0) return [];
    return fullData.slice(-dateRange);
  }, [fullData, dateRange]);

  useMemo(() => {
    if (keywords.length > 0 && visibleKeywords.size === 0) {
      setVisibleKeywords(new Set([keywords[0]]));
    }
  }, [keywords]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleKeyword = (kw: string) => {
    setVisibleKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  };

  const toggleAllKeywords = () => {
    if (visibleKeywords.size === keywords.length) setVisibleKeywords(new Set());
    else setVisibleKeywords(new Set(keywords));
  };

  if (isLoading) return <SkeletonChart />;

  if (!chartData || formattedData.length === 0) {
    return (
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          순위 추이 (30일)
        </h3>
        <div className="h-72 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <BarChart3 className="size-8 mb-3 opacity-30" />
          <p className="text-sm">트래킹 키워드를 등록하면 차트가 표시됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 mb-32">
      <RankingChartControls
        dateRange={dateRange}
        setDateRange={setDateRange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        keywords={keywords}
        visibleKeywords={visibleKeywords}
        toggleKeyword={toggleKeyword}
        toggleAllKeywords={toggleAllKeywords}
        showReviews={showReviews}
        setShowReviews={setShowReviews}
        cardWidth={cardWidth}
        setCardWidth={setCardWidth}
      />
      
      {viewMode === 'chart' || viewMode === 'split' ? (
        <RankingChartViewChart
          viewMode={viewMode}
          formattedData={formattedData}
          keywords={keywords}
          visibleKeywords={visibleKeywords}
          showReviews={showReviews}
        />
      ) : viewMode === 'list' ? (
        <RankingChartViewList
          formattedData={formattedData}
          keywords={keywords}
          visibleKeywords={visibleKeywords}
          showReviews={showReviews}
        />
      ) : (
        <RankingChartViewCards
          formattedData={formattedData}
          keywords={keywords}
          visibleKeywords={visibleKeywords}
          showReviews={showReviews}
          cardWidth={cardWidth}
        />
      )}
    </div>
  );
}
