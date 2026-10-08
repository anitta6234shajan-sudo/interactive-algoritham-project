import type { GraphStep, NodeType, EdgeType } from '@/lib/types';

const nodeColors: Record<NodeType, { fill: string; stroke: string; text: string; glow: string }> = {
  idle:     { fill: 'fill-slate-700',   stroke: 'stroke-slate-600',   text: 'text-slate-400',  glow: '' },
  current:  { fill: 'fill-sky-500',     stroke: 'stroke-sky-400',     text: 'text-white',      glow: 'drop-shadow-[0_0_8px_rgba(14,165,233,0.7)]' },
  visiting: { fill: 'fill-cyan-400',    stroke: 'stroke-cyan-300',    text: 'text-slate-900',  glow: 'drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' },
  visited:  { fill: 'fill-emerald-600', stroke: 'stroke-emerald-400', text: 'text-white',      glow: '' },
  frontier: { fill: 'fill-amber-400',   stroke: 'stroke-amber-300',   text: 'text-slate-900',  glow: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' },
  path:     { fill: 'fill-violet-500',  stroke: 'stroke-violet-400',  text: 'text-white',      glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]' },
  start:    { fill: 'fill-teal-500',    stroke: 'stroke-teal-400',    text: 'text-white',      glow: 'drop-shadow-[0_0_8px_rgba(20,184,166,0.7)]' },
  target:   { fill: 'fill-rose-500',    stroke: 'stroke-rose-400',    text: 'text-white',      glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]' },
};

const edgeColors: Record<EdgeType | string, string> = {
  idle:      'stroke-slate-700',
  traversed: 'stroke-emerald-600',
  active:    'stroke-amber-400',
  path:      'stroke-violet-400',
};

interface Props {
  step: GraphStep;
}

export default function GraphVisualizer({ step }: Props) {
  const { nodes, edges, nodeStates, edgeStates } = step;

  return (
    <div className="w-full h-96 relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find((n) => n.id === edge.from)!;
          const toNode = nodes.find((n) => n.id === edge.to)!;
          const state = edgeStates[i] || 'idle';
          const color = edgeColors[state] || edgeColors.idle;
          const isActive = state === 'active' || state === 'path';
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;

          return (
            <g key={i}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`${color} transition-all duration-300`}
                strokeWidth={isActive ? 1.2 : 0.5}
                strokeOpacity={state === 'idle' ? 0.4 : 0.9}
              />
              {edge.weight != null && (
                <text
                  x={midX}
                  y={midY - 1}
                  textAnchor="middle"
                  className="fill-slate-500 text-[2.5px] font-mono font-bold"
                >
                  {edge.weight}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const state = nodeStates[node.id] || 'idle';
          const colors = nodeColors[state] || nodeColors.idle;
          return (
            <g key={node.id} className={`transition-all duration-300 ${colors.glow}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={4.5}
                className={`${colors.fill} ${colors.stroke} transition-all duration-300`}
                strokeWidth={0.8}
              />
              <text
                x={node.x}
                y={node.y + 1.2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`${colors.text} text-[3.5px] font-bold transition-colors duration-300`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Queue / Stack display */}
      {(step.queue && step.queue.length > 0) || (step.stack && step.stack.length > 0) ? (
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">
            {step.queue != null ? 'Queue:' : 'Stack:'}
          </span>
          {(step.queue ?? step.stack ?? []).map((id, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 rounded text-xs font-bold tabular-nums ${
                i === 0 && step.queue != null
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {nodes.find((n) => n.id === id)?.label ?? id}
            </div>
          ))}
        </div>
      ) : null}

      {/* Distances display for Dijkstra */}
      {step.distances && (
        <div className="absolute top-2 left-2 right-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">{step.metricLabel}:</span>
          <span className="text-xs font-bold text-sky-400">{step.metricValue}</span>
          <span className="text-xs text-slate-600 mx-1">|</span>
          <span className="text-xs font-semibold text-slate-400">Distances:</span>
          {nodes.map((node) => {
            const d = step.distances![node.id];
            const isInf = d === Infinity || d == null;
            return (
              <span
                key={node.id}
                className={`text-xs font-mono tabular-nums px-1.5 rounded ${
                  isInf ? 'text-slate-600' : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {node.label}:{isInf ? '∞' : d}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
