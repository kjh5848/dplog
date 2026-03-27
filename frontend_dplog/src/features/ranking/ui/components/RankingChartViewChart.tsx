import React from 'react';
import { cn } from '@/shared/lib/utils';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import { LINE_COLORS } from './RankingChartConstants';

export const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const metrics = payload.filter((p: any) => ['방문자리뷰', '블로그리뷰', '저장'].includes(p.name));
  const rankings = payload.filter((p: any) => !['방문자리뷰', '블로그리뷰', '저장'].includes(p.name));

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-sm min-w-[220px]">
      <p className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-xs border-b border-slate-100 dark:border-slate-700 pb-2">
        {label ? new Date(label).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''}
      </p>

      {metrics.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          {metrics.map((entry: any, idx: number) => {
            const isReview = entry.name === '방문자리뷰' || entry.name === '블로그리뷰';
            const unit = isReview ? '개' : '건';
            const valueDisplay = entry.value !== null && entry.value !== undefined
              ? `${entry.value.toLocaleString()}${unit}`
              : '-';
              
            return (
              <div key={`metric-${idx}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn("size-2.5 rounded-sm")} style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 dark:text-slate-400 text-[13px] font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-[13px]">{valueDisplay}</span>
              </div>
            );
          })}
        </div>
      )}

      {rankings.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-0.5">
          {rankings.map((entry: any, idx: number) => {
            const valueDisplay = entry.value !== null && entry.value !== undefined
              ? `${entry.value}위` : '-';
            return (
              <div key={`rank-${idx}`} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn("size-2.5 rounded-full")} style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 dark:text-slate-400 text-[13px] font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-[13px]">{valueDisplay}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const CustomTick = ({ x, y, payload }: any) => {
  const d = new Date(payload.value);
  const isFirstDay = d.getDate() === 1;
  const text = isFirstDay ? `${d.getMonth() + 1}월 1일` : `${d.getDate()}일`;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={14}
        textAnchor="middle"
        className={cn(
          "text-[11px] transition-colors",
          isFirstDay 
            ? "fill-slate-800 font-extrabold dark:fill-slate-200" 
            : "fill-slate-400 font-medium dark:fill-slate-500"
        )}
      >
        {text}
      </text>
    </g>
  );
};

export const CustomTickSplit = ({ x, y, payload }: any) => {
  const d = new Date(payload.value);
  const isFirstDay = d.getDate() === 1;
  if (!isFirstDay) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" className="text-[10px] fill-slate-800 font-extrabold dark:fill-slate-200">
        {`${d.getMonth() + 1}월`}
      </text>
    </g>
  );
};

interface Props {
  viewMode: 'chart' | 'split';
  formattedData: any[];
  keywords: string[];
  visibleKeywords: Set<string>;
  showReviews: boolean;
}

export const RankingChartViewChart = ({ viewMode, formattedData, keywords, visibleKeywords, showReviews }: Props) => {
  if (viewMode === 'chart') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} vertical={false} />
          <XAxis dataKey="rawDate" tick={<CustomTick />} axisLine={{ stroke: '#e2e8f0', opacity: 0.3 }} tickLine={false} interval="preserveStartEnd" scale="band" />
          <YAxis yAxisId="left" reversed domain={[1, 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}위`} width={40} />
          {showReviews && (
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} width={40} />
          )}
          <Tooltip content={<ChartTooltip />} />
          {showReviews && (
            <>
              <Bar yAxisId="right" dataKey="visitorReview" name="방문자리뷰" fill="#10B981" opacity={0.15} radius={[4, 4, 0, 0]} barSize={20} stackId="metrics" />
              <Bar yAxisId="right" dataKey="blogReview" name="블로그리뷰" fill="#3B82F6" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} stackId="metrics" />
              <Bar yAxisId="right" dataKey="saveCount" name="저장" fill="#F59E0B" opacity={0.4} radius={[4, 4, 0, 0]} barSize={20} stackId="metrics" />
            </>
          )}
          {keywords.map((kw, idx) => visibleKeywords.has(kw) ? (
            <Line key={kw} yAxisId="left" type="monotone" dataKey={kw} name={kw} stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2.5} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 3 }} connectNulls />
          ) : null)}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">키워드 순위 추이</h4>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} vertical={false} />
            <XAxis dataKey="rawDate" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => { const d = new Date(val); return d.getDate() === 1 ? `${d.getMonth() + 1}월` : ''; }} />
            <YAxis reversed domain={[1, 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}위`} />
            <Tooltip content={<ChartTooltip />} />
            {keywords.map((kw, idx) => visibleKeywords.has(kw) && (
              <Line key={kw} type="monotone" dataKey={kw} name={kw} stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 0 }} activeDot={{ r: 4 }} connectNulls />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {showReviews && (
        <>
          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-1.5">방문자리뷰 추이</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} vertical={false} />
                <XAxis dataKey="rawDate" tick={<CustomTickSplit />} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#10B981' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="visitorReview" name="방문자리뷰" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-1.5">블로그리뷰 추이</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} vertical={false} />
                <XAxis dataKey="rawDate" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => { const d = new Date(val); return d.getDate() === 1 ? `${d.getMonth() + 1}월` : ''; }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#3B82F6' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="blogReview" name="블로그리뷰" fill="#3B82F6" opacity={0.9} radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-800/30">
            <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-1.5">저장 추이</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formattedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.06} vertical={false} />
                <XAxis dataKey="rawDate" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => { const d = new Date(val); return d.getDate() === 1 ? `${d.getMonth() + 1}월` : ''; }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#F59E0B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="saveCount" name="저장" fill="#F59E0B" opacity={0.9} radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
