import React, { useState } from 'react';
import { Download, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export const ReportsPage: React.FC = () => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleExport = async (type: 'feedback' | 'grievances') => {
    setDownloadingType(type);
    try {
      const blob = await adminApi.exportReport(type);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `suvidha-${type}-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert('Failed to generate export report.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CSV Data Export Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate sanitized CSV reports for campus quality assurance audits and departmental accreditation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feedback Report Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Academic Feedback Dataset (.CSV)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export all feedback submissions including ratings, department codes, courses, sentiment tags, and timestamps.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Anonymous records are exported with student identities permanently masked.</span>
          </div>

          <button
            onClick={() => handleExport('feedback')}
            disabled={downloadingType === 'feedback'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloadingType === 'feedback' ? 'Generating CSV...' : 'Download Feedback CSV'}
          </button>
        </div>

        {/* Grievances Report Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Grievance & Redressal Dataset (.CSV)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Export campus complaints, priority categorizations, assigned staff members, resolution statuses, and turnaround dates.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Confidential harassment reports are sanitized to safeguard sensitive records.</span>
          </div>

          <button
            onClick={() => handleExport('grievances')}
            disabled={downloadingType === 'grievances'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:opacity-50 transition-all"
          >
            <Download className="w-4 h-4" />
            {downloadingType === 'grievances' ? 'Generating CSV...' : 'Download Grievance CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};
