import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Sparkles,
  Volume2,
  VolumeX,
  Award,
  ArrowLeft,
  Flame,
  Brain,
  Zap,
  Grid,
  Heart,
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { Confetti } from '../../components/timepass/Confetti';
import { MemoryGame } from '../../components/timepass/MemoryGame';
import { WordArchitectGame } from '../../components/timepass/WordArchitectGame';
import { RapidMathGame } from '../../components/timepass/RapidMathGame';
import { Game2048 } from '../../components/timepass/Game2048';
import { ZenBubblePop } from '../../components/timepass/ZenBubblePop';

type GameTab = 'memory' | 'words' | 'math' | '2048' | 'zen';

export const TimepassPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>('memory');
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  // Player XP & Level System
  const [playerXP, setPlayerXP] = useState<number>(() => {
    return Number(localStorage.getItem('suvidha_timepass_xp')) || 120;
  });

  const handleScoreAdd = (pts: number) => {
    setPlayerXP((prev) => {
      const next = prev + pts;
      localStorage.setItem('suvidha_timepass_xp', String(next));
      return next;
    });
  };

  const handleWin = () => {
    setConfettiTrigger(true);
  };

  const toggleSound = () => {
    const next = soundFX.toggleSound();
    setSoundEnabled(next);
  };

  // Rank Calculation
  const getRank = (xp: number) => {
    if (xp >= 2500) return { title: 'Campus Grandmaster 👑', level: 5, nextTarget: 5000, progress: 100 };
    if (xp >= 1200) return { title: 'Architect Laureate 🏛️', level: 4, nextTarget: 2500, progress: ((xp - 1200) / 1300) * 100 };
    if (xp >= 600) return { title: 'Brain Virtuoso 🧠', level: 3, nextTarget: 1200, progress: ((xp - 600) / 600) * 100 };
    if (xp >= 250) return { title: 'Campus Strategist 💡', level: 2, nextTarget: 600, progress: ((xp - 250) / 350) * 100 };
    return { title: 'Student Novice 🎒', level: 1, nextTarget: 250, progress: (xp / 250) * 100 };
  };

  const rank = getRank(playerXP);

  const tabs = [
    { id: 'memory', name: 'Memory Match', icon: Brain, badge: 'Match 16' },
    { id: 'words', name: 'Word Architect', icon: Sparkles, badge: 'Anagrams' },
    { id: 'math', name: 'Rapid Math', icon: Zap, badge: '30s Sprint' },
    { id: '2048', name: 'Campus 2048', icon: Grid, badge: 'Merge' },
    { id: 'zen', name: 'Zen Bubble Pop', icon: Heart, badge: 'Chill' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Confetti Explosion on Victory */}
      <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />

      {/* University Lounge Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-indigo-950 text-white p-6 sm:p-10 shadow-elevated border border-brand-500/30">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-brand-200 backdrop-blur-sm border border-white/20">
                🎮 Campus Timepass Zone
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900">
                Playful & Interactive
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
              Mind Games & Chill Lounge
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mt-1.5 leading-relaxed">
              Take a productive pause from lectures and lab reports. Exercise your cognitive reflexes, unlock university badges, and relax with campus mind games!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white transition-all"
              title="Toggle Game Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-rose-300" />}
              <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            <Link
              to="/student/dashboard"
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Player Level & XP Progress Card */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/30 animate-bounce-gentle">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-200">Current Rank:</span>
                <span className="text-sm font-extrabold text-white">{rank.title}</span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-mono">
                {playerXP} Total XP Earned • Tier {rank.level}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-amber-200 font-mono">
              <span>Next Milestone</span>
              <span>{Math.round(rank.progress)}%</span>
            </div>
            <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, rank.progress)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playFlip();
                setActiveTab(tab.id as GameTab);
              }}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-elevated scale-102 ring-2 ring-amber-400/50'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Mind Game Container */}
      <div className="transition-all duration-300">
        {activeTab === 'memory' && (
          <MemoryGame onScoreAdd={handleScoreAdd} onWin={handleWin} />
        )}
        {activeTab === 'words' && (
          <WordArchitectGame onScoreAdd={handleScoreAdd} onWin={handleWin} />
        )}
        {activeTab === 'math' && (
          <RapidMathGame onScoreAdd={handleScoreAdd} onWin={handleWin} />
        )}
        {activeTab === '2048' && (
          <Game2048 onScoreAdd={handleScoreAdd} onWin={handleWin} />
        )}
        {activeTab === 'zen' && (
          <ZenBubblePop onScoreAdd={handleScoreAdd} />
        )}
      </div>
    </div>
  );
};
