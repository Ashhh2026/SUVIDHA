import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FolderOpen,
  MessageSquare,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { feedbackApi } from '../../services/feedbackApi';
import { grievanceApi } from '../../services/grievanceApi';
import { Feedback, Grievance, GrievanceUpdate } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { StarRating } from '../../components/feedback/StarRating';
import { GrievanceTimeline } from '../../components/grievance/GrievanceTimeline';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

export const MySubmissionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const tabParam = searchParams.get('tab') || 'grievances';
  const idParam = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'grievances' | 'feedback'>(
    tabParam === 'feedback' ? 'feedback' : 'grievances'
  );

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Grievance Details for modal/expanded view
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [selectedUpdates, setSelectedUpdates] = useState<GrievanceUpdate[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fbs, grvs] = await Promise.all([
        feedbackApi.getMyFeedbacks(),
        grievanceApi.getMyGrievances(),
      ]);
      setFeedbacks(fbs);
      setGrievances(grvs);

      // If idParam exists, load it
      if (idParam) {
        const found = grvs.find((g) => g._id === idParam);
        if (found) loadGrievanceDetails(found._id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadGrievanceDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await grievanceApi.getById(id);
      setSelectedGrievance(data.grievance);
      setSelectedUpdates(data.updates);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleTabChange = (tab: 'grievances' | 'feedback') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSelectedGrievance(null);
  };

  // Filtering
  const filteredGrievances = grievances.filter((g) => {
    const matchesSearch =
      g.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.comments.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonTable rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Submissions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your identified academic feedback and track official grievance resolution progress.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
        <button
          onClick={() => handleTabChange('grievances')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'grievances'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Campus Grievances ({grievances.length})
        </button>

        <button
          onClick={() => handleTabChange('feedback')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Academic Feedback ({feedbacks.length})
        </button>
      </div>

      {/* If single grievance is selected, show detail timeline */}
      {selectedGrievance ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGrievance(null)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            ← Back to all submissions
          </button>
          <GrievanceTimeline
            grievance={selectedGrievance}
            updates={selectedUpdates}
            userRole={user?.role}
            onRefresh={() => loadGrievanceDetails(selectedGrievance._id)}
          />
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by Reference ID or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'grievances' ? (
                  <>
                    <option value="submitted">Submitted</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </>
                ) : (
                  <>
                    <option value="submitted">Submitted</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="addressed">Addressed</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Grievances List */}
          {activeTab === 'grievances' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
              {filteredGrievances.length === 0 ? (
                <p className="text-center py-12 text-xs text-slate-500">
                  No grievances found matching your criteria.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Reference</th>
                        <th className="p-3.5">Title / Subject</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">SLA Timeline</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {filteredGrievances.map((g) => (
                        <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-brand-600">
                            {g.referenceNumber}
                          </td>
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                            {g.title}
                          </td>
                          <td className="p-3.5 capitalize">{g.category.replace('_', ' ')}</td>
                          <td className="p-3.5">
                            <PriorityBadge priority={g.priority} />
                          </td>
                          <td className="p-3.5">
                            <StatusBadge status={g.status} />
                          </td>
                          <td className="p-3.5">
                            <SLAOverdueBadge targetDate={g.targetResolutionDate} status={g.status} />
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(g.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => loadGrievanceDetails(g._id)}
                              className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px] transition-colors"
                            >
                              Inspect Timeline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Feedback List */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {filteredFeedbacks.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 shadow-card">
                  No feedback records found. Note: Anonymous feedback is intentionally unlinked from your account to guarantee complete privacy.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFeedbacks.map((f) => (
                    <div
                      key={f._id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-brand-600">
                            {f.referenceNumber}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-0.5">
                            {f.category.replace('_', ' ')}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {f.department?.name || f.facility || 'Campus Wide'}
                          </p>
                        </div>
                        <StatusBadge status={f.status} />
                      </div>

                      <div className="flex items-center gap-2">
                        <StarRating size="sm" value={f.overallRating} readOnly />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ({f.overallRating}/5)
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{f.comments}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Submitted on {new Date(f.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize font-semibold text-slate-600 dark:text-slate-300">
                          {f.submissionMode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
