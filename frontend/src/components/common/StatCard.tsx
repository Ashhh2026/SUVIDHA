import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'brand' | 'teal' | 'amber' | 'rose' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'brand',
  trend,
}) => {
  const iconBgStyles = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-300',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-card transition-all hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <span
              className={`inline-block mt-2 text-xs font-medium ${
                trend.isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
