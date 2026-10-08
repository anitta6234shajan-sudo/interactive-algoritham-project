import type { GraphStep, NodeType } from './types';
import { sampleGraph, buildAdjacencyList, edgeKey } from './graphData';

const { nodes, edges } = sampleGraph;
const adj = buildAdjacencyList(edges);
const allEdgeKeys = edges.map((e) => edgeKey(e.from, e.to));

function edgeStateMap(active: string[] = [], traversed: string[] = [], path: string[] = []): string[] {
  return allEdgeKeys.map((key) => {
    if (path.includes(key)) return 'path';
    if (active.includes(key)) return 'active';
    if (traversed.includes(key)) return 'traversed';
    return 'idle';
  });
}

function nodeStateMap(overrides: Record<number, NodeType>): Record<number, NodeType> {
  const base: Record<number, NodeType> = {};
  nodes.forEach((n) => { base[n.id] = 'idle'; });
  return { ...base, ...overrides };
}

export function bfsSteps(): GraphStep[] {
  const steps: GraphStep[] = [];
  const start = 0;
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const traversedEdges: string[] = [];
  const nodeStates: Record<number, NodeType> = {};
  nodes.forEach((n) => { nodeStates[n.id] = 'idle'; });
  nodeStates[start] = 'start';

  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap(),
    description: `BFS starts at node ${nodes[start].label}. We use a queue to explore neighbors level by level.`,
    codeLine: 0,
    queue: [...queue],
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodeStates[current] = 'current';
    steps.push({
      nodes, edges,
      nodeStates: { ...nodeStates },
      edgeStates: edgeStateMap([], traversedEdges),
      description: `Dequeue node ${nodes[current].label}. Exploring its neighbors.`,
      codeLine: 2,
      queue: [...queue],
    });

    const neighbors = adj.get(current) ?? [];
    for (const { to } of neighbors) {
      const eKey = edgeKey(current, to);
      if (!visited.has(to)) {
        visited.add(to);
        queue.push(to);
        traversedEdges.push(eKey);
        nodeStates[to] = 'frontier';
        steps.push({
          nodes, edges,
          nodeStates: { ...nodeStates },
          edgeStates: edgeStateMap([eKey], traversedEdges),
          description: `Discover neighbor ${nodes[to].label} via edge ${nodes[current].label}→${nodes[to].label}. Enqueue it.`,
          codeLine: 4,
          queue: [...queue],
        });
      }
    }

    nodeStates[current] = 'visited';
    steps.push({
      nodes, edges,
      nodeStates: { ...nodeStates },
      edgeStates: edgeStateMap([], traversedEdges),
      description: `Node ${nodes[current].label} is fully explored. Mark as visited.`,
      codeLine: 6,
      queue: [...queue],
    });
  }

  nodes.forEach((n) => { nodeStates[n.id] = 'visited'; });
  nodeStates[start] = 'start';
  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap([], traversedEdges),
    description: 'BFS complete! All reachable nodes have been visited in breadth-first order.',
    codeLine: 8,
    queue: [],
  });
  return steps;
}

export function dfsSteps(): GraphStep[] {
  const steps: GraphStep[] = [];
  const start = 0;
  const visited = new Set<number>();
  const traversedEdges: string[] = [];
  const nodeStates: Record<number, NodeType> = {};
  nodes.forEach((n) => { nodeStates[n.id] = 'idle'; });
  nodeStates[start] = 'start';

  const stack: number[] = [start];

  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap(),
    description: `DFS starts at node ${nodes[start].label}. We use a stack (recursion) to go as deep as possible before backtracking.`,
    codeLine: 0,
    stack: [...stack],
  });

  function dfs(current: number) {
    visited.add(current);
    nodeStates[current] = 'current';
    steps.push({
      nodes, edges,
      nodeStates: { ...nodeStates },
      edgeStates: edgeStateMap([], traversedEdges),
      description: `Visit node ${nodes[current].label}. Mark as visited.`,
      codeLine: 1,
      stack: [...stack],
    });

    const neighbors = adj.get(current) ?? [];
    for (const { to } of neighbors) {
      if (!visited.has(to)) {
        const eKey = edgeKey(current, to);
        traversedEdges.push(eKey);
        nodeStates[to] = 'frontier';
        stack.push(to);
        steps.push({
          nodes, edges,
          nodeStates: { ...nodeStates },
          edgeStates: edgeStateMap([eKey], traversedEdges),
          description: `Go deeper: edge ${nodes[current].label}→${nodes[to].label}. Push ${nodes[to].label} onto stack.`,
          codeLine: 3,
          stack: [...stack],
        });
        dfs(to);
        stack.pop();
        nodeStates[current] = 'current';
        steps.push({
          nodes, edges,
          nodeStates: { ...nodeStates },
          edgeStates: edgeStateMap([], traversedEdges),
          description: `Backtrack to ${nodes[current].label}. Continue with remaining neighbors.`,
          codeLine: 5,
          stack: [...stack],
        });
      }
    }

    nodeStates[current] = 'visited';
    steps.push({
      nodes, edges,
      nodeStates: { ...nodeStates },
      edgeStates: edgeStateMap([], traversedEdges),
      description: `Node ${nodes[current].label} is fully explored. All neighbors visited.`,
      codeLine: 6,
      stack: [...stack],
    });
  }

  dfs(start);

  nodes.forEach((n) => { nodeStates[n.id] = 'visited'; });
  nodeStates[start] = 'start';
  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap([], traversedEdges),
    description: 'DFS complete! All reachable nodes have been visited in depth-first order.',
    codeLine: 8,
    stack: [],
  });
  return steps;
}

