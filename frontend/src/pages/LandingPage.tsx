import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Users,
  Search,
  BookOpen,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Shield,
  FileCheck,
  Gamepad2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does Suvidha ensure that my anonymous feedback remains truly anonymous?',
      a: 'When you choose Anonymous mode, our backend completely decouples your student identity: the database record sets student: null. Even system administrators cannot see who submitted it. Furthermore, faculty rating summaries require a minimum sample size before results are revealed to prevent deanonymization in small classes.',
    },
    {
      q: 'How can I track the progress of an anonymous grievance?',
      a: 'When you file an anonymous grievance, Suvidha generates an unguessable 32-character tracking token. You can enter this token anytime on the "Track Anonymous Ticket" page to view official staff responses and reply without logging in.',
    },
    {
      q: 'What is the resolution SLA for campus grievances?',
      a: 'Target resolution SLAs are mapped to grievance urgency: Critical issues target a 24-hour turnaround, High priority targets 3 days, Medium priority targets 7 days, and Low priority targets 14 days. Staff dashboards prominently highlight overdue cases.',
    },
    {
      q: 'Can faculty members see who rated them in subject feedback?',
      a: 'No. Anonymous course and faculty evaluations never include student names or IDs. Identified feedback displays student details only so instructors can offer direct academic guidance when requested.',
    },
    {
      q: 'What happens if a sensitive grievance (such as harassment) is filed?',
      a: 'Sensitive complaints are protected by a strict privacy lock. They bypass general faculty view and are routed exclusively to the university Internal Complaints Committee (ICC) and designated administrative leads.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Official Portal Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Your Voice. Your Campus. <br />
              <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
                Your Suvidha.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>

            {/* Action Entry Points */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-elevated hover:shadow-lg transition-all"
              >
                <span>{t('hero.ctaStudent')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login?role=faculty"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>{t('hero.ctaStaff')}</span>
              </Link>
              <Link
                to="/track"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-300 bg-brand-50/70 dark:bg-brand-950/60 hover:bg-brand-100 border border-brand-200 dark:border-brand-800 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{t('hero.ctaTrack')}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-xs">
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <Lock className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('hero.stat1')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('hero.stat2')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('hero.stat3')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            How Suvidha Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A seamless four-stage process connecting student feedback with actionable university resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Submit With Privacy Choice',
              desc: 'Select academic feedback or grievance, fill guided questions, and select Identified or 100% Anonymous mode.',
              icon: MessageSquare,
            },
            {
              step: '02',
              title: 'Automated Triage & Assignment',
              desc: 'Department coordinators and committee leads receive notifications and assign tickets to responsible faculty.',
              icon: Users,
            },
            {
              step: '03',
              title: 'Action & Status Updates',
              desc: 'Assigned staff perform maintenance or curriculum adjustments, logging official responses and internal progress.',
              icon: Clock,
            },
            {
              step: '04',
              title: 'Verification & Closure',
              desc: 'Students receive resolution notifications and can verify results, submit follow-up replies, or reopen if unsatisfied.',
              icon: FileCheck,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card relative hover:shadow-elevated transition-shadow"
              >
                <div className="text-3xl font-black text-brand-100 dark:text-brand-950/70 absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE CAPABILITIES HIGHLIGHTS */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Key Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Engineered for Real Campus Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">True Anonymity Architecture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Anonymous submissions are not merely hidden in the UI; they are decoupled at the database level. Unguessable cryptographic hashes power public ticket tracking.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict SLA Accountability</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated resolution target countdowns and visual overdue indicators keep staff accountable. Administrative escalation triggers ensure cases never get forgotten.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Insights & Duplicate Detection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identifies recurring campus themes like Wi-Fi reliability and dining quality. Real-time duplicate detection alerts students if an identical active issue is already under repair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY STATEMENT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-12 shadow-elevated">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Student Privacy Guarantee
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Honest feedback without the fear of retaliation.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-brand-200 leading-relaxed max-w-3xl">
            Suvidha was built specifically to eliminate traditional college hierarchy intimidation. Students can freely evaluate teaching quality and report facility defects with confidence.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Zero Account Linkage for Anonymous Submissions</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Small Class Size Aggregation Masking</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Encrypted Session Credentials</span>
            </div>
          </div>
        </div>
      </section>

      {/* TIMEPASS MIND GAMES SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-indigo-950 text-white p-8 sm:p-12 shadow-elevated border border-brand-500/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-brand-200 backdrop-blur-sm border border-white/20">
                <span>🎮 Campus Mind Games & Mental Wellness</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded font-black text-[9px]">NEW</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Academic Rigor Meets Playful Relaxation.
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Step into the <strong>Timepass Lounge</strong>! Unwind between lectures and exams with campus memory card matching, rapid speed math sprints, university anagrams, and 2048 puzzle.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/timepass"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md transition-all hover:scale-105"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Explore Timepass & Mind Games</span>
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                >
                  Join as Student
                </Link>
              </div>
            </div>

            {/* Playful mini card display */}
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1">
                <span className="text-3xl animate-bounce-gentle inline-block">🧠</span>
                <p className="text-xs font-extrabold">Memory Match</p>
                <p className="text-[10px] text-brand-200">Campus Quest 16</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1">
                <span className="text-3xl inline-block">⚡</span>
                <p className="text-xs font-extrabold">Rapid Math</p>
                <p className="text-[10px] text-brand-200">30s Speed Sprint</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1">
                <span className="text-3xl inline-block">🧩</span>
                <p className="text-xs font-extrabold">Word Architect</p>
                <p className="text-[10px] text-brand-200">Secret Anagrams</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1">
                <span className="text-3xl inline-block">👑</span>
                <p className="text-xs font-extrabold">Campus 2048</p>
                <p className="text-[10px] text-brand-200">Chancellor Medal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Questions & Answers
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-subtle"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'transform rotate-180' : ''
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
      </section>
    </div>
  );
};
