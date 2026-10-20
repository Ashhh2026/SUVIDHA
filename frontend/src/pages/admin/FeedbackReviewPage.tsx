import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, ShieldCheck, Star } from 'lucide-react';
import { feedbackApi } from '../../services/feedbackApi';
import { academicApi } from '../../services/academicApi';
import { Feedback, Department } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { StarRating } from '../../components/feedback/StarRating';
import { SkeletonTable } from '../../components/common/SkeletonLoader';

export const FeedbackReviewPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      feedbackApi.getAllFeedbacks({ limit: 100 }),
      academicApi.getDepartments(),
    ])
      .then(([fbRes, depts]) => {
        setFeedbacks(fbRes.feedbacks);
        setDepartments(depts);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      fb.comments.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || fb.category === categoryFilter;
    const matchesRating = ratingFilter === 'all' || fb.overallRating === Number(ratingFilter);
    return matchesSearch && matchesCat && matchesRating;
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback Review Console</h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect student course feedback, sentiment evaluations, and infrastructure improvement suggestions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reference or comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="faculty_teaching">Faculty & Teaching</option>
            <option value="course_curriculum">Course Curriculum</option>
            <option value="infrastructure_facilities">Infrastructure & Labs</option>
            <option value="hostel_mess">Hostel & Mess</option>
            <option value="it_services">IT & Wi-Fi</option>
            <option value="campus_cleanliness">Cleanliness</option>
            <option value="general_suggestions">Suggestions</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Grid of Feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((fb) => (
          <div
            key={fb._id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-brand-600">
                  {fb.referenceNumber}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                  {fb.category.replace('_', ' ')}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {fb.department?.name || fb.facility || 'Campus Wide'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    fb.sentiment === 'positive'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : fb.sentiment === 'negative'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {fb.sentiment}
                </span>
                <StatusBadge status={fb.status} />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <StarRating size="sm" value={fb.overallRating} readOnly />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ({fb.overallRating}/5)
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              "{fb.comments}"
            </p>

            {fb.suggestions && (
              <p className="text-xs text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300">Suggestion:</strong> {fb.suggestions}
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                {fb.submissionMode === 'anonymous' ? (
                  <span className="flex items-center gap-1 text-teal-600 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Anonymous
                  </span>
                ) : (
                  <span>
                    Submitter: <strong className="text-slate-700 dark:text-slate-300">{fb.student?.name || 'Identified Student'}</strong>
                  </span>
                )}
              </div>
              <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
