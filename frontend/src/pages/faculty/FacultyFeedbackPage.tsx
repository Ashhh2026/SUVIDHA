import React, { useState, useEffect } from 'react';
import { BookOpen, Star, ShieldCheck, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { StarRating } from '../../components/feedback/StarRating';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const FacultyFeedbackPage: React.FC = () => {
  const [data, setData] = useState<{
    feedbacks: any[];
    averageRating: number;
    totalCount: number;
    sufficientData: boolean;
    ratingBreakdown: Record<number, number>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  useEffect(() => {
    api
      .get('/faculty/feedback')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const filteredFeedbacks = data.feedbacks.filter((fb) => {
    if (selectedRating === 'all') return true;
    return fb.overallRating === selectedRating;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Course & Teaching Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review student ratings, course curriculum assessments, and pedagogical reviews.
        </p>
      </div>

      {/* Sample Size Warning / Overview */}
      {!data.sufficientData ? (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          <h4 className="font-bold text-sm mb-1">Privacy Threshold Active</h4>
          <p>
            Currently, fewer than 2 student evaluations have been recorded for your assigned classes. In accordance with university privacy regulations, aggregated metrics and individual responses are hidden until sufficient submissions are received.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Metric Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left">
              <span className="text-xs uppercase font-bold text-slate-400">Average Student Rating</span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                {data.averageRating} <span className="text-amber-400">★</span>
              </div>
              <div className="flex justify-center md:justify-start mt-1">
                <StarRating size="sm" value={Math.round(data.averageRating)} readOnly />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Based on {data.totalCount} evaluations
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Rating Breakdown</span>
                <span>Submissions</span>
              </div>
              {[5, 4, 3, 2, 1].map((r) => {
                const count = data.ratingBreakdown[r] || 0;
                const pct = data.totalCount > 0 ? (count / data.totalCount) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-bold text-slate-700 dark:text-slate-300">{r} ★</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter by Score:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedRating('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedRating === 'all'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({data.totalCount})
                </button>
                {[5, 4, 3, 2, 1].map((score) => (
                  <button
                    key={score}
                    onClick={() => setSelectedRating(score)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedRating === score
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {score} ★
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Anonymous Submissions Sanitized</span>
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((fb) => (
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
                      {fb.subject?.name || fb.category.replace('_', ' ')}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {fb.course?.code ? `Course: ${fb.course.code}` : 'Subject Evaluation'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating size="sm" value={fb.overallRating} readOnly />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ({fb.overallRating}/5)
                    </span>
                  </div>
                </div>

                {/* Criteria */}
                {fb.criteriaRatings && fb.criteriaRatings.length > 0 && (
                  <div className="space-y-1 py-1 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    {fb.criteriaRatings.map((c: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span>{c.label}:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {c.score} / 5
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{fb.comments}"
                </p>

                {fb.suggestions && (
                  <p className="text-xs text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-300">Suggestion:</strong> {fb.suggestions}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Logged {new Date(fb.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold capitalize text-teal-600 dark:text-teal-400">
                    {fb.submissionMode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
