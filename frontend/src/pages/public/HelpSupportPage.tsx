import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail, Phone, ShieldAlert, Clock, Sparkles } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqList = [
    {
      q: 'What is the fundamental difference between Identified and Anonymous feedback?',
      a: 'Identified feedback links your name and student ID to the evaluation record, allowing faculty to acknowledge your feedback and discuss academic improvements. In Anonymous feedback, your student account identity is completely omitted from the database record (stored as student: null). It cannot be traced back to you by teachers, coordinators, or administrators.',
    },
    {
      q: 'How does Anonymous Grievance Tracking work?',
      a: 'When you submit an anonymous grievance, Suvidha generates a unique 32-character random token (e.g. trk_...). A cryptographic hash of that token is kept in the database. When you visit the Anonymous Tracking Portal and provide that token, our server verifies the hash and reveals the progress timeline, allowing you to converse with staff without logging in.',
    },
    {
      q: 'What are the Service Level Agreement (SLA) turnaround times?',
      a: 'Critical issues (e.g. hazardous electrical/plumbing failures) have a 24-hour target SLA. High priority complaints target 3 business days. Medium priority targets 7 days. Low priority suggestions target 14 days. Staff dashboards prominently flag overdue cases.',
    },
    {
      q: 'Can I reopen a grievance if I am unsatisfied with the resolution?',
      a: 'Yes. Once a grievance is marked Resolved or Closed, students have the option to click "Reopen Grievance" and provide a detailed reason. This automatically reverts the status to "Reopened" and re-alerts the assigned staff member.',
    },
    {
      q: 'How does Duplicate Issue Detection work?',
      a: 'When filing a grievance, Suvidha analyzes your subject and category against currently active open issues. If a similar infrastructure or campus problem is already being worked on, it suggests the active reference number so you can track progress without filing duplicate tickets.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Help Center & Student Support
        </h1>
        <p className="text-xs text-slate-500">
          Frequently asked questions, resolution charters, and campus administrative support contacts.
        </p>
      </div>

      {/* Emergency Alert Callout */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Not for Emergency Situations:</h4>
          <p className="mt-0.5">
            Suvidha is an administrative resolution and course feedback platform. If you encounter an immediate physical hazard, fire, or medical emergency, please contact Campus Security Control at +91 11 2345 6789 or visit the Campus Health Center.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Frequently Asked Questions
        </h2>
        {faqList.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-subtle"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-xs">
            <Mail className="w-4 h-4" />
            <span>Student Redressal Desk</span>
          </div>
          <p className="text-xs text-slate-500">
            For account queries or coordinator assistance:
          </p>
          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            support@suvidha.university.edu
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs">
            <Phone className="w-4 h-4" />
            <span>Administrative Office</span>
          </div>
          <p className="text-xs text-slate-500">
            Dean of Student Welfare (Office Hours: 09:00 - 17:00):
          </p>
          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            +91 (011) 2345-6700 Ext. 401
          </p>
        </div>
      </div>
    </div>
  );
};
