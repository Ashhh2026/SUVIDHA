import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoAccounts = [
    { label: 'Student', email: 'aarav.sharma@suvidha.edu', pass: 'Student@12345', role: 'student', desc: 'Aarav (7th Sem CSE)' },
    { label: 'Faculty', email: 'faculty.verma@suvidha.edu', pass: 'Faculty@12345', role: 'faculty', desc: 'Dr. Verma (OS Dept)' },
    { label: 'Coordinator', email: 'coordinator.cse@suvidha.edu', pass: 'Faculty@12345', role: 'coordinator', desc: 'Dr. Mukherjee (CSE Dept)' },
    { label: 'Administrator', email: 'admin@suvidha.edu', pass: 'Admin@12345', role: 'admin', desc: 'Prof. Sen (Campus Lead)' },
  ];

  const handleFillDemo = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to Suvidha</h2>
          <p className="text-xs text-slate-500">Access your academic feedback and grievance workspace</p>
        </div>

        {/* Demo Account Switcher Card */}
        <div className="bg-brand-50/70 dark:bg-brand-950/40 rounded-2xl border border-brand-200 dark:border-brand-800 p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 dark:text-brand-300">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Evaluation Mode: One-Click Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => handleFillDemo(acc)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 text-left hover:border-brand-500 transition-colors shadow-subtle"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{acc.label}</span>
                  <span className="text-[10px] uppercase font-bold text-brand-600">Autofill</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                placeholder="name@suvidha.edu"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  placeholder="••••••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>New student? </span>
            <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
