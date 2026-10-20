import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/authApi';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.forgotPassword(email.trim());
      setSuccessMsg(res.message);
      if (res.resetToken) setResetToken(res.resetToken);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to request reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-card space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-xs text-slate-500">
            Enter your email to receive a password recovery link
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs">
              <CheckCircle className="w-5 h-5 mx-auto mb-2 text-teal-600" />
              <p>{successMsg}</p>
            </div>

            {resetToken && (
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs text-left">
                <span className="text-[10px] uppercase font-bold text-brand-600">Dev Shortcut:</span>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="block mt-2 text-center px-4 py-2 rounded-lg bg-brand-600 text-white font-bold"
                >
                  Click to Reset Password Directly
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-2"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@suvidha.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Dispatching Link...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:underline">
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
