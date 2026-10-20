import React, { useState, useEffect } from 'react';
import { Bell, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { notificationApi } from '../../services/notificationApi';
import { Announcement } from '../../types';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [category, setCategory] = useState<'general' | 'academic' | 'maintenance' | 'event'>('general');
  const [targetRole, setTargetRole] = useState<'all' | 'student' | 'faculty'>('all');
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await notificationApi.getActiveAnnouncements();
      setAnnouncements(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      await notificationApi.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        priority,
        category,
        targetRole,
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast official notices, feedback deadlines, and maintenance schedules across campus.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  ann.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : ann.priority === 'important'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}
              >
                {ann.priority} Notice
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(ann.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">{ann.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>Audience: <strong className="text-slate-700 dark:text-slate-300 capitalize">{ann.targetRole}</strong></span>
              <span>Published by {ann.author?.name || 'Administrator'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-elevated">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Publish Campus Announcement
            </h3>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Course Evaluation Deadline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Campus Members</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type official details, deadlines, and instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
