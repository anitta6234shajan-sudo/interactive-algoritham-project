import type { GraphNode, GraphEdge } from './types';

// A shared sample graph for BFS/DFS/Dijkstra visualizations.
// Nodes are positioned on a grid for clear visualization.
export const sampleGraph: { nodes: GraphNode[]; edges: GraphEdge[] } = {
  nodes: [
    { id: 0, label: 'A', x: 50, y: 15 },
    { id: 1, label: 'B', x: 20, y: 40 },
    { id: 2, label: 'C', x: 80, y: 40 },
    { id: 3, label: 'D', x: 10, y: 70 },
    { id: 4, label: 'E', x: 40, y: 70 },
    { id: 5, label: 'F', x: 70, y: 70 },
    { id: 6, label: 'G', x: 90, y: 70 },
    { id: 7, label: 'H', x: 25, y: 92 },
    { id: 8, label: 'I', x: 55, y: 92 },
    { id: 9, label: 'J', x: 85, y: 92 },
  ],
  edges: [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 5 },
    { from: 1, to: 4, weight: 2 },
    { from: 2, to: 5, weight: 6 },
    { from: 2, to: 6, weight: 1 },
    { from: 3, to: 7, weight: 3 },
    { from: 4, to: 7, weight: 7 },
    { from: 4, to: 8, weight: 4 },
    { from: 5, to: 8, weight: 2 },
    { from: 5, to: 9, weight: 5 },
    { from: 6, to: 9, weight: 8 },
    { from: 7, to: 8, weight: 6 },
    { from: 8, to: 9, weight: 3 },
  ],
};

// Build adjacency list from edges (undirected)
export function buildAdjacencyList(edges: GraphEdge[]): Map<number, { to: number; weight: number }[]> {
  const adj = new Map<number, { to: number; weight: number }[]>();
  for (const edge of edges) {
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);
    adj.get(edge.from)!.push({ to: edge.to, weight: edge.weight ?? 1 });
    adj.get(edge.to)!.push({ to: edge.from, weight: edge.weight ?? 1 });
  }
  return adj;
}

export function edgeKey(from: number, to: number): string {
  return from < to ? `${from}-${to}` : `${to}-${from}`;
}
