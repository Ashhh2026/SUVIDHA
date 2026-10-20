import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card animate-pulse space-y-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-3/4"></div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-card animate-pulse space-y-3">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
};
