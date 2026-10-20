import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquarePlus,
  AlertCircle,
  FolderOpen,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Bell,
  Users,
  Gamepad2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { feedbackApi } from '../../services/feedbackApi';
import { grievanceApi } from '../../services/grievanceApi';
import { notificationApi } from '../../services/notificationApi';
import { Feedback, Grievance, Announcement } from '../../types';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      feedbackApi.getMyFeedbacks(),
      grievanceApi.getMyGrievances(),
      notificationApi.getActiveAnnouncements(),
    ])
      .then(([fbs, grvs, anns]) => {
        setFeedbacks(fbs);
        setGrievances(grvs);
        setAnnouncements(anns);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalSubmissions = feedbacks.length + grievances.length;
  const pendingFeedback = feedbacks.filter((f) => f.status === 'submitted').length;
  const inProgressGrievances = grievances.filter((g) =>
    ['submitted', 'under_review', 'assigned', 'in_progress', 'awaiting_student_info'].includes(g.status)
  ).length;
  const resolvedIssues = grievances.filter((g) => ['resolved', 'closed'].includes(g.status)).length;

  if (loading) {
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-300">
            Student Portal • Semester {user?.semester || 7}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-brand-200 mt-1">
            Roll ID: <span className="font-mono">{user?.studentId || '2023CS0101'}</span> • Your voice directly powers academic excellence.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/student/feedback/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-brand-900 hover:bg-brand-50 shadow-sm transition-all"
          >
            <MessageSquarePlus className="w-4 h-4 text-brand-600" />
            Give Feedback
          </Link>
          <Link
            to="/student/grievance/new"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-700 hover:bg-brand-600 text-white shadow-sm transition-all"
          >
            <AlertCircle className="w-4 h-4 text-amber-300" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Announcements Bar (if any) */}
      {announcements.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
          <Bell className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Campus Announcement: {announcements[0].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle="Feedback & Grievances"
          icon={FolderOpen}
          variant="brand"
        />
        <StatCard
          title="Pending Feedback"
          value={pendingFeedback}
          subtitle="Under department review"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Active Grievances"
          value={inProgressGrievances}
          subtitle="Assigned & In Progress"
          icon={AlertCircle}
          variant="rose"
        />
        <StatCard
          title="Resolved Issues"
          value={resolvedIssues}
          subtitle="Closed satisfactorily"
          icon={CheckCircle}
          variant="teal"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/student/feedback/new"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all flex items-start gap-4 group"
        >
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 group-hover:scale-110 transition-transform">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Academic Feedback
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate subjects, professors, lab equipment, and campus hygiene.
            </p>
          </div>
        </Link>

        <Link
          to="/student/grievance/new"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all flex items-start gap-4 group"
        >
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              File a Grievance
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Report exam discrepancies, maintenance failures, or misconduct.
            </p>
          </div>
        </Link>

        <Link
          to="/peer-review"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all flex items-start gap-4 group"
        >
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Peer Review (360°)
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review classmates & view your private 360° radar feedback report.
            </p>
          </div>
        </Link>

        <Link
          to="/track"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-elevated transition-all flex items-start gap-4 group"
        >
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              Track Ticket
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Look up status using your secure tracking token.
            </p>
          </div>
        </Link>

        {/* Timepass & Mind Games Feature Card */}
        <Link
          to="/student/timepass"
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-indigo-950/40 border border-amber-300/70 dark:border-amber-700/60 shadow-card hover:shadow-elevated transition-all flex items-start gap-4 group md:col-span-2 lg:col-span-4"
        >
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                🎮 Timepass & Mind Games Lounge
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-black bg-rose-500 text-white tracking-wider animate-pulse">
                  Play & Destress
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Need a quick study break between lectures? Test your intellect with Italian Villa Memory Match, Speed Roman Math, Word Architect Anagrams, and 2048 Campus Edition!
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
            <span>Play Mind Games</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Grievances</h3>
            <p className="text-xs text-slate-500">Track resolution progress and staff updates</p>
          </div>
          <Link
            to="/student/submissions?tab=grievances"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            View all ({grievances.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {grievances.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">
            No grievances submitted yet. You can submit one anytime using the button above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">SLA Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {grievances.slice(0, 5).map((grv) => (
                  <tr key={grv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-brand-600">{grv.referenceNumber}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {grv.title}
                    </td>
                    <td className="p-3 capitalize">{grv.category.replace('_', ' ')}</td>
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
                        to={`/student/submissions?tab=grievances&id=${grv._id}`}
                        className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 font-semibold text-[11px]"
                      >
                        Inspect
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
