import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Clock, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface CardItem {
  id: number;
  icon: string;
  label: string;
  color: string;
}

const BASE_ITEMS = [
  { icon: '🏛️', label: 'Campus Hall', color: 'from-amber-500 to-orange-600' },
  { icon: '⚡', label: 'Energy', color: 'from-amber-400 to-yellow-500' },
  { icon: '☕', label: 'Coffee Break', color: 'from-amber-700 to-yellow-800' },
  { icon: '🎓', label: 'Graduation', color: 'from-indigo-600 to-blue-700' },
  { icon: '💻', label: 'Terminal', color: 'from-emerald-500 to-teal-700' },
  { icon: '🔬', label: 'Laboratory', color: 'from-cyan-500 to-blue-600' },
  { icon: '📚', label: 'Library', color: 'from-purple-500 to-violet-700' },
  { icon: '🌟', label: 'Excellence', color: 'from-yellow-400 to-amber-500' },
];

export const MemoryGame: React.FC<{ onScoreAdd?: (pts: number) => void; onWin?: () => void }> = ({
  onScoreAdd,
  onWin,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<number>(() => {
    return Number(localStorage.getItem('suvidha_memory_best_moves')) || 0;
  });

  const initializeGame = () => {
    const deck: CardItem[] = [];
    BASE_ITEMS.forEach((item, index) => {
      deck.push({ id: index * 2, icon: item.icon, label: item.label, color: item.color });
      deck.push({ id: index * 2 + 1, icon: item.icon, label: item.label, color: item.color });
    });
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsActive(false);
    setHasWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !hasWon) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, hasWon]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (!isActive) setIsActive(true);
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].label)) return;

    soundFX.playFlip();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.label === secondCard.label) {
        // Matched!
        setTimeout(() => {
          soundFX.playMatch();
          setMatchedIds((prev) => {
            const next = [...prev, firstCard.label];
            onScoreAdd?.(50);
            if (next.length === BASE_ITEMS.length) {
              setHasWon(true);
              soundFX.playWin();
              onWin?.();
              onScoreAdd?.(200); // Bonus for completion
              if (bestMoves === 0 || moves + 1 < bestMoves) {
                setBestMoves(moves + 1);
                localStorage.setItem('suvidha_memory_best_moves', String(moves + 1));
              }
            }
            return next;
          });
          setFlippedIndices([]);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          soundFX.playWrong();
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Game Dashboard Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Moves</p>
              <p className="text-lg font-black text-slate-800 dark:text-white font-mono">{moves}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
              <p className="text-lg font-black text-slate-800 dark:text-white font-mono">{formatTime(seconds)}</p>
            </div>
          </div>
          {bestMoves > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Best Record</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{bestMoves} moves</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={initializeGame}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all hover:rotate-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Game
        </button>
      </div>

      {/* 4x4 Grid of Cards */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.label);
          const isMatched = matchedIds.includes(card.label);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isFlipped || hasWon}
              className={`h-24 sm:h-28 rounded-2xl relative transition-all duration-300 transform perspective-1000 ${
                isFlipped
                  ? 'rotate-y-180 shadow-elevated scale-100'
                  : 'hover:scale-105 active:scale-95 shadow-card'
              }`}
            >
              <div
                className={`w-full h-full rounded-2xl flex flex-col items-center justify-center p-2 border transition-all ${
                  isFlipped
                    ? isMatched
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-400/50'
                      : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 shadow-inner'
                    : 'bg-gradient-to-br from-amber-700 via-rose-700 to-amber-900 border-amber-600/40 text-amber-200'
                }`}
              >
                {isFlipped ? (
                  <>
                    <span className="text-3xl sm:text-4xl animate-bounce-gentle">{card.icon}</span>
                    <span className="text-[10px] font-bold mt-1 text-slate-600 dark:text-slate-300 truncate max-w-full">
                      {card.label}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-85">
                    <span className="text-xl">🏛️</span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-amber-200/80 mt-1">
                      SUVIDHA
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Win Celebration Banner */}
      {hasWon && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white text-center shadow-elevated animate-pulse-ring max-w-xl mx-auto">
          <div className="text-4xl mb-2">🎉 🎓 🌟</div>
          <h3 className="text-2xl font-black">Congratulations! You Won!</h3>
          <p className="text-xs text-amber-100 mt-1">
            Brilliant memory! You cleared the Campus Memory Quest in {moves} moves and {formatTime(seconds)}!
          </p>
          <button
            onClick={initializeGame}
            className="mt-4 px-6 py-2.5 rounded-xl font-extrabold text-xs bg-white text-slate-900 hover:bg-amber-100 shadow-md transition-all hover:scale-105"
          >
            Play Another Round
          </button>
        </div>
      )}
    </div>
  );
};
