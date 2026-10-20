import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { academicApi } from '../../services/academicApi';
import { authApi } from '../../services/authApi';
import { Department, Course } from '../../types';

export const RegisterPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState<number>(7);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ email: string; verificationToken?: string } | null>(null);

  useEffect(() => {
    academicApi.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setDepartment(depts[0]._id);
    });
  }, []);

  useEffect(() => {
    if (department) {
      academicApi.getCourses(department).then((crss) => {
        setCourses(crss);
        if (crss.length > 0) setCourse(crss[0]._id);
      });
    }
  }, [department]);

  // Password strength calculations
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasLength = password.length >= 8;
  const strengthScore = [hasUpper, hasLower, hasDigit, hasLength].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strengthScore < 4) {
      setErrorMsg('Please satisfy all password security requirements.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        studentId: studentId.trim(),
        department: department || undefined,
        course: course || undefined,
        semester,
      });

      setSuccessData({ email: email.trim(), verificationToken: res.verificationToken });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-card space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Created!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A verification email has been dispatched to <strong>{successData.email}</strong>.
          </p>

          {/* Development Instant Activation Shortcut */}
          {successData.verificationToken && (
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Evaluation Simulation
              </span>
              <p className="text-xs text-brand-900 dark:text-brand-200 mt-1">
                In development mode, you can verify your account instantly:
              </p>
              <Link
                to={`/verify-email?token=${successData.verificationToken}`}
                className="mt-3 block text-center px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 transition-all"
              >
                Click to Instantly Verify & Log In
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link
              to="/login"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Registration</h2>
          <p className="text-xs text-slate-500">Join Suvidha to share your feedback and manage grievances</p>
        </div>

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
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Diya Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@suvidha.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Roll / ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024CS0142"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Department, Course, Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Course
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Sem {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 chars, Uppercase, Lowercase, Number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Checklist */}
              {password.length > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-1 text-[11px]">
                  <span className={hasLength ? 'text-teal-600 font-semibold' : 'text-slate-400'}>
                    ✓ At least 8 characters
                  </span>
                  <span className={hasUpper ? 'text-teal-600 font-semibold' : 'text-slate-400'}>
                    ✓ 1 Uppercase letter
                  </span>
                  <span className={hasLower ? 'text-teal-600 font-semibold' : 'text-slate-400'}>
                    ✓ 1 Lowercase letter
                  </span>
                  <span className={hasDigit ? 'text-teal-600 font-semibold' : 'text-slate-400'}>
                    ✓ 1 Numeric digit
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
