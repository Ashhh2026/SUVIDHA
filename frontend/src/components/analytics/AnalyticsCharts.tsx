import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Sparkles, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  categoryDistribution: { category: string; count: number; avgRating: number }[];
  ratingScores: { rating: number; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  departmentTrends: { department: string; feedbackCount: number; grievanceCount: number }[];
  monthlyTrends: { month: string; feedback: number; grievances: number }[];
  complaintThemes: { theme: string; count: number; sentimentRatio: string }[];
}

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  categoryDistribution,
  ratingScores,
  statusBreakdown,
  departmentTrends,
  monthlyTrends,
  complaintThemes,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Monthly Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Submission Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Submission Activity
              </h3>
              <p className="text-xs text-slate-500">Feedback vs Grievance volumes (Last 6 Months)</p>
            </div>
            <TrendingUp className="w-5 h-5 text-brand-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGrievances" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="feedback"
                  name="Student Feedback"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorFeedback)"
                />
                <Area
                  type="monotone"
                  dataKey="grievances"
                  name="Grievances Filed"
                  stroke="#f43f5e"
                  fillOpacity={1}
                  fill="url(#colorGrievances)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Volume by Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Feedback Volume by Category
            </h3>
            <p className="text-xs text-slate-500">Distribution across campus operational domains</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={110}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => val.replace('_', ' ').slice(0, 14)}
                />
                <Tooltip />
                <Bar dataKey="count" name="Submissions" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Rating Breakdown, Department Comparisons & Grievance Statuses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Score Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Star Rating Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Frequency of ratings 1 to 5</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingScores}>
                <XAxis dataKey="rating" tickFormatter={(r) => `${r}★`} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Ratings" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grievance Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Grievance Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-2">Current resolution workflow distribution</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '10px' }}
                  formatter={(val) => val.replace('_', ' ')}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Volume Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Department Volumes
          </h3>
          <p className="text-xs text-slate-500 mb-4">Feedback vs Grievance count per department</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentTrends}>
                <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="feedbackCount" name="Feedback" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="grievanceCount" name="Grievances" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Smart Feedback Insights (Feature 14-A) */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-950 text-white rounded-2xl p-6 shadow-elevated">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
            Smart Feedback Insights: Recurring Campus Themes
          </h3>
        </div>
        <p className="text-xs text-brand-200 mb-5 max-w-2xl">
          Automated keyword frequency analysis dynamically highlights recurring student focus areas to guide administrative intervention.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {complaintThemes.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                {item.theme}
              </span>
              <p className="text-xl font-extrabold text-white mt-1">{item.count}</p>
              <p className="text-[10px] text-amber-300 mt-0.5">{item.sentimentRatio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
