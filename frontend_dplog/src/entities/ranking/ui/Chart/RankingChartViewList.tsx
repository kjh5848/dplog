import React from 'react';
import { cn } from '@/shared/lib/utils';

interface Props {
  formattedData: any[];
  keywords: string[];
  visibleKeywords: Set<string>;
  showReviews: boolean;
}

export const RankingChartViewList = ({ formattedData, keywords, visibleKeywords, showReviews }: Props) => {
  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[360px] relative border border-slate-200 dark:border-slate-700 rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="text-[13px] text-slate-500 bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 shadow-sm backdrop-blur-md">
          <tr>
            <th className="px-5 py-3.5 font-bold whitespace-nowrap border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center min-w-[100px]">날짜</th>
            {showReviews && (
              <>
                <th className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap border-b border-slate-200 dark:border-slate-700 text-right">방문자리뷰</th>
                <th className="px-5 py-3.5 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap border-b border-slate-200 dark:border-slate-700 text-right">블로그리뷰</th>
              </>
            )}
            {keywords.map(kw => visibleKeywords.has(kw) && (
              <th key={kw} className="px-5 py-3.5 font-bold whitespace-nowrap border-b border-slate-200 dark:border-slate-700 text-center">
                {kw}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...formattedData].reverse().map((row) => (
            <tr key={row.rawDate} className="bg-white dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap text-center">
                {row.checkedTime || (new Date(row.rawDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }))}
              </td>
              {showReviews && (
                <>
                  <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400 font-medium text-right bg-emerald-50/30 dark:bg-emerald-900/10">
                    {row.visitorReview?.toLocaleString() ?? '-'}
                  </td>
                  <td className="px-5 py-3 text-blue-600 dark:text-blue-400 font-medium text-right bg-blue-50/30 dark:bg-blue-900/10">
                    {row.blogReview?.toLocaleString() ?? '-'}
                  </td>
                </>
              )}
              {keywords.map(kw => visibleKeywords.has(kw) && (
                <td key={kw} className={cn(
                  "px-5 py-3 font-bold text-center",
                  row[kw] === 1 ? "text-rose-500" : row[kw] && row[kw] <= 10 ? "text-slate-900 dark:text-white" : "text-slate-500"
                )}>
                  {row[kw] !== null && row[kw] !== undefined ? `${row[kw]}위` : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
