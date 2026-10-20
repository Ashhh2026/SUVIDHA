import React, { useState } from 'react';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

const ZEN_QUOTES = [
  'Slowly and steadily, consistent effort wins the semester.',
  'Take a deep breath. A university degree is a marathon, not a sprint.',
  'Every great achievement is built one disciplined step at a time.',
  'Your feedback and honest ideas are shaping a better campus for everyone.',
  'Mistakes are just algorithmic iterations toward your breakthrough.',
  'Believe in your learning journey. You are doing fantastic!',
];

export const ZenBubblePop: React.FC<{ onScoreAdd?: (pts: number) => void }> = ({ onScoreAdd }) => {
  const [bubbles, setBubbles] = useState<boolean[]>(() => Array(36).fill(false));
  const [popCount, setPopCount] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const handlePop = (index: number) => {
    if (bubbles[index]) return;

    soundFX.playPop();
    const next = [...bubbles];
    next[index] = true;
    setBubbles(next);
    setPopCount((c) => c + 1);
    onScoreAdd?.(2);

    if ((popCount + 1) % 6 === 0) {
      setQuoteIndex((q) => (q + 1) % ZEN_QUOTES.length);
    }
  };

  const handleReset = () => {
    soundFX.playFlip();
    setBubbles(Array(36).fill(false));
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Zen Header Card */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce-gentle" />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zen Bubble Decompressor</h4>
            <p className="text-[11px] text-slate-500">Total Bubbles Popped: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{popCount}</span></p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Fresh Sheet
        </button>
      </div>

      {/* Inspirational Campus Quote */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/40 border border-amber-200/60 dark:border-amber-900/40 text-center">
        <p className="text-xs font-medium italic text-slate-700 dark:text-slate-200">
          {ZEN_QUOTES[quoteIndex]}
        </p>
      </div>

      {/* 6x6 Bubble Grid */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/60 shadow-elevated">
        <div className="grid grid-cols-6 gap-3">
          {bubbles.map((popped, idx) => (
            <button
              key={idx}
              onClick={() => handlePop(idx)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                popped
                  ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700/40 scale-85 opacity-40 shadow-inner'
                  : 'bg-gradient-to-br from-amber-300 via-rose-300 to-indigo-300 dark:from-amber-600 dark:via-rose-600 dark:to-indigo-600 shadow-md hover:scale-110 active:scale-90 border-2 border-white/60 dark:border-white/20'
              }`}
            >
              {popped ? (
                <span className="text-xs opacity-50">💥</span>
              ) : (
                <div className="w-3 h-3 rounded-full bg-white/80 -translate-y-1 -translate-x-1" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
