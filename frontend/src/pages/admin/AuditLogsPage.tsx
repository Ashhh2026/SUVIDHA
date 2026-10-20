import React, { useState, useEffect } from 'react';
import { ShieldCheck, Filter, Clock, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { SkeletonTable } from '../../components/common/SkeletonLoader';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ limit: 100 });
      setLogs(res.logs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    if (categoryFilter === 'all') return true;
    return l.category === categoryFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable event ledger recording authentication attempts, grievance status modifications, and administrative assignments.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">All Audit Categories</option>
            <option value="auth">Authentication & Sessions</option>
            <option value="grievance">Grievance Actions</option>
            <option value="feedback">Feedback Submissions</option>
            <option value="admin">Administrative Actions</option>
            <option value="security">Security & Access Alerts</option>
          </select>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Zero Sensitive Credential Leakage</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Triggered By</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 font-bold font-mono text-[11px] text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        log.category === 'security'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : log.category === 'admin'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium">
                    {log.user ? `${log.user.name} (${log.user.role})` : 'System / Anonymous'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="p-3.5 text-[11px] font-mono text-slate-500 max-w-xs truncate">
                    {JSON.stringify(log.details || {})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
