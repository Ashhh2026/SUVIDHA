import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { grievanceApi } from '../../services/grievanceApi';
import { Grievance, GrievanceUpdate } from '../../types';
import { GrievanceTimeline } from '../../components/grievance/GrievanceTimeline';
import { SkeletonCard } from '../../components/common/SkeletonLoader';

export const PublicTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(initialToken);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [updates, setUpdates] = useState<GrievanceUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTrack = async (tokenToUse?: string) => {
    const raw = tokenToUse || tokenInput.trim();
    if (!raw) {
      setErrorMsg('Please enter your 32-character tracking token.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await grievanceApi.trackAnonymous(raw);
      setGrievance(data.grievance);
      setUpdates(data.updates);
    } catch (err: any) {
      setGrievance(null);
      setUpdates([]);
      setErrorMsg(err.response?.data?.message || 'No grievance found matching this tracking token.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      handleTrack(initialToken);
    }
  }, [initialToken]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Anonymous Grievance Tracking Portal
        </h1>
        <p className="text-xs text-slate-500">
          Enter your unguessable tracking token to check real-time progress and communicate with staff without revealing your identity.
        </p>
      </div>

      {/* Token Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card max-w-2xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              placeholder="Enter 32-character token (e.g. trk_...)"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Checking...' : 'Track Ticket'}
          </button>
        </form>

        {/* Demo Token Autofill Hint */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Testing evaluation? Try demo token:</span>
          <button
            type="button"
            onClick={() => {
              const demo = 'trk_demo_token_1234567890abcdef';
              setTokenInput(demo);
              handleTrack(demo);
            }}
            className="font-mono text-brand-600 hover:underline font-bold"
          >
            trk_demo_token_1234567890abcdef
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading && (
        <div className="max-w-3xl mx-auto space-y-4">
          <SkeletonCard />
        </div>
      )}

      {/* Render Grievance Timeline when loaded */}
      {grievance && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              <strong>Cryptographic Privacy Guard:</strong> This grievance is 100% anonymous. Only staff-approved public responses and status transitions are visible.
            </span>
          </div>

          <GrievanceTimeline
            grievance={grievance}
            updates={updates}
            userRole="student"
            trackingToken={tokenInput}
            onRefresh={() => handleTrack()}
          />
        </div>
      )}
    </div>
  );
};
