import React, { useState, useEffect } from 'react';
import { Zap, Clock, Trophy, RotateCcw, Flame } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}

export const RapidMathGame: React.FC<{ onScoreAdd?: (pts: number) => void; onWin?: () => void }> = ({
  onScoreAdd,
  onWin,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQ, setCurrentQ] = useState<MathQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('suvidha_math_high_score')) || 0;
  });

  const generateQuestion = (): MathQuestion => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 20) + 2;
    let b = Math.floor(Math.random() * 15) + 2;
    let ans = 0;

    if (op === '+') {
      ans = a + b;
    } else if (op === '-') {
      if (a < b) [a, b] = [b, a];
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      ans = a * b;
    }

    const wrongOptions = new Set<number>();
    while (wrongOptions.size < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1);
      const val = ans + offset;
      if (val !== ans && val >= 0) {
        wrongOptions.add(val);
      }
    }

    const options = [ans, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);
    return { question: `${a} ${op} ${b} = ?`, answer: ans, options };
  };

  const startGame = () => {
    soundFX.playPop();
    setTimeLeft(30);
    setScore(0);
    setCombo(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentQ(generateQuestion());
    setIsPlaying(true);
  };

  // Timer countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      soundFX.playWin();
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('suvidha_math_high_score', String(score));
        onWin?.();
      }
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, highScore, onWin]);

  const handleAnswer = (option: number) => {
    if (!isPlaying || !currentQ || selectedOption !== null) return;

    setSelectedOption(option);
    const correct = option === currentQ.answer;
    setIsCorrect(correct);

    if (correct) {
      soundFX.playMatch();
      const pts = (combo >= 3 ? 30 : 15) * (combo + 1);
      setScore((s) => s + pts);
      setCombo((c) => c + 1);
      onScoreAdd?.(pts);
    } else {
      soundFX.playWrong();
      setCombo(0);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setCurrentQ(generateQuestion());
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Timer</p>
              <p className={`text-xl font-black font-mono ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                {timeLeft}s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
              <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">{score}</p>
            </div>
          </div>
          {highScore > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">High Score</p>
                <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{highScore}</p>
              </div>
            </div>
          )}
        </div>

        {combo >= 3 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black animate-bounce-gentle shadow-sm">
            <Flame className="w-4 h-4" />
            <span>{combo}x FIRE COMBO!</span>
          </div>
        )}
      </div>

      {/* Timer Bar */}
      {isPlaying && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timeLeft > 10 ? 'bg-amber-500' : 'bg-rose-600 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      )}

      {/* Main Play Arena */}
      <div className="p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200/80 dark:border-amber-900/60 shadow-elevated text-center space-y-6">
        {!isPlaying ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 text-2xl animate-bounce-gentle">
              ⚡
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Rapid Campus Math Challenge
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              How many equations can you solve in 30 seconds? Build continuous combos to unlock 2x multiplier!
            </p>
            {score > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-bold">
                Round Finished! You scored <span className="text-lg font-black">{score}</span> points!
              </div>
            )}
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white shadow-elevated transition-all hover:scale-105 active:scale-95"
            >
              {score > 0 ? 'Play Again' : 'Start 30-Second Sprint'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white py-4 tracking-wider">
              {currentQ?.question}
            </div>

            {/* 4 Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentQ?.options.map((opt, idx) => {
                let btnStyle =
                  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:scale-105';
                if (selectedOption === opt) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 border-emerald-600 text-white scale-105 ring-4 ring-emerald-300';
                  } else {
                    btnStyle = 'bg-rose-500 border-rose-600 text-white scale-95 ring-4 ring-rose-300';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedOption !== null}
                    className={`h-16 rounded-2xl font-black text-2xl font-mono border-2 shadow-card transition-all active:scale-95 ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
