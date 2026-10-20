import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { grievanceApi } from '../../services/grievanceApi';
import { Grievance, GrievanceUpdate } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { GrievanceTimeline } from '../../components/grievance/GrievanceTimeline';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

export const AssignedGrievancesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const { user } = useAuth();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Detail View
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [selectedUpdates, setSelectedUpdates] = useState<GrievanceUpdate[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty/grievances');
      const list: Grievance[] = res.data.data.grievances;
      setGrievances(list);

      if (idParam) {
        const found = list.find((g) => g._id === idParam);
        if (found) loadDetails(found._id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  const loadDetails = async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await grievanceApi.getById(id);
      setSelectedGrievance(data.grievance);
      setSelectedUpdates(data.updates);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = grievances.filter((g) => {
    const matchesSearch =
      g.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Grievances</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review complaints assigned to you, update workflow status, and log official responses or internal notes.
        </p>
      </div>

      {selectedGrievance ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGrievance(null)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            ← Back to all assigned grievances
          </button>
          <GrievanceTimeline
            grievance={selectedGrievance}
            updates={selectedUpdates}
            userRole={user?.role}
            onRefresh={() => loadDetails(selectedGrievance._id)}
          />
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reference ID or title..."
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
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_student_info">Awaiting Info</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-500">
                No assigned grievances matching criteria.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Reference</th>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">SLA Timeline</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filtered.map((g) => (
                      <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-bold text-brand-600">{g.referenceNumber}</td>
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
                        <td className="p-3.5 text-slate-500">{new Date(g.createdAt).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => loadDetails(g._id)}
                            className="px-3 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px]"
                          >
                            Respond
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
