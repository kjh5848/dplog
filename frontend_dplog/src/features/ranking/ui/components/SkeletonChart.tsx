import React from 'react';

/** 스켈레톤 차트 */
export const SkeletonChart = () => (
  <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-6 animate-pulse">
    <div className="h-5 bg-slate-200 dark:bg-white/5 rounded w-32 mb-6" />
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-48" />
      <div className="h-8 bg-slate-200 dark:bg-white/5 rounded w-64" />
    </div>
    <div className="flex gap-2 mb-6">
      <div className="h-8 bg-slate-200 dark:bg-white/5 rounded-full w-24" />
      <div className="h-8 bg-slate-200 dark:bg-white/5 rounded-full w-24" />
      <div className="h-8 bg-slate-200 dark:bg-white/5 rounded-full w-24" />
    </div>
    <div className="h-72 bg-slate-50 dark:bg-white/[0.01] rounded-xl" />
  </div>
);
