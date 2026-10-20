import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquarePlus,
  AlertCircle,
  FolderOpen,
  Users,
  Building2,
  Bell,
  ShieldCheck,
  Search,
  BookOpen,
  Download,
  Gamepad2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  if (!user || !role) return null;

  const baseItemClass =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all';
  const inactiveClass =
    'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white';
  const activeClass =
    'bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-800 shadow-sm';

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      {/* User Mini Profile */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
        <span className="inline-block mt-2 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200">
          {role}
        </span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-1.5">
        {/* STUDENT NAVIGATION */}
        {role === 'student' && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Student Hub
            </div>
            <NavLink
              to="/student/dashboard"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('nav.dashboard')}
            </NavLink>
            <NavLink
              to="/student/feedback/new"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              {t('nav.submitFeedback')}
            </NavLink>
            <NavLink
              to="/student/grievance/new"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <AlertCircle className="w-4 h-4" />
              {t('nav.submitGrievance')}
            </NavLink>
            <NavLink
              to="/student/submissions"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <FolderOpen className="w-4 h-4" />
              {t('nav.submissions')}
            </NavLink>
            <NavLink
              to="/peer-review"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users className="w-4 h-4" />
              {t('nav.peerReview')}
            </NavLink>
            <NavLink
              to="/student/timepass"
              className={({ isActive }) =>
                `${baseItemClass} ${
                  isActive
                    ? activeClass
                    : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`
              }
            >
              <Gamepad2 className="w-4 h-4 text-amber-500 animate-bounce-gentle" />
              <span className="flex-1">{t('nav.timepass')}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold">
                Fun
              </span>
            </NavLink>
            <NavLink
              to="/track"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Search className="w-4 h-4" />
              {t('nav.trackTicket')}
            </NavLink>
          </>
        )}

        {/* FACULTY NAVIGATION */}
        {role === 'faculty' && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Faculty Workspace
            </div>
            <NavLink
              to="/faculty/dashboard"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </NavLink>
            <NavLink
              to="/faculty/grievances"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <AlertCircle className="w-4 h-4" />
              {t('nav.assignedGrievances')}
            </NavLink>
            <NavLink
              to="/faculty/feedback"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <BookOpen className="w-4 h-4" />
              {t('nav.facultyFeedback')}
            </NavLink>
          </>
        )}

        {/* ADMIN & COORDINATOR NAVIGATION */}
        {(role === 'admin' || role === 'coordinator') && (
          <>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Management Portal
            </div>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Analytics & Overview
            </NavLink>
            <NavLink
              to="/admin/grievances"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <AlertCircle className="w-4 h-4" />
              Grievance Triage
            </NavLink>
            <NavLink
              to="/admin/feedback"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <FolderOpen className="w-4 h-4" />
              Feedback Records
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Users className="w-4 h-4" />
              {t('nav.users')}
            </NavLink>
            <NavLink
              to="/admin/academics"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Building2 className="w-4 h-4" />
              {t('nav.academics')}
            </NavLink>
            <NavLink
              to="/admin/announcements"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Bell className="w-4 h-4" />
              Announcements
            </NavLink>
            {role === 'admin' && (
              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
              >
                <ShieldCheck className="w-4 h-4" />
                {t('nav.auditLogs')}
              </NavLink>
            )}
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `${baseItemClass} ${isActive ? activeClass : inactiveClass}`}
            >
              <Download className="w-4 h-4" />
              CSV Data Export
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
};
