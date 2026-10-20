import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Search,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!role) return '/';
    if (role === 'student') return '/student/dashboard';
    if (role === 'faculty') return '/faculty/dashboard';
    if (role === 'coordinator' || role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-brand-600 dark:bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                {t('brand')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                CAMPUS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Center / Navigation items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {t('nav.home')}
          </Link>
          <Link
            to="/track"
            className="flex items-center gap-1.5 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <Search className="w-4 h-4" />
            {t('nav.trackTicket')}
          </Link>
          <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {t('nav.faq')}
          </Link>
          <Link
            to="/timepass"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:scale-105 transition-all shadow-sm"
          >
            <span>🎮</span>
            <span>Timepass</span>
            <span className="px-1 py-0.2 text-[9px] uppercase bg-rose-500 text-white rounded font-extrabold animate-pulse">Fun</span>
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
            >
              {t('nav.dashboard')}
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown (If authenticated) */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 shadow-elevated border border-slate-200 dark:border-slate-800 py-3 z-50">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-500">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            if (!n.isRead) markAsRead(n._id);
                            if (n.link) {
                              setIsNotifOpen(false);
                              navigate(n.link);
                            }
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            !n.isRead ? 'bg-brand-50/50 dark:bg-brand-950/30 font-medium' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-300">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                    {user.role}
                  </p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-elevated border border-slate-200 dark:border-slate-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {user.role}
                    </span>
                  </div>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/track"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {t('nav.trackTicket')}
          </Link>
          <Link
            to="/help"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {t('nav.faq')}
          </Link>
          <Link
            to="/timepass"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-bold text-amber-600 dark:text-amber-400"
          >
            <span className="flex items-center gap-2">
              <span>🎮</span>
              <span>Timepass & Mind Games</span>
            </span>
            <span className="px-1.5 py-0.5 text-[9px] uppercase bg-rose-500 text-white rounded font-extrabold">NEW</span>
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardRoute()}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-brand-600 dark:text-brand-400"
            >
              {t('nav.dashboard')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
