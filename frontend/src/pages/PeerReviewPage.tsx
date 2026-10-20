import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Search,
  MessageSquare,
  ThumbsUp,
  X,
  TrendingUp,
  Lightbulb,
  UserCheck,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { peerReviewApi } from '../services/peerReviewApi';
import { ClassmateItem, PeerFeedbackReport } from '../types';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/common/SkeletonLoader';
import { checkAbusiveContent } from '../utils/moderation';

const STRENGTH_OPTIONS = [
  'Great Leader',
  'Quick Problem Solver',
  'Reliable Team Member',
  'Technically Strong',
  'Supportive',
  'Punctual',
  'Organized',
  'Active Listener',
  'Innovative Ideas',
  'Helpful',
];

export const PeerReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'review-classmates' | 'my-feedback'>('review-classmates');

  // Classmates state
  const [classmates, setClassmates] = useState<ClassmateItem[]>([]);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loadingClassmates, setLoadingClassmates] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modal review state
  const [selectedPeer, setSelectedPeer] = useState<ClassmateItem | null>(null);
  const [teamworkRating, setTeamworkRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [problemSolvingRating, setProblemSolvingRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Real-time abusive content check
  const abuseDetection = checkAbusiveContent(areasForImprovement, comments, ...selectedStrengths);

  // My 360 Feedback state
  const [feedbackReport, setFeedbackReport] = useState<PeerFeedbackReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);

  const loadClassmates = async () => {
    setLoadingClassmates(true);
    try {
      const data = await peerReviewApi.getClassmates();
      setClassmates(data.classmates);
      setTotalReviewed(data.totalReviewed);
      setCompletionPercentage(data.completionPercentage);
    } catch (err: any) {
      console.error('Failed to load classmates:', err);
    } finally {
      setLoadingClassmates(false);
    }
  };

  const loadFeedbackReport = async () => {
    setLoadingReport(true);
    try {
      const data = await peerReviewApi.getMyReceivedFeedback();
      setFeedbackReport(data);
    } catch (err: any) {
      console.error('Failed to load peer feedback report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadClassmates();
    loadFeedbackReport();
  }, []);

  const openReviewModal = (peer: ClassmateItem) => {
    setSelectedPeer(peer);
    setSubmitSuccess(null);
    setSubmitError(null);

    if (peer.review) {
      setTeamworkRating(peer.review.ratings.teamwork);
      setCommunicationRating(peer.review.ratings.communication);
      setProblemSolvingRating(peer.review.ratings.problemSolving);
      setPunctualityRating(peer.review.ratings.punctuality);
      setSelectedStrengths(peer.review.strengths || []);
      setAreasForImprovement(peer.review.areasForImprovement || '');
      setComments(peer.review.comments || '');
      setIsAnonymous((peer.review as any).isAnonymous ?? true);
    } else {
      setTeamworkRating(5);
      setCommunicationRating(5);
      setProblemSolvingRating(5);
      setPunctualityRating(5);
      setSelectedStrengths([]);
      setAreasForImprovement('');
      setComments('');
      setIsAnonymous(true);
    }
  };

  const closeReviewModal = () => {
    setSelectedPeer(null);
  };

  const toggleStrength = (strength: string) => {
    if (selectedStrengths.includes(strength)) {
      setSelectedStrengths(selectedStrengths.filter((s) => s !== strength));
    } else {
      if (selectedStrengths.length < 5) {
        setSelectedStrengths([...selectedStrengths, strength]);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer) return;

    if (abuseDetection.hasProfanity) {
      setSubmitError(abuseDetection.warningMessage || 'Inappropriate or abusive language detected.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await peerReviewApi.submitPeerReview({
        revieweeId: selectedPeer._id,
        ratings: {
          teamwork: teamworkRating,
          communication: communicationRating,
          problemSolving: problemSolvingRating,
          punctuality: punctualityRating,
        },
        strengths: selectedStrengths,
        areasForImprovement,
        comments,
        isAnonymous,
      });

      setSubmitSuccess(
        `Review for ${selectedPeer.name} submitted successfully (${
          isAnonymous ? 'as Anonymous Classmate' : 'as Genuine Named Review'
        })!`
      );
      await loadClassmates();
      await loadFeedbackReport();
      setTimeout(() => {
        closeReviewModal();
      }, 1300);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClassmates = classmates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.studentId && c.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return !c.isReviewed;
    if (statusFilter === 'completed') return c.isReviewed;
    return true;
  });

  const renderStarSelector = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    description: string
  ) => {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {label}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <span className="text-sm font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            {value} / 5
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const radarData = feedbackReport?.averageRatings
    ? [
        { subject: 'Teamwork', score: feedbackReport.averageRatings.teamwork, fullMark: 5 },
        { subject: 'Communication', score: feedbackReport.averageRatings.communication, fullMark: 5 },
        { subject: 'Problem Solving', score: feedbackReport.averageRatings.problemSolving, fullMark: 5 },
        { subject: 'Punctuality', score: feedbackReport.averageRatings.punctuality, fullMark: 5 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold tracking-wide uppercase">
                <Users className="w-4 h-4" />
                <span>Classroom 360° Evaluation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Classmate Peer Review Center
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Review your classmates on collaboration, communication, and technical problem solving,
                and review anonymous 360° growth feedback from your peers.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>
                <strong>Double-Blind Guarantee:</strong> All peer reviews are 100% anonymous to classmates.
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-b border-slate-200 dark:border-slate-700 -mb-px">
            <button
              onClick={() => setActiveTab('review-classmates')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'review-classmates'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Review Classmates</span>
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {classmates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('my-feedback')}
              className={`pb-4 px-2 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'my-feedback'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>My Peer Feedback (360° Report)</span>
              {feedbackReport && feedbackReport.totalReviewsReceived > 0 && (
                <span className="bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs px-2 py-0.5 rounded-full font-bold">
                  {feedbackReport.totalReviewsReceived} Reviews
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'review-classmates' ? (
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Class Review Progress
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You have evaluated {totalReviewed} out of {classmates.length} classmates in your class section.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {completionPercentage}%
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Completed</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-teal-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classmate name or roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  All ({classmates.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Pending ({classmates.filter((c) => !c.isReviewed).length})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-teal-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Completed ({classmates.filter((c) => c.isReviewed).length})
                </button>
              </div>
            </div>

            {/* Classmates Grid */}
            {loadingClassmates ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : filteredClassmates.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  No Classmates Found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {searchQuery
                    ? 'No classmate matches your search criteria.'
                    : 'Your class section currently does not have other enrolled students.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredClassmates.map((peer) => {
                  const initials = peer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={peer._id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {initials}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                                {peer.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {peer.studentId || 'Classmate'}
                              </p>
                            </div>
                          </div>

                          {peer.isReviewed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                              <span>⭐ {peer.review?.ratings.overall.toFixed(1)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>

                        {peer.isReviewed && peer.review && (
                          <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Teamwork:</span>
                              <span className="font-semibold">{peer.review.ratings.teamwork}/5</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Problem Solving:</span>
                              <span className="font-semibold">
                                {peer.review.ratings.problemSolving}/5
                              </span>
                            </div>
                            {peer.review.strengths && peer.review.strengths.length > 0 && (
                              <div className="pt-1 flex flex-wrap gap-1">
                                {peer.review.strengths.slice(0, 2).map((s) => (
                                  <span
                                    key={s}
                                    className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {peer.review.strengths.length > 2 && (
                                  <span className="text-[10px] text-slate-400 self-center">
                                    +{peer.review.strengths.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          onClick={() => openReviewModal(peer)}
                          className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                            peer.isReviewed
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{peer.isReviewed ? 'Edit My Review' : 'Submit Review'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* My 360 Feedback Report Tab */
          <div className="space-y-8">
            {loadingReport ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : !feedbackReport || feedbackReport.totalReviewsReceived === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                <Sparkles className="w-14 h-14 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  No Peer Reviews Received Yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  When your classmates complete their evaluations for you, your 360° radar competency
                  chart and constructive feedback cards will appear here automatically.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('review-classmates')}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700"
                  >
                    <Users className="w-4 h-4" />
                    <span>Review Your Classmates First</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Score Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-200 dark:border-amber-800">
                      ⭐
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Overall Peer Rating</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                        {feedbackReport.averageRatings?.overall.toFixed(1)} / 5.0
                      </h4>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                        Based on {feedbackReport.totalReviewsReceived} classmates
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center font-bold text-xl border border-indigo-200 dark:border-indigo-800">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Teamwork Score</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                        {feedbackReport.averageRatings?.teamwork.toFixed(1)} / 5.0
                      </h4>
                      <p className="text-[11px] text-slate-500">Group collaboration</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center font-bold text-xl border border-purple-200 dark:border-purple-800">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Problem Solving</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                        {feedbackReport.averageRatings?.problemSolving.toFixed(1)} / 5.0
                      </h4>
                      <p className="text-[11px] text-slate-500">Technical ability</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-500 flex items-center justify-center font-bold text-xl border border-teal-200 dark:border-teal-800">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Punctuality</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                        {feedbackReport.averageRatings?.punctuality.toFixed(1)} / 5.0
                      </h4>
                      <p className="text-[11px] text-slate-500">Deadline discipline</p>
                    </div>
                  </div>
                </div>

                {/* Radar Chart & Top Strengths */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        360° Competency Radar
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Visual representation of your evaluated traits across all peer submissions.
                    </p>

                    <div className="h-64 sm:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis domain={[0, 5]} stroke="#94a3b8" />
                          <Radar
                            name="Your Score"
                            dataKey="score"
                            stroke="#6366f1"
                            fill="#818cf8"
                            fillOpacity={0.5}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Endorsed Strengths */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                          Top Peer Endorsements
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Qualities your classmates most frequently recognized in your work.
                      </p>

                      <div className="flex flex-wrap gap-2.5">
                        {feedbackReport.topStrengths.map((item) => (
                          <div
                            key={item.tag}
                            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{item.tag}</span>
                            <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              ×{item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <p>
                        💡 <strong>Career Insight:</strong> Use these peer endorsements to showcase your
                        strengths on your resume and in campus placement interviews!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anonymous Constructive Feedback Wall */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                        Anonymous Constructive Feedback Wall
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Honest suggestions and compliments shared by verified classmates.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackReport.feedbackList.map((fb, idx) => (
                      <div
                        key={fb._id || idx}
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            {!fb.isAnonymous && fb.reviewer ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                  {fb.reviewer.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                                    {fb.reviewer.name}
                                  </span>
                                  {fb.reviewer.studentId && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      ({fb.reviewer.studentId})
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded-full font-semibold border border-teal-200 dark:border-teal-800">
                                    Named Review
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-indigo-500 flex items-center justify-center font-bold text-xs">
                                  <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Anonymous Classmate
                                  </span>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-medium">
                                    Double-Blind
                                  </span>
                                </div>
                              </div>
                            )}

                            <span className="text-xs font-bold text-amber-500 shrink-0">
                              ⭐ {fb.ratings.overall.toFixed(1)} / 5.0
                            </span>
                          </div>

                          {/* Strengths tags */}
                          {fb.strengths && fb.strengths.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {fb.strengths.map((st) => (
                                <span
                                  key={st}
                                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-2 py-0.5 rounded-md"
                                >
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Comments */}
                          {fb.comments && (
                            <div className="mb-2">
                              <p className="text-xs text-slate-700 dark:text-slate-200 italic bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                "{fb.comments}"
                              </p>
                            </div>
                          )}

                          {/* Areas for improvement */}
                          {fb.areasForImprovement && (
                            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Tip for growth:{' '}
                              </span>
                              <span>{fb.areasForImprovement}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 text-[10px] text-slate-400 text-right">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Review Modal Dialog */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
            <button
              onClick={closeReviewModal}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                {selectedPeer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Review {selectedPeer.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedPeer.studentId || 'Classmate'} • Anonymous Peer Review
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-teal-700 dark:text-teal-300 text-xs font-semibold">
                {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-700 dark:text-red-300 text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* 4 Competency Stars */}
              <div className="space-y-3">
                {renderStarSelector(
                  '1. Teamwork & Collaboration',
                  teamworkRating,
                  setTeamworkRating,
                  'Active contribution to team projects, cooperative spirit, and dependability.'
                )}

                {renderStarSelector(
                  '2. Communication & Listening',
                  communicationRating,
                  setCommunicationRating,
                  'Articulating ideas clearly and listening respectfully to team viewpoints.'
                )}

                {renderStarSelector(
                  '3. Technical Problem Solving',
                  problemSolvingRating,
                  setProblemSolvingRating,
                  'Analytical contribution, practical problem-solving, and lab execution.'
                )}

                {renderStarSelector(
                  '4. Punctuality & Reliability',
                  punctualityRating,
                  setPunctualityRating,
                  'Meeting lab deadlines, punctuality in meetings, and personal accountability.'
                )}
              </div>

              {/* Endorse Strengths */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Endorse Strengths (Select up to 5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {STRENGTH_OPTIONS.map((tag) => {
                    const isSelected = selectedStrengths.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleStrength(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Constructive Advice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tip for Growth & Improvement (Constructive & Respectful)
                </label>
                <textarea
                  rows={2}
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  placeholder="e.g., Could explain code logic in simpler terms during presentations..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Positive Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Compliments & Positive Remarks
                </label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g., Outstanding partner in our semester cloud lab practical!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Real-time Content Restriction Alert */}
              {abuseDetection.hasProfanity && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Content Restriction: Inappropriate Language</p>
                    <p className="text-[11px] font-normal mt-0.5">{abuseDetection.warningMessage}</p>
                  </div>
                </div>
              )}

              {/* Review Visibility Mode Selector (Dual-Mode Choice) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Review Visibility Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Anonymous */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(true)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isAnonymous
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-700 dark:text-indigo-300">
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        <span>Anonymous Mode</span>
                      </div>
                      {isAnonymous && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 font-bold" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Your identity is hidden. Peer sees only "Anonymous Classmate".
                    </p>
                  </button>

                  {/* Option 2: Genuine Named */}
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(false)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      !isAnonymous
                        ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-600 dark:border-teal-400 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-teal-700 dark:text-teal-300">
                        <UserCheck className="w-4 h-4 text-teal-500" />
                        <span>Genuine Named Review</span>
                      </div>
                      {!isAnonymous && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 font-bold" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Your name ({user?.name || 'You'}) & Roll No will be visible.
                    </p>
                  </button>
                </div>
              </div>

              {/* Privacy / Identity Explainer */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                {isAnonymous ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Double-Blind Protection:</strong> Your ratings and constructive feedback will be
                      anonymously aggregated. {selectedPeer.name} will never know who submitted this review.
                    </span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Public Endorsement:</strong> {selectedPeer.name} will be able to see that you
                      personally vouched for their collaboration skills.
                    </span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || abuseDetection.hasProfanity}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50 ${
                    isAnonymous
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {submitting
                    ? 'Submitting...'
                    : isAnonymous
                    ? 'Submit Anonymous Review'
                    : 'Submit Named Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
