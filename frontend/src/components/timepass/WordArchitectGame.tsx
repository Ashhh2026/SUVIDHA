import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw, Flame } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface WordPuzzle {
  word: string;
  hint: string;
  category: string;
}

const PUZZLES: WordPuzzle[] = [
  { word: 'ALGORITHM', hint: 'A step-by-step computational recipe to solve a problem', category: 'Computer Science' },
  { word: 'ARCHITECTURE', hint: 'The art and science of designing state-of-the-art campus learning spaces', category: 'Campus Planning' },
  { word: 'DATABASE', hint: 'Structured system storing indexed student records and tables', category: 'Engineering' },
  { word: 'SUVIDHA', hint: 'Your student voice and transparent grievance management portal', category: 'Campus Portal' },
  { word: 'CURRICULUM', hint: 'Structured subjects and practical syllabus taught throughout your degree', category: 'Academics' },
  { word: 'ENCRYPTION', hint: 'Cryptographic shield securing student identity & anonymous feedback', category: 'Cybersecurity' },
  { word: 'PROFESSOR', hint: 'Academic mentor delivering lectures and guiding student projects', category: 'University Life' },
  { word: 'SEMESTER', hint: 'Six-month academic period filled with labs, midterms, and finals', category: 'Academics' },
];

export const WordArchitectGame: React.FC<{ onScoreAdd?: (pts: number) => void; onWin?: () => void }> = ({
  onScoreAdd,
  onWin,
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ char: string; originalIdx: number }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const currentPuzzle = PUZZLES[puzzleIndex];

  // Scramble the current word
  const loadPuzzle = (idx: number) => {
    const puzzle = PUZZLES[idx];
    const letters = puzzle.word.split('').map((char, originalIdx) => ({ char, originalIdx }));
    // Shuffle
    let shuffled: typeof letters;
    do {
      shuffled = [...letters].sort(() => Math.random() - 0.5);
    } while (shuffled.map((l) => l.char).join('') === puzzle.word && puzzle.word.length > 3);

    setScrambledLetters(shuffled);
    setSelectedIndices([]);
    setHintUsed(false);
    setFeedbackState('idle');
  };

  useEffect(() => {
    loadPuzzle(puzzleIndex);
  }, [puzzleIndex]);

  const handleTileClick = (index: number) => {
    if (feedbackState === 'correct') return;
    soundFX.playFlip();

    if (selectedIndices.includes(index)) {
      // Remove from selection
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      // Append to selection
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);

      // Check if full length reached
      if (newSelected.length === currentPuzzle.word.length) {
        const formedWord = newSelected.map((i) => scrambledLetters[i].char).join('');
        if (formedWord === currentPuzzle.word) {
          // Correct!
          setFeedbackState('correct');
          soundFX.playMatch();
          const pts = hintUsed ? 50 : 100 + streak * 20;
          setScore((s) => s + pts);
          setStreak((s) => s + 1);
          onScoreAdd?.(pts);

          setTimeout(() => {
            if (puzzleIndex + 1 < PUZZLES.length) {
              setPuzzleIndex((prev) => prev + 1);
            } else {
              soundFX.playWin();
              onWin?.();
            }
          }, 1200);
        } else {
          // Wrong
          setFeedbackState('wrong');
          soundFX.playWrong();
          setStreak(0);
          setTimeout(() => {
            setFeedbackState('idle');
            setSelectedIndices([]);
          }, 900);
        }
      }
    }
  };

  const handleClear = () => {
    soundFX.playFlip();
    setSelectedIndices([]);
    setFeedbackState('idle');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Puzzle {puzzleIndex + 1} of {PUZZLES.length}
            </span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 text-xs font-black animate-bounce-gentle">
              <Flame className="w-3.5 h-3.5" />
              <span>{streak}x Streak!</span>
            </div>
          )}
        </div>

        <div className="text-xs font-black font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
          Score: {score} pts
        </div>
      </div>

      {/* Puzzle Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/60 shadow-elevated text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          Category: {currentPuzzle.category}
        </div>

        {/* Word Construction Slot */}
        <div className="flex flex-wrap justify-center gap-2 min-h-[58px] p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border-2 border-dashed border-amber-300 dark:border-amber-700">
          {selectedIndices.length === 0 ? (
            <span className="self-center text-xs text-slate-400 font-medium">
              Click the letter tiles below to construct the secret word...
            </span>
          ) : (
            selectedIndices.map((idx, pos) => (
              <button
                key={pos}
                onClick={() => handleTileClick(idx)}
                className={`w-11 h-12 rounded-xl font-black text-lg flex items-center justify-center shadow-md transition-all ${
                  feedbackState === 'correct'
                    ? 'bg-emerald-500 text-white animate-bounce-gentle'
                    : feedbackState === 'wrong'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500 text-white hover:bg-rose-500 hover:scale-105'
                }`}
              >
                {scrambledLetters[idx].char}
              </button>
            ))
          )}
        </div>

        {/* Scrambled Available Letter Tiles */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {scrambledLetters.map((item, idx) => {
            const isUsed = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isUsed || feedbackState === 'correct'}
                onClick={() => handleTileClick(idx)}
                className={`w-11 h-12 rounded-xl font-black text-lg shadow-sm border transition-all ${
                  isUsed
                    ? 'opacity-20 scale-95 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800'
                    : 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white hover:border-amber-500 hover:scale-110 active:scale-95 shadow-card'
                }`}
              >
                {item.char}
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {hintUsed ? (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
              💡 <span className="font-bold">Architect Hint:</span> "{currentPuzzle.hint}" (Starts with <span className="font-black underline">{currentPuzzle.word[0]}</span>)
            </div>
          ) : (
            <button
              onClick={() => {
                setHintUsed(true);
                soundFX.playPop();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Need a Hint? (Reveals clue & first letter)
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Tiles
          </button>

          <button
            onClick={() => {
              const nextIdx = (puzzleIndex + 1) % PUZZLES.length;
              setPuzzleIndex(nextIdx);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>Skip Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
