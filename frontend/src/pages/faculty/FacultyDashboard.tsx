import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Users,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { StarRating } from '../../components/feedback/StarRating';
import { Grievance } from '../../types';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    metrics: {
      totalAssignedGrievances: number;
      pendingGrievances: number;
      resolvedGrievances: number;
      averageFeedbackRating: number;
      totalFeedbackCount: number;
      sufficientData: boolean;
    };
    assignedGrievances: Grievance[];
    feedbackAnalytics: any;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/faculty/dashboard')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { metrics, assignedGrievances, feedbackAnalytics } = data;

  return (
    <div className="space-y-8">
      {/* Faculty Welcome Header */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-300">
            Faculty Workspace • {user?.department ? 'Department Faculty' : 'Academic Portal'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-brand-200 mt-1">
            Faculty ID: <span className="font-mono">{user?.facultyId || 'FAC-CS-01'}</span> • Review assigned grievances and student feedback ratings.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/faculty/grievances"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-900 hover:bg-brand-50 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-brand-600" />
            Manage Issues ({metrics.pendingGrievances})
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Issues"
          value={metrics.totalAssignedGrievances}
          subtitle="Grievances directed to you"
          icon={AlertCircle}
          variant="brand"
        />
        <StatCard
          title="Pending Action"
          value={metrics.pendingGrievances}
          subtitle="In Progress or Awaiting Info"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Resolved"
          value={metrics.resolvedGrievances}
          subtitle="Cases completed"
          icon={CheckCircle}
          variant="teal"
        />
        <StatCard
          title="Average Rating"
          value={metrics.sufficientData ? `${metrics.averageFeedbackRating} ★` : 'N/A'}
          subtitle={metrics.sufficientData ? `Based on ${metrics.totalFeedbackCount} evaluations` : 'Sample size too small'}
          icon={Star}
          variant="slate"
        />
      </div>

      {/* Course Evaluation & Sample Size Privacy Notice */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Course & Teaching Feedback Summary
            </h3>
            <p className="text-xs text-slate-500">Student evaluations for your assigned subjects</p>
          </div>
          <Link
            to="/faculty/feedback"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Detailed View
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!metrics.sufficientData ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <strong>Privacy Protection Active:</strong> Fewer than 2 student evaluations have been recorded for your courses. Individual responses and score distributions are masked to protect student confidentiality until a statistically sufficient sample size is reached.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">Teaching Quality Score</span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {metrics.averageFeedbackRating} <span className="text-amber-400">★</span>
              </div>
              <div className="flex justify-center">
                <StarRating size="sm" value={Math.round(metrics.averageFeedbackRating)} readOnly />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Aggregated from {metrics.totalFeedbackCount} student submissions
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Score Distribution
              </h4>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = feedbackAnalytics.ratingBreakdown?.[star] || 0;
                const pct = metrics.totalFeedbackCount > 0 ? (count / metrics.totalFeedbackCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-7 font-bold text-slate-700 dark:text-slate-300">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Assigned Grievances Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Assigned Grievances Under Your Charge
            </h3>
            <p className="text-xs text-slate-500">Provide official updates or internal progress notes</p>
          </div>
          <Link
            to="/faculty/grievances"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            All Assigned ({assignedGrievances.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {assignedGrievances.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            No grievances currently assigned to your account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {assignedGrievances.slice(0, 5).map((grv) => (
                  <tr key={grv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-brand-600">{grv.referenceNumber}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {grv.title}
                    </td>
                    <td className="p-3">
                      <PriorityBadge priority={grv.priority} />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={grv.status} />
                    </td>
                    <td className="p-3">
                      <SLAOverdueBadge targetDate={grv.targetResolutionDate} status={grv.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/faculty/grievances?id=${grv._id}`}
                        className="px-3 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px]"
                      >
                        Respond
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
