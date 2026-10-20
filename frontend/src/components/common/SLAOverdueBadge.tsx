import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface SLAOverdueBadgeProps {
  targetDate?: string;
  status: string;
}

export const SLAOverdueBadge: React.FC<SLAOverdueBadgeProps> = ({ targetDate, status }) => {
  if (!targetDate || ['resolved', 'closed'].includes(status)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Resolved
      </span>
    );
  }

  const target = new Date(targetDate);
  const now = new Date();
  const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 0) {
    const overdueDays = Math.ceil(Math.abs(diffHours) / 24);
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5" /> OVERDUE ({overdueDays}d)
      </span>
    );
  }

  const remainingDays = Math.ceil(diffHours / 24);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
      <Clock className="w-3.5 h-3.5" /> SLA: {remainingDays}d remaining
    </span>
  );
};
