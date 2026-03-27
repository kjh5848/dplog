import React from 'react';

export const SkeletonsSection = () => {
  return (
    <div className="py-12 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 overflow-hidden">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="h-8 w-24 bg-slate-400 rounded"></div>
          <div className="h-8 w-32 bg-slate-400 rounded"></div>
          <div className="h-8 w-28 bg-slate-400 rounded"></div>
          <div className="h-8 w-36 bg-slate-400 rounded"></div>
          <div className="h-8 w-24 bg-slate-400 rounded"></div>
        </div>
      </div>
    </div>
  );
};
