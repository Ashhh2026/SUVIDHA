import React from 'react';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Institutional Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Terms of Campus Usage
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Guidelines and student responsibilities for using the SUVIDHA portal.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Authorized Purpose
          </h2>
          <p>
            SUVIDHA is an official university utility designated for submitting constructive course feedback, reporting campus infrastructure defects, and tracking administrative grievances. Submitting false, malicious, or fabricated complaints intended to defame individuals is strictly prohibited under the University Code of Conduct.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Responsible Reporting & Anonymity
          </h2>
          <p>
            The anonymity provided by SUVIDHA is designed to empower constructive evaluation. Users are expected to maintain professional conduct. The university reserves the right to review system access logs in the event of documented cyber-harassment or computer fraud.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. SLA & Target Timeframes
          </h2>
          <p>
            Resolution turnaround estimates (e.g. 24 hours for Critical, 3 days for High) represent institutional targets and do not constitute binding contractual guarantees. Actual resolution timelines may vary depending on procurement, laboratory vendor schedules, or academic holiday calendars.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Emergency Clarification
          </h2>
          <p>
            SUVIDHA is not an emergency dispatch facility. Situations involving imminent physical harm, medical crises, or criminal acts must be escalated immediately to local emergency emergency services and Campus Security.
          </p>
        </section>
      </div>
    </div>
  );
};
