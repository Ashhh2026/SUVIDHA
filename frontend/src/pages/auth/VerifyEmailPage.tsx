import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/authApi';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Missing verification token in link.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then((msg) => {
        setSuccess(true);
        setMessage(msg);
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification token is invalid or expired.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-card space-y-4">
        {loading ? (
          <div className="py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            <p className="text-xs text-slate-500">Verifying your institutional account...</p>
          </div>
        ) : success ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Verified!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
              >
                Proceed to Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">{message}</p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Return to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
