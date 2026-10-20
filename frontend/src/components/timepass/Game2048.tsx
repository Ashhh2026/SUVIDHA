import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

type Board = number[][];

const TILE_MILESTONES: Record<number, { title: string; color: string; text: string }> = {
  2: { title: 'Fresher 🎒', color: 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300', text: 'text-2xl font-bold' },
  4: { title: 'Lab Record 🧪', color: 'bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 border-amber-400', text: 'text-2xl font-bold' },
  8: { title: 'Midterm 📝', color: 'bg-orange-300 dark:bg-orange-900/60 text-orange-950 dark:text-orange-100 border-orange-400', text: 'text-2xl font-black' },
  16: { title: 'Project 💡', color: 'bg-orange-400 dark:bg-orange-800 text-white border-orange-500', text: 'text-2xl font-black' },
  32: { title: 'Internship 💼', color: 'bg-rose-400 dark:bg-rose-800 text-white border-rose-500', text: 'text-2xl font-black' },
  64: { title: 'Hackathon 🏆', color: 'bg-rose-500 dark:bg-rose-700 text-white border-rose-600', text: 'text-2xl font-black' },
  128: { title: 'Research 📜', color: 'bg-yellow-400 text-yellow-950 border-yellow-500 shadow-md', text: 'text-xl font-black' },
  256: { title: "Dean's List 🎖️", color: 'bg-yellow-500 text-slate-900 border-yellow-600 shadow-lg', text: 'text-xl font-black' },
  512: { title: 'Campus Legend 🌟', color: 'bg-emerald-500 text-white border-emerald-600 shadow-lg', text: 'text-xl font-black' },
  1024: { title: 'Architect 🏛️', color: 'bg-indigo-600 text-white border-indigo-700 shadow-xl', text: 'text-lg font-black' },
  2048: { title: 'Chancellor 👑', color: 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 text-white border-amber-300 shadow-2xl animate-pulse', text: 'text-lg font-black' },
};

export const Game2048: React.FC<{ onScoreAdd?: (pts: number) => void; onWin?: () => void }> = ({
  onScoreAdd,
  onWin,
}) => {
  const [board, setBoard] = useState<Board>(() => [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('suvidha_2048_best')) || 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Add random tile (2 or 4)
  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) emptyCells.push({ r, c });
      });
    });
    if (emptyCells.length === 0) return currentBoard;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const restartGame = useCallback(() => {
    soundFX.playPop();
    let initial: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    initial = addRandomTile(initial);
    initial = addRandomTile(initial);
    setBoard(initial);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
  }, []);

  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Slide & Merge logic
  const slideRow = (row: number[]): { newRow: number[]; scoreGained: number } => {
    const filtered = row.filter((val) => val !== 0);
    const newRow: number[] = [];
    let scoreGained = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        scoreGained += mergedVal;
        i++; // skip next
      } else {
        newRow.push(filtered[i]);
      }
    }
    while (newRow.length < 4) {
      newRow.push(0);
    }
    return { newRow, scoreGained };
  };

  const moveLeft = (currentBoard: Board) => {
    let changed = false;
    let gained = 0;
    const newBoard = currentBoard.map((row) => {
      const { newRow, scoreGained } = slideRow(row);
      gained += scoreGained;
      if (newRow.some((val, idx) => val !== row[idx])) changed = true;
      return newRow;
    });
    return { newBoard, changed, gained };
  };

  const rotateClockwise = (matrix: Board): Board => {
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  };

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (isGameOver) return;
      let rotated = board;
      let rotations = 0;

      if (direction === 'up') {
        rotated = rotateClockwise(rotateClockwise(rotateClockwise(board)));
        rotations = 1;
      } else if (direction === 'right') {
        rotated = rotateClockwise(rotateClockwise(board));
        rotations = 2;
      } else if (direction === 'down') {
        rotated = rotateClockwise(board);
        rotations = 3;
      }

      const { newBoard, changed, gained } = moveLeft(rotated);

      if (changed) {
        soundFX.playSlide();
        if (gained > 0) soundFX.playMatch();

        let finalBoard = newBoard;
        for (let i = 0; i < (4 - rotations) % 4; i++) {
          finalBoard = rotateClockwise(finalBoard);
        }

        const nextBoardWithTile = addRandomTile(finalBoard);
        setBoard(nextBoardWithTile);

        const nextScore = score + gained;
        setScore(nextScore);
        if (gained > 0) onScoreAdd?.(gained);

        if (nextScore > bestScore) {
          setBestScore(nextScore);
          localStorage.setItem('suvidha_2048_best', String(nextScore));
        }

        // Check if 2048 reached
        if (!hasWon && nextBoardWithTile.some((row) => row.some((c) => c >= 2048))) {
          setHasWon(true);
          soundFX.playWin();
          onWin?.();
        }
      }
    },
    [board, isGameOver, score, bestScore, hasWon, onScoreAdd, onWin]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/60 dark:border-amber-900/40 shadow-card">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">2048 Campus</h3>
          <p className="text-[11px] text-slate-500">Merge tiles to reach Chancellor 👑</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-center">
            <p className="text-[9px] uppercase font-black tracking-wider opacity-85">Score</p>
            <p className="text-sm font-mono font-black">{score}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-center border border-slate-200 dark:border-slate-700">
            <p className="text-[9px] uppercase font-black tracking-wider text-slate-400">Best</p>
            <p className="text-sm font-mono font-black">{bestScore}</p>
          </div>
          <button
            onClick={restartGame}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
            title="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4x4 Game Board */}
      <div className="p-3 sm:p-4 rounded-3xl bg-amber-950/20 dark:bg-black/40 backdrop-blur-md border-2 border-amber-300/80 dark:border-amber-800/80 shadow-elevated">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {board.map((row, r) =>
            row.map((val, c) => {
              const meta = TILE_MILESTONES[val];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`h-20 sm:h-22 rounded-2xl border flex flex-col items-center justify-center p-1 transition-all duration-150 select-none ${
                    val === 0
                      ? 'bg-amber-100/30 dark:bg-slate-800/40 border-amber-200/20'
                      : `${meta?.color || 'bg-amber-500 text-white'} shadow-md`
                  }`}
                >
                  {val > 0 && (
                    <>
                      <span className={meta?.text || 'text-xl font-black font-mono'}>{val}</span>
                      <span className="text-[9px] font-black tracking-tight mt-0.5 truncate max-w-full opacity-90">
                        {meta?.title || 'Merged'}
                      </span>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tactile D-Pad Controls for Touch & Mobile */}
      <div className="flex flex-col items-center gap-1.5 pt-2">
        <button
          onClick={() => move('up')}
          className="w-14 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-card hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95"
          aria-label="Up"
        >
          <ArrowUp className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => move('left')}
            className="w-14 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-card hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95"
            aria-label="Left"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={() => move('down')}
            className="w-14 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-card hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95"
            aria-label="Down"
          >
            <ArrowDown className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <button
            onClick={() => move('right')}
            className="w-14 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-card hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95"
            aria-label="Right"
          >
            <ArrowRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-1">
          Pro Tip: Use Keyboard Arrow Keys or WASD to slide quickly!
        </p>
      </div>
    </div>
  );
};
