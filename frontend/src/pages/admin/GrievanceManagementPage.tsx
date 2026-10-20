import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { academicApi } from '../../services/academicApi';
import { grievanceApi } from '../../services/grievanceApi';
import { Grievance, GrievanceUpdate } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { SLAOverdueBadge } from '../../components/common/SLAOverdueBadge';
import { GrievanceTimeline } from '../../components/grievance/GrievanceTimeline';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

export const GrievanceManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get('id');
  const { user } = useAuth();

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Selected Detail
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [selectedUpdates, setSelectedUpdates] = useState<GrievanceUpdate[]>([]);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetGrievance, setTargetGrievance] = useState<Grievance | null>(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignSLADate, setAssignSLADate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const [grvRes, facRes] = await Promise.all([
        adminApi.getAllGrievances({ limit: 100 }),
        academicApi.getFacultyList(),
      ]);
      setGrievances(grvRes.grievances);
      setFacultyMembers(facRes);

      if (idParam) {
        const found = grvRes.grievances.find((g: Grievance) => g._id === idParam);
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
    try {
      const data = await grievanceApi.getById(id);
      setSelectedGrievance(data.grievance);
      setSelectedUpdates(data.updates);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load details.');
    }
  };

  const handleOpenAssign = (g: Grievance) => {
    setTargetGrievance(g);
    setAssigneeId(g.assignedTo?._id || (facultyMembers[0]?._id ?? ''));
    setAssignNotes('');
    setAssignSLADate('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGrievance || !assigneeId) return;

    setIsAssigning(true);
    try {
      await adminApi.assignGrievance(targetGrievance._id, {
        assignedTo: assigneeId,
        targetResolutionDate: assignSLADate || undefined,
        notes: assignNotes.trim() || undefined,
      });
      setAssignModalOpen(false);
      fetchGrievances();
      if (selectedGrievance && selectedGrievance._id === targetGrievance._id) {
        loadDetails(targetGrievance._id);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign grievance.');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = grievances.filter((g) => {
    const matchesSearch =
      g.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || g.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
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
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Grievance Triage & Assignment Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review campus complaints, assign cases to faculty in-charges, monitor SLA target deadlines, and escalate unresolved issues.
        </p>
      </div>

      {selectedGrievance ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedGrievance(null)}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              ← Back to triage list
            </button>
            <button
              onClick={() => handleOpenAssign(selectedGrievance)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
            >
              <UserPlus className="w-4 h-4" />
              Reassign Ticket
            </button>
          </div>
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
                placeholder="Search reference or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="awaiting_student_info">Awaiting Info</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="reopened">Reopened</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
            {filtered.length === 0 ? (
              <p className="text-center py-12 text-xs text-slate-500">
                No grievances match your search criteria.
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
                      <th className="p-3.5">Assignee</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">SLA Target</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filtered.map((g) => (
                      <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono font-bold text-brand-600">
                          {g.referenceNumber}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            {g.isSensitive && (
                              <span title="Confidential Misconduct Report">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                              </span>
                            )}
                            <span className="truncate">{g.title}</span>
                          </div>
                        </td>
                        <td className="p-3.5 capitalize">{g.category.replace('_', ' ')}</td>
                        <td className="p-3.5">
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td className="p-3.5 font-medium">
                          {g.assignedTo ? (
                            <span className="text-slate-900 dark:text-white">{g.assignedTo.name}</span>
                          ) : (
                            <span className="text-amber-600 font-semibold italic">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="p-3.5">
                          <SLAOverdueBadge targetDate={g.targetResolutionDate} status={g.status} />
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenAssign(g)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px]"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => loadDetails(g._id)}
                            className="px-2.5 py-1 rounded bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold text-[11px]"
                          >
                            Details
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

      {/* Assignment Modal */}
      {assignModalOpen && targetGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Assign Grievance #{targetGrievance.referenceNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate">{targetGrievance.title}</p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assign To Faculty / Staff In-charge
                </label>
                <select
                  required
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {facultyMembers.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.role.toUpperCase()}) - {f.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Resolution SLA Date (Optional)
                </label>
                <input
                  type="date"
                  value={assignSLADate}
                  onChange={(e) => setAssignSLADate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Directive or Assignment Notes
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  placeholder="e.g. Please inspect the hardware kit and report repair requisition..."
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
