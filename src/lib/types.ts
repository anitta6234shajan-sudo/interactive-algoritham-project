export type ComparisonType = 'compare' | 'swap' | 'sorted' | 'pivot' | 'highlight' | 'idle';

export type NodeType = 'idle' | 'current' | 'visiting' | 'visited' | 'frontier' | 'path' | 'start' | 'target';
export type EdgeType = 'idle' | 'traversed' | 'active' | 'path';

export interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: number;
  to: number;
  weight?: number;
}

export interface GraphStep {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeStates: Record<number, NodeType>;
  edgeStates: string[];
  description: string;
  codeLine?: number;
  queue?: number[];
  stack?: number[];
  distances?: Record<number, number>;
  metricLabel?: string;
  metricValue?: string;
}

export interface Step {
  array: number[];
  highlights: { indices: number[]; type: ComparisonType }[];
  comparisons: number;
  swaps: number;
  description: string;
  codeLine?: number;
}

export type VisualizerType = 'array' | 'graph';

export interface Algorithm {
  id: string;
  name: string;
  category: 'Sorting' | 'Searching' | 'Graph' | 'Techniques';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  code: string[];
  visualizer: VisualizerType;
  run?: (input: number[]) => Step[];
  runGraph?: () => GraphStep[];
  graphData?: { nodes: GraphNode[]; edges: GraphEdge[] };
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}
