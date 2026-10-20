import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 mt-auto">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-300 max-w-4xl mx-auto flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t('grievance.emergencyNotice')}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                {t('brand')}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS Encrypted & Privacy Assured</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Faculty & Staff Login
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Anonymous Grievance Tracking
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Policies & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Student Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Terms of Campus Usage
                </Link>
              </li>
              <li>
                <Link to="/help#anonymity" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Anonymity & Data Protection
                </Link>
              </li>
              <li>
                <Link to="/help#sla" className="hover:text-brand-600 dark:hover:text-brand-400">
                  Resolution SLA Charters
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Project Specification
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SUVIDHA is engineered as a Seventh-Semester B.Tech Computer Science and Engineering Capstone Project.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Stack: React 18, Vite, Node.js, Express, MongoDB, Tailwind CSS, TypeScript.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SUVIDHA — Student Feedback & Grievance Management System.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for Academic Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};
