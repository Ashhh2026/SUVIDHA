import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  Send,
  RotateCcw,
  User,
  Shield,
} from 'lucide-react';
import { Grievance, GrievanceUpdate } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { SLAOverdueBadge } from '../common/SLAOverdueBadge';
import { grievanceApi } from '../../services/grievanceApi';

interface GrievanceTimelineProps {
  grievance: Grievance;
  updates: GrievanceUpdate[];
  userRole?: string;
  trackingToken?: string;
  onRefresh: () => void;
}

export const GrievanceTimeline: React.FC<GrievanceTimelineProps> = ({
  grievance,
  updates,
  userRole,
  trackingToken,
  onRefresh,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Status transition modal / controls for staff
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(grievance.status);
  const [officialMessage, setOfficialMessage] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Reopen modal for student
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  const canUpdateStatus = ['faculty', 'coordinator', 'admin'].includes(userRole || '');
  const canReopen =
    userRole === 'student' && ['resolved', 'closed'].includes(grievance.status);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await grievanceApi.reply(grievance._id, {
        message: replyText.trim(),
        token: trackingToken,
      });
      setReplyText('');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialMessage.trim()) return;

    setIsSubmittingStatus(true);
    try {
      await grievanceApi.updateStatus(grievance._id, {
        status: newStatus,
        message: officialMessage.trim(),
        isInternalOnly,
      });
      setStatusUpdateOpen(false);
      setOfficialMessage('');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    setIsReopening(true);
    try {
      await grievanceApi.reopen(grievance._id, reopenReason.trim());
      setReopenOpen(false);
      setReopenReason('');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reopen grievance.');
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/70 px-2.5 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                {grievance.referenceNumber}
              </span>
              <StatusBadge status={grievance.status} />
              <PriorityBadge priority={grievance.priority} />
              <SLAOverdueBadge targetDate={grievance.targetResolutionDate} status={grievance.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{grievance.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Category: <strong className="text-slate-700 dark:text-slate-200 capitalize">{grievance.category.replace('_', ' ')}</strong></span>
              {grievance.department && (
                <span>Department: <strong className="text-slate-700 dark:text-slate-200">{grievance.department.name}</strong></span>
              )}
              {grievance.location && (
                <span>Location: <strong className="text-slate-700 dark:text-slate-200">{grievance.location}</strong></span>
              )}
              <span>Logged: <strong className="text-slate-700 dark:text-slate-200">{new Date(grievance.createdAt).toLocaleDateString()}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canUpdateStatus && (
              <button
                onClick={() => setStatusUpdateOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
              >
                Update Status / Note
              </button>
            )}
            {canReopen && (
              <button
                onClick={() => setReopenOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen Grievance
              </button>
            )}
          </div>
        </div>

        {/* Full description */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Grievance Details
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {grievance.description}
          </p>

          {grievance.attachments && grievance.attachments.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-400">Attachments:</span>
              {grievance.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700"
                >
                  {att.fileName}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          Official Redressal Timeline & Communications
        </h3>

        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
          {updates.map((up) => {
            const isInternal = up.isInternalOnly;
            return (
              <div key={up._id} className="relative pl-6">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                    isInternal
                      ? 'bg-amber-500'
                      : up.updateType === 'status_change'
                      ? 'bg-brand-600'
                      : up.updateType === 'official_response'
                      ? 'bg-teal-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div
                  className={`p-4 rounded-xl border text-xs ${
                    isInternal
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {isInternal && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                          <Lock className="w-3 h-3" /> Private Staff Note
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {up.authorName || 'Campus Staff'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(up.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {up.newStatus && <StatusBadge status={up.newStatus} />}
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {up.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Reply Form */}
        {!['resolved', 'closed'].includes(grievance.status) && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              Provide Follow-up Response or Additional Information
            </h4>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={replyText}
                placeholder="Type your response to the staff team..."
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                onClick={handleSendReply}
                disabled={isSendingReply || !replyText.trim()}
                className="px-4 py-2 self-end rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-50 transition-all flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                {isSendingReply ? 'Sending...' : 'Reply'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Status Update Modal */}
      {statusUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Update Grievance Status & Response
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Change Lifecycle Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_student_info">Awaiting Student Information</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Response or Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={officialMessage}
                  placeholder="Detail action taken, resolution summary, or required student information..."
                  onChange={(e) => setOfficialMessage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internalOnly"
                  checked={isInternalOnly}
                  onChange={(e) => setIsInternalOnly(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="internalOnly" className="text-xs text-slate-700 dark:text-slate-300">
                  Mark as Internal Staff Note (hidden from student)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusUpdateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStatus}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                >
                  {isSubmittingStatus ? 'Saving...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Reopen Modal */}
      {reopenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reopen Grievance #{grievance.referenceNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              If the resolution provided was incomplete or the issue has recurred, specify the reason below.
            </p>
            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Reopening <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={reopenReason}
                  placeholder="Explain why the issue is not satisfactorily resolved (min 10 characters)..."
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReopenOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReopening}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isReopening ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
