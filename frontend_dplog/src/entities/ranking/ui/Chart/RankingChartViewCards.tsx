import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  formattedData: any[];
  keywords: string[];
  visibleKeywords: Set<string>;
  showReviews: boolean;
  cardWidth: number;
}

export const RankingChartViewCards = ({ formattedData, keywords, visibleKeywords, showReviews, cardWidth }: Props) => {
  const [gridHeight, setGridHeight] = useState(420);
  const dragRef = useRef<number>(0);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - dragRef.current;
      dragRef.current = moveEvent.clientY;
      setGridHeight(prev => Math.min(Math.max(prev + delta, 300), 1200));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const reversed = [...formattedData].reverse();

  const dyn = cardWidth >= 200 ? {
    date: 'py-2.5 px-3 text-sm',
    row: 'py-2 px-2 gap-2',
    kwName: 'text-xs',
    rankValue: 'text-sm',
    diff: 'text-xs',
    icon: 'size-4',
    metricsRow: 'py-2 px-2 gap-1.5',
    metricsLabel: 'text-xs',
    metricsVal: 'text-sm'
  } : cardWidth >= 160 ? {
    date: 'py-2 px-2 text-[13px]',
    row: 'py-1.5 px-1.5 gap-1.5',
    kwName: 'text-[11px]',
    rankValue: 'text-[13px]',
    diff: 'text-[11px]',
    icon: 'size-3.5',
    metricsRow: 'py-1.5 px-1.5 gap-1',
    metricsLabel: 'text-[11px]',
    metricsVal: 'text-[13px]'
  } : cardWidth >= 130 ? {
    date: 'py-1.5 px-1.5 text-xs',
    row: 'py-1.5 px-1.5 gap-1',
    kwName: 'text-[10px]',
    rankValue: 'text-xs',
    diff: 'text-[10px]',
    icon: 'size-3',
    metricsRow: 'py-1.5 px-1.5 gap-1',
    metricsLabel: 'text-[10px]',
    metricsVal: 'text-xs'
  } : {
    date: 'py-1 px-1.5 text-[10px]',
    row: 'py-1 px-1 gap-0.5',
    kwName: 'text-[9px]',
    rankValue: 'text-[10px]',
    diff: 'text-[9px]',
    icon: 'size-2.5',
    metricsRow: 'py-1 px-1 gap-0.5',
    metricsLabel: 'text-[9px]',
    metricsVal: 'text-[10px]'
  };

  const getRankChange = (currentIdx: number, kw: string) => {
    const today = reversed[currentIdx][kw];
    const yday = reversed[currentIdx + 1]?.[kw];
    if (today === undefined || today === null || yday === undefined || yday === null) return null;
    const diff = yday - today;
    
    if (diff > 0) return <span className={cn("text-rose-500 font-bold ml-1 whitespace-nowrap flex items-center gap-0.5", dyn.diff)}><TrendingUp className={dyn.icon} />{diff}</span>;
    if (diff < 0) return <span className={cn("text-blue-500 font-bold ml-1 whitespace-nowrap flex items-center gap-0.5", dyn.diff)}><TrendingDown className={dyn.icon} />{Math.abs(diff)}</span>;
    return <span className={cn("text-slate-400 ml-1 whitespace-nowrap flex items-center", dyn.diff)}><Minus className={dyn.icon} /></span>;
  };

  const getMetricChange = (currentIdx: number, key: string) => {
    const todayStr = reversed[currentIdx][key as keyof typeof reversed[0]];
    const ydayStr = reversed[currentIdx + 1]?.[key as keyof typeof reversed[0]];
    if (!todayStr || !ydayStr) return null;
    const today = parseInt(String(todayStr).replace(/,/g, ''), 10);
    const yday = parseInt(String(ydayStr).replace(/,/g, ''), 10);
    if (isNaN(today) || isNaN(yday)) return null;
    const diff = today - yday;
    
    if (diff > 0) return <span className={cn("text-rose-500 font-bold ml-1 whitespace-nowrap flex items-center gap-0.5", dyn.diff)}><TrendingUp className={dyn.icon} />{diff}</span>;
    if (diff < 0) return <span className={cn("text-blue-500 font-bold ml-1 whitespace-nowrap flex items-center gap-0.5", dyn.diff)}><TrendingDown className={dyn.icon} />{Math.abs(diff)}</span>;
    return <span className={cn("text-slate-400 ml-1 whitespace-nowrap flex items-center", dyn.diff)}><Minus className={dyn.icon} /></span>;
  };

  return (
    <div className="relative group pb-6">
      <div 
        className="flex flex-wrap gap-3 overflow-y-auto p-2 content-start bg-slate-50/20 dark:bg-slate-900/10 rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ height: `${gridHeight}px` }}
      >
        {reversed.map((row, idx) => (
          <div 
            key={row.checkedTime || row.rawDate} 
            className="flex-none bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            style={{ width: `${cardWidth}px` }}
          >
          <div className={cn("bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center font-extrabold text-[#333D4B] dark:text-slate-200 tracking-wide", dyn.date)}>
            {row.checkedTime || (new Date(row.rawDate).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }).replace(/\.$/, '').trim())}
          </div>
          <div className="flex flex-col p-1.5 gap-1.5 h-full">
            {keywords.map(kw => visibleKeywords.has(kw) && (
              <div key={kw} className={cn("flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/20 rounded-md border border-slate-100 dark:border-slate-700/50 overflow-hidden", dyn.row)}>
                <span className={cn("text-[#4E5968] dark:text-slate-400 font-semibold truncate min-w-0 flex-1", dyn.kwName)} title={kw}>{kw}</span>
                <div className="flex items-center flex-shrink-0 text-[#191F28] dark:text-slate-100 whitespace-nowrap">
                  <span className={cn("font-bold", dyn.rankValue)}>{row[kw] ? `${row[kw]}위` : '-'}</span>
                  {getRankChange(idx, kw)}
                </div>
              </div>
            ))}
            
            {showReviews && (
              <div className="mt-auto space-y-1.5">
                <div className={cn("flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/20 rounded-md border border-blue-100/50 dark:border-blue-800/30", dyn.metricsRow)}>
                  <span className={cn("text-blue-700 dark:text-blue-400 font-semibold truncate", dyn.metricsLabel)}>블로그</span>
                  <div className="flex items-center text-blue-800 dark:text-blue-300 whitespace-nowrap">
                    <span className={cn("font-bold", dyn.metricsVal)}>{row.blogReview}</span>
                    {getMetricChange(idx, 'blogReview')}
                  </div>
                </div>

                <div className={cn("flex justify-between items-center bg-emerald-50/50 dark:bg-emerald-900/20 rounded-md border border-emerald-100/50 dark:border-emerald-800/30", dyn.metricsRow)}>
                  <span className={cn("text-emerald-700 dark:text-emerald-400 font-semibold truncate", dyn.metricsLabel)}>방문자</span>
                  <div className="flex items-center text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                    <span className={cn("font-bold", dyn.metricsVal)}>{row.visitorReview}</span>
                    {getMetricChange(idx, 'visitorReview')}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      ))}
      </div>
      <div 
        onMouseDown={startResize}
        className="absolute bottom-0 left-0 right-0 h-6 cursor-row-resize flex items-center justify-center -mb-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-b-xl group"
        title="잡고 끌어서 크기 조절"
      >
        <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-blue-400 transition-colors" />
      </div>
    </div>
  );
};
