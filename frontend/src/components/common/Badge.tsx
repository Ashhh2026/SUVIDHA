import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'teal' | 'amber' | 'rose' | 'indigo' | 'slate' | 'violet';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm' }) => {
  const variantStyles = {
    teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} transition-colors`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; variant: 'teal' | 'amber' | 'rose' | 'indigo' | 'slate' }> = {
    submitted: { label: 'Submitted', variant: 'slate' },
    under_review: { label: 'Under Review', variant: 'indigo' },
    assigned: { label: 'Assigned', variant: 'indigo' },
    in_progress: { label: 'In Progress', variant: 'amber' },
    awaiting_student_info: { label: 'Awaiting Info', variant: 'amber' },
    resolved: { label: 'Resolved', variant: 'teal' },
    closed: { label: 'Closed', variant: 'slate' },
    reopened: { label: 'Reopened', variant: 'rose' },
    reviewed: { label: 'Reviewed', variant: 'indigo' },
    addressed: { label: 'Addressed', variant: 'teal' },
  };

  const config = map[status] || { label: status.replace('_', ' '), variant: 'slate' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, { label: string; variant: 'teal' | 'amber' | 'rose' | 'slate' }> = {
    low: { label: 'Low', variant: 'slate' },
    medium: { label: 'Medium', variant: 'teal' },
    high: { label: 'High', variant: 'amber' },
    critical: { label: 'Critical', variant: 'rose' },
  };

  const config = map[priority] || { label: priority, variant: 'slate' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
