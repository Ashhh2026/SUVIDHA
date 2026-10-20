import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>University Data Governance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Student Privacy & Anonymity Policy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last revised: October 2026 • Effective for all campus feedback and grievance submissions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Core Principle: Student Privacy & Retaliation Shield
          </h2>
          <p>
            The SUVIDHA platform is engineered under the principle that candid, constructive academic feedback is only possible when students are protected from potential academic retaliation or bias. We adhere to data minimization: only information strictly required for administrative resolution is requested.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Database-Level Decoupling in Anonymous Mode
          </h2>
          <p>
            When a student selects <strong>Anonymous Feedback</strong> or <strong>Anonymous Grievance</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600 dark:text-slate-400">
            <li>The database record explicitly stores <code>student: null</code>. No foreign key, user ID, or roll number is stored in the submission record.</li>
            <li>Tracking tokens are cryptographically hashed using SHA-256 before storage. Raw tracking tokens are never stored in the database.</li>
            <li>No deanonymization joins are permitted in backend queries or administrative export routines.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. Small Class Size Privacy Threshold
          </h2>
          <p>
            To prevent statistical deanonymization in small laboratory groups or specialized elective courses, faculty feedback dashboards enforce a minimum sample size threshold (minimum 2 to 3 submissions). If fewer responses have been collected, individual scores and written comments are masked.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            4. Handling of Sensitive Misconduct Reports
          </h2>
          <p>
            Submissions categorized under <em>Harassment or Serious Misconduct</em> are sealed with an administrative privacy flag. These reports are strictly quarantined from general faculty accounts and routed exclusively to the university Internal Complaints Committee (ICC).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            5. Session Security & Token Storage
          </h2>
          <p>
            Authentication credentials utilize short-lived JSON Web Tokens paired with rotating refresh tokens stored in secure, HttpOnly, SameSite cookies. Passwords are cryptographically hashed using bcrypt with salt rounds. Raw passwords and authentication tokens are never stored in browser localStorage.
          </p>
        </section>
      </div>
    </div>
  );
};
