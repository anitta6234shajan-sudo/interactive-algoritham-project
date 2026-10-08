import { BarChart3 } from 'lucide-react';
import { algorithms } from '@/lib/algorithms';

const complexityRank: Record<string, number> = {
  'O(1)': 1,
  'O(log n)': 2,
  'O(n)': 3,
  'O(V + E)': 3,
  'O(n log n)': 4,
  'O((V + E) log V)': 4,
  'O(n²)': 6,
  'O(V²)': 6,
  'O(2ⁿ)': 8,
};

const rankToPct = (rank: number): number => (rank / 8) * 100;

const barColors = [
  'from-sky-500 to-sky-600',
  'from-cyan-500 to-cyan-600',
  'from-teal-500 to-teal-600',
  'from-emerald-500 to-emerald-600',
  'from-lime-500 to-lime-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-rose-500 to-rose-600',
  'from-pink-500 to-pink-600',
  'from-violet-500 to-violet-600',
];

const speedLabels: Record<string, string> = {
  'O(1)': 'Instant',
  'O(log n)': 'Very Fast',
  'O(n)': 'Fast',
  'O(V + E)': 'Fast',
  'O(n log n)': 'Moderate',
  'O((V + E) log V)': 'Moderate',
  'O(n²)': 'Slow',
  'O(V²)': 'Slow',
  'O(2ⁿ)': 'Very Slow',
};

const speedColors: Record<string, string> = {
  'O(1)': 'text-emerald-400',
  'O(log n)': 'text-emerald-400',
  'O(n)': 'text-emerald-400',
  'O(V + E)': 'text-emerald-400',
  'O(n log n)': 'text-amber-400',
  'O((V + E) log V)': 'text-amber-400',
  'O(n²)': 'text-rose-400',
  'O(V²)': 'text-rose-400',
  'O(2ⁿ)': 'text-rose-400',
};

export default function ComplexityChart() {
  const sorted = [...algorithms].sort((a, b) => {
    const ra = complexityRank[a.timeComplexity.worst] ?? 0;
    const rb = complexityRank[b.timeComplexity.worst] ?? 0;
    return ra - rb;
  });

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
      <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-1">
        <BarChart3 className="w-4 h-4 text-sky-400" />
        Time Complexity Comparison
      </h3>
      <p className="text-xs text-slate-500 mb-5">Worst-case time complexity across all algorithms — lower bars are faster</p>

      <div className="flex flex-col gap-3">
        {sorted.map((algo, index) => {
          const worst = algo.timeComplexity.worst;
          const rank = complexityRank[worst] ?? 0;
          const pct = rankToPct(rank);
          const color = barColors[index % barColors.length];
          return (
            <div key={algo.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">{algo.name}</span>
                <span className={`font-mono text-xs font-semibold ${speedColors[worst] || 'text-slate-400'}`}>
                  {worst} <span className="text-slate-500 font-normal">· {speedLabels[worst] || ''}</span>
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-lg h-7 overflow-hidden">
                <div
                  className={`h-full rounded-lg bg-gradient-to-r ${color} transition-all duration-500 ease-out flex items-center justify-end px-2`}
                  style={{ width: `${Math.max(pct, 8)}%` }}
                >
                  <span className="text-[10px] font-bold text-white/90 tabular-nums">{worst}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-700 grid grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-400">Fast: O(1)–O(n)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-slate-400">Moderate: O(n log n)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-slate-400">Slow: O(n²)+</span>
        </div>
      </div>
    </div>
  );
}
