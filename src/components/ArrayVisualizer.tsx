import type { Step } from '@/lib/types';

const barStyles: Record<string, { bg: string; border: string; glow: string; label: string }> = {
  compare: { bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-lg shadow-amber-500/40', label: 'text-amber-400' },
  swap: { bg: 'bg-rose-500', border: 'border-rose-400', glow: 'shadow-lg shadow-rose-500/40', label: 'text-rose-400' },
  sorted: { bg: 'bg-emerald-500', border: 'border-emerald-400', glow: 'shadow-lg shadow-emerald-500/40', label: 'text-emerald-400' },
  pivot: { bg: 'bg-violet-500', border: 'border-violet-400', glow: 'shadow-lg shadow-violet-500/40', label: 'text-violet-400' },
  highlight: { bg: 'bg-sky-500', border: 'border-sky-400', glow: 'shadow-lg shadow-sky-500/40', label: 'text-sky-400' },
  idle: { bg: 'bg-slate-700', border: 'border-slate-600', glow: '', label: 'text-slate-400' },
};

interface Props {
  step: Step;
  maxValue: number;
}

export default function ArrayVisualizer({ step, maxValue }: Props) {
  const { array, highlights } = step;

  const getHighlightType = (index: number): string => {
    for (const h of highlights) {
      if (h.indices.includes(index)) return h.type;
    }
    return 'idle';
  };

  // Round up to nearest 10 for clean axis ticks
  const axisMax = Math.ceil(maxValue / 10) * 10;
  const tickValues = [axisMax, Math.round(axisMax * 0.75), Math.round(axisMax * 0.5), Math.round(axisMax * 0.25), 0];

  return (
    <div className="flex h-96 w-full select-none">
      {/* Y-axis with grid lines */}
      <div className="relative w-10 flex-shrink-0">
        {tickValues.map((tick, i) => {
          const topPct = (i / (tickValues.length - 1)) * 100;
          return (
            <div
              key={tick}
              className="absolute left-0 right-0 text-right pr-1"
              style={{ top: `${topPct}%`, transform: 'translateY(-50%)' }}
            >
              <span className="text-[10px] font-medium text-slate-500 tabular-nums">{tick}</span>
            </div>
          );
        })}
      </div>

      {/* Chart area */}
      <div className="relative flex-1">
        {/* Horizontal grid lines */}
        {tickValues.map((tick, i) => {
          const topPct = (i / (tickValues.length - 1)) * 100;
          return (
            <div
              key={tick}
              className={`absolute left-0 right-0 ${i === tickValues.length - 1 ? 'border-slate-600' : 'border-slate-800'} border-t ${i === 0 ? 'border-t-0' : ''}`}
              style={{ top: `${topPct}%` }}
            />
          );
        })}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-center gap-2 px-2 pb-0">
          {array.map((value, index) => {
            const type = getHighlightType(index);
            const style = barStyles[type] || barStyles.idle;
            const heightPct = (value / axisMax) * 100;
            return (
              <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0 h-full justify-end">
                {/* Value label above bar */}
                <span className={`text-xs font-bold tabular-nums transition-colors duration-200 ${style.label}`}>
                  {value}
                </span>
                {/* The bar itself */}
                <div
                  className={`w-full max-w-[48px] rounded-t-lg border-2 transition-all duration-300 ease-out ${style.bg} ${style.border} ${style.glow}`}
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
                {/* Index label below bar */}
                <span className="text-[10px] font-medium text-slate-500 tabular-nums">{index}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
