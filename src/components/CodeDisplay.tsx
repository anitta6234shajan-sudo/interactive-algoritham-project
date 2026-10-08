import type { Algorithm } from '@/lib/types';

interface Props {
  algorithm: Algorithm;
  currentLine: number | undefined;
}

export default function CodeDisplay({ algorithm, currentLine }: Props) {
  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
        </div>
        <span className="text-slate-500 text-sm font-medium ml-2">{algorithm.name}.js</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono">
          {algorithm.code.map((line, index) => (
            <div
              key={index}
              className={`px-2 -mx-2 rounded transition-colors duration-150 ${
                currentLine === index
                  ? 'bg-sky-500/20 border-l-2 border-sky-400'
                  : 'border-l-2 border-transparent'
              }`}
            >
              <span className="text-slate-600 select-none mr-4 inline-block w-6 text-right">{index + 1}</span>
              <span className={currentLine === index ? 'text-sky-200' : 'text-slate-300'}>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
