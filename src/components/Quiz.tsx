import type { Algorithm, QuizQuestion } from '@/lib/types';
import { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface Props {
  algorithm: Algorithm;
  onComplete: (score: number) => void;
}

export default function Quiz({ algorithm, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question: QuizQuestion = algorithm.quiz[currentQ];

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === question.answerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < algorithm.quiz.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      const pct = Math.round((score / algorithm.quiz.length) * 100);
      onComplete(pct);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / algorithm.quiz.length) * 100);
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${pct >= 67 ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
          <Trophy className={`w-10 h-10 ${pct >= 67 ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Quiz Complete!</h3>
        <p className="text-slate-400">
          You scored <span className="font-bold text-slate-100">{score}</span> out of{' '}
          <span className="font-bold text-slate-100">{algorithm.quiz.length}</span> ({pct}%)
        </p>
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">
          Question {currentQ + 1} of {algorithm.quiz.length}
        </span>
        <span className="text-sm font-medium text-slate-400">
          Score: {score}
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-sky-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / algorithm.quiz.length) * 100}%` }}
        />
      </div>

      <h3 className="text-lg font-semibold text-slate-100 pt-2">{question.question}</h3>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, index) => {
          const isCorrect = index === question.answerIndex;
          const isSelected = index === selected;
          let className = 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700/50';
          if (answered && isCorrect) {
            className = 'border-emerald-500 bg-emerald-500/10';
          } else if (answered && isSelected && !isCorrect) {
            className = 'border-rose-500 bg-rose-500/10';
          } else if (answered) {
            className = 'border-slate-800 bg-slate-800/50 opacity-50';
          }
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${className}`}
            >
              <span className="font-medium text-slate-200">{option}</span>
              {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-3">
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
            <p className="text-sm text-sky-200">{question.explanation}</p>
          </div>
          <button
            onClick={handleNext}
            className="self-end px-5 py-2.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
          >
            {currentQ < algorithm.quiz.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  );
}
