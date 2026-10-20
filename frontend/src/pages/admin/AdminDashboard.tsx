import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  AlertTriangle,
  Download,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { analyticsApi } from '../../services/analyticsApi';
import { adminApi } from '../../services/adminApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { AnalyticsCharts } from '../../components/analytics/AnalyticsCharts';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import { Grievance } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [overdueGrievances, setOverdueGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getDashboardMetrics(),
      adminApi.getAllGrievances({ limit: 10 }),
    ])
      .then(([analyticsRes, grvRes]) => {
        setData(analyticsRes);
        // Find overdue grievances
        const overdue = grvRes.grievances.filter(
          (g) =>
            !['resolved', 'closed'].includes(g.status) &&
            g.targetResolutionDate &&
            new Date(g.targetResolutionDate) < new Date()
        );
        setOverdueGrievances(overdue);
      })
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
        <SkeletonTable rows={4} />
      </div>
    );
  }

  const { overview } = data;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-brand-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-300">
            Administrative Control Center • Real-Time Campus Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Campus Oversight & Analytics
          </h1>
          <p className="text-xs text-brand-200 mt-1">
            Tracking {overview.totalStudents} students • {overview.totalFeedback} feedback submissions • {overview.totalGrievances} grievances
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/grievances"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-950 hover:bg-brand-50 shadow-sm transition-all"
          >
            <AlertCircle className="w-4 h-4 text-brand-600" />
            Triage Grievances
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-800 hover:bg-brand-700 text-white shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-brand-300" />
            Export Data
          </Link>
        </div>
      </div>

      {/* 8 Primary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Students"
          value={overview.totalStudents}
          subtitle="Active student accounts"
          icon={Users}
          variant="brand"
        />
        <StatCard
          title="Total Feedback"
          value={overview.totalFeedback}
          subtitle={`Avg Score: ${overview.avgFeedbackRating} ★`}
          icon={MessageSquare}
          variant="teal"
        />
        <StatCard
          title="Total Grievances"
          value={overview.totalGrievances}
          subtitle={`${overview.openGrievances} Open / ${overview.resolvedGrievances} Resolved`}
          icon={AlertCircle}
          variant="amber"
        />
        <StatCard
          title="Resolution Rate"
          value={`${overview.resolutionRate}%`}
          subtitle={`Avg time: ${overview.avgResolutionDays} days`}
          icon={CheckCircle}
          variant="slate"
        />
      </div>

      {/* SLA Alert Banner if any overdue tickets */}
      {overview.overdueGrievances > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-bounce" />
            <span>
              <strong>Attention Required:</strong> {overview.overdueGrievances} grievances have exceeded their targeted resolution SLA date. Immediate administrative intervention recommended.
            </span>
          </div>
          <Link
            to="/admin/grievances?status=in_progress"
            className="px-3 py-1 font-bold rounded bg-rose-600 text-white hover:bg-rose-700 whitespace-nowrap"
          >
            Review Overdue
          </Link>
        </div>
      )}

      {/* Overdue Grievances Table (if any) */}
      {overdueGrievances.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Overdue Resolution Cases
              </h3>
              <p className="text-xs text-slate-500">Target SLA deadline expired</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Assigned To</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {overdueGrievances.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-rose-600">{g.referenceNumber}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {g.title}
                    </td>
                    <td className="p-3">
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="p-3 font-medium">
                      {g.assignedTo ? g.assignedTo.name : 'Unassigned'}
                    </td>
                    <td className="p-3">
                      <SLAOverdueBadge targetDate={g.targetResolutionDate} status={g.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/grievances?id=${g._id}`}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                      >
                        Escalate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Charts Engine (Recharts with real DB data) */}
      <AnalyticsCharts
        categoryDistribution={data.categoryDistribution}
        ratingScores={data.ratingScores}
        statusBreakdown={data.statusBreakdown}
        departmentTrends={data.departmentTrends}
        monthlyTrends={data.monthlyTrends}
        complaintThemes={data.complaintThemes}
      />
    </div>
  );
};