export function dijkstraSteps(): GraphStep[] {
  const steps: GraphStep[] = [];
  const start = 0;
  const target = 9;
  const dist: Record<number, number> = {};
  const prev: Record<number, number | null> = {};
  const visited = new Set<number>();
  const traversedEdges: string[] = [];
  const nodeStates: Record<number, NodeType> = {};

  nodes.forEach((n) => {
    dist[n.id] = Infinity;
    prev[n.id] = null;
    nodeStates[n.id] = 'idle';
  });
  dist[start] = 0;
  nodeStates[start] = 'start';
  nodeStates[target] = 'target';

  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap(),
    description: `Dijkstra's algorithm: find shortest path from ${nodes[start].label} to ${nodes[target].label}. Initialize all distances to ∞, source to 0.`,
    codeLine: 0,
    distances: { ...dist },
    metricLabel: 'Current Node',
    metricValue: '-',
  });

  const unvisited = new Set<number>(nodes.map((n) => n.id));

  while (unvisited.size > 0) {
    // Find min-distance unvisited node
    let u: number | null = null;
    let minDist = Infinity;
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id];
        u = id;
      }
    }
    if (u === null || minDist === Infinity) break;

    unvisited.delete(u);
    visited.add(u);
    if (nodeStates[u] !== 'start' && nodeStates[u] !== 'target') nodeStates[u] = 'current';

    steps.push({
      nodes, edges,
      nodeStates: { ...nodeStates },
      edgeStates: edgeStateMap([], traversedEdges),
      description: `Select node ${nodes[u].label} with smallest distance ${dist[u] === Infinity ? '∞' : dist[u]}.`,
      codeLine: 2,
      distances: { ...dist },
      metricLabel: 'Current Node',
      metricValue: nodes[u].label,
    });

    if (u === target) {
      steps.push({
        nodes, edges,
        nodeStates: { ...nodeStates },
        edgeStates: edgeStateMap([], traversedEdges),
        description: `Reached target ${nodes[target].label}! Distance = ${dist[u]}. Now reconstructing the path.`,
        codeLine: 4,
        distances: { ...dist },
        metricLabel: 'Current Node',
        metricValue: nodes[u].label,
      });
      break;
    }

    const neighbors = adj.get(u) ?? [];
    for (const { to, weight } of neighbors) {
      if (!visited.has(to)) {
        const eKey = edgeKey(u, to);
        const alt = dist[u] + weight;
        traversedEdges.push(eKey);
        if (nodeStates[to] !== 'start' && nodeStates[to] !== 'target' && nodeStates[to] !== 'visited') {
          nodeStates[to] = 'frontier';
        }
        steps.push({
          nodes, edges,
          nodeStates: { ...nodeStates },
          edgeStates: edgeStateMap([eKey], traversedEdges),
          description: `Relax edge ${nodes[u].label}→${nodes[to].label} (weight ${weight}). New distance: ${alt}, current: ${dist[to] === Infinity ? '∞' : dist[to]}.`,
          codeLine: 6,
          distances: { ...dist },
          metricLabel: 'Current Node',
          metricValue: nodes[u].label,
        });

        if (alt < dist[to]) {
          dist[to] = alt;
          prev[to] = u;
          steps.push({
            nodes, edges,
            nodeStates: { ...nodeStates },
            edgeStates: edgeStateMap([eKey], traversedEdges),
            description: `Update ${nodes[to].label}: distance ${alt} is shorter. Set predecessor to ${nodes[u].label}.`,
            codeLine: 7,
            distances: { ...dist },
            metricLabel: 'Current Node',
            metricValue: nodes[u].label,
          });
        }
      }
    }

    if (nodeStates[u] !== 'start' && nodeStates[u] !== 'target') nodeStates[u] = 'visited';
  }

  // Reconstruct path
  const pathNodes: number[] = [];
  const pathEdges: string[] = [];
  let curr: number | null = target;
  while (curr !== null) {
    pathNodes.push(curr);
    const p: number | null = prev[curr];
    if (p !== null) pathEdges.push(edgeKey(p, curr));
    curr = p;
  }
  pathNodes.reverse();

  pathNodes.forEach((id) => {
    if (nodeStates[id] !== 'start' && nodeStates[id] !== 'target') nodeStates[id] = 'path';
  });

  steps.push({
    nodes, edges,
    nodeStates: { ...nodeStates },
    edgeStates: edgeStateMap([], traversedEdges, pathEdges),
    description: `Shortest path: ${pathNodes.map((id) => nodes[id].label).join(' → ')} with total distance ${dist[target]}.`,
    codeLine: 10,
    distances: { ...dist },
    metricLabel: 'Path Distance',
    metricValue: String(dist[target]),
  });

  return steps;
}
