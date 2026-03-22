import { useMemo } from "react";

type NodeStatus = "pending" | "running" | "done" | "error";

type GraphNode = {
  id: string;
  label: string;
  status?: NodeStatus;
};

type GraphEdge = {
  from: string;
  to: string;
  label?: string;
};

type GraphProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

type PositionedNode = GraphNode & { x: number; y: number };

const STATUS_COLOR: Record<NodeStatus, string> = {
  pending: "#64748b",
  running: "#2563eb",
  done: "#16a34a",
  error: "#dc2626",
};

/**
 * Detect strongly connected components (cycles) using Tarjan's algorithm
 */
function findStronglyConnectedComponents(
  nodes: GraphNode[],
  adjacency: Map<string, string[]>
): string[][] {
  const index = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let currentIndex = 0;

  function strongConnect(nodeId: string) {
    index.set(nodeId, currentIndex);
    lowlink.set(nodeId, currentIndex);
    currentIndex++;
    stack.push(nodeId);
    onStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!index.has(neighbor)) {
        strongConnect(neighbor);
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, lowlink.get(neighbor)!));
      } else if (onStack.has(neighbor)) {
        lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, index.get(neighbor)!));
      }
    }

    if (lowlink.get(nodeId) === index.get(nodeId)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== nodeId);
      components.push(component);
    }
  }

  nodes.forEach((node) => {
    if (!index.has(node.id)) {
      strongConnect(node.id);
    }
  });

  return components;
}

function layout(nodes: GraphNode[], edges: GraphEdge[]): PositionedNode[] {
  const adjacency = new Map<string, string[]>();
  const indegree = new Map<string, number>();

  nodes.forEach((node) => {
    adjacency.set(node.id, []);
    indegree.set(node.id, 0);
  });

  edges.forEach((edge) => {
    adjacency.get(edge.from)?.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  });

  // Find strongly connected components (cycles)
  const components = findStronglyConnectedComponents(nodes, adjacency);
  const nodeToComponent = new Map<string, number>();
  components.forEach((component, idx) => {
    component.forEach((nodeId) => {
      nodeToComponent.set(nodeId, idx);
    });
  });

  // Identify components with cycles
  const cyclicComponents = new Set<number>();
  components.forEach((component, idx) => {
    if (component.length > 1) {
      cyclicComponents.add(idx);
    } else {
      // Check for self-loop
      const nodeId = component[0];
      const neighbors = adjacency.get(nodeId) ?? [];
      if (neighbors.includes(nodeId)) {
        cyclicComponents.add(idx);
      }
    }
  });

  // Assign levels using modified topological sort
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function assignLevel(nodeId: string, currentLevel: number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const existingLevel = levels.get(nodeId) ?? -1;
    const newLevel = Math.max(existingLevel, currentLevel);
    levels.set(nodeId, newLevel);

    const neighbors = adjacency.get(nodeId) ?? [];
    neighbors.forEach((neighbor) => {
      // Only follow edges if they're not back-edges within a cycle
      const fromComponent = nodeToComponent.get(nodeId);
      const toComponent = nodeToComponent.get(neighbor);
      if (fromComponent !== toComponent || !cyclicComponents.has(fromComponent!)) {
        assignLevel(neighbor, newLevel + 1);
      }
    });
  }

  // Start from nodes with zero indegree
  nodes.forEach((node) => {
    if ((indegree.get(node.id) ?? 0) === 0) {
      assignLevel(node.id, 0);
    }
  });

  // Handle any remaining unvisited nodes (in cycles with no entry)
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      assignLevel(node.id, levels.get(node.id) ?? 0);
    }
  });

  // Group by level and spread horizontally
  const grouped = new Map<number, PositionedNode[]>();
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0;
    const column = grouped.get(level) ?? [];
    grouped.set(level, column);

    // Mark cyclic nodes visually (we'll use this info later)
    const componentIdx = nodeToComponent.get(node.id);
    const isCyclic = componentIdx !== undefined && cyclicComponents.has(componentIdx);

    column.push({
      ...node,
      x: level,
      y: column.length,
      label: isCyclic ? `⟲ ${node.label}` : node.label,
    });
  });

  const horizontalSpacing = 180;
  const verticalSpacing = 120;
  const siblingSpacing = 80; // Horizontal spread for siblings

  const positioned: PositionedNode[] = [];

  grouped.forEach((column, level) => {
    // Sort nodes in column for better visual layout
    column.sort((a, b) => {
      // Prioritize nodes by status
      const statusPriority: Record<string, number> = {
        running: 0,
        error: 1,
        done: 2,
        pending: 3,
      };
      const aPriority = statusPriority[a.status ?? "pending"] ?? 10;
      const bPriority = statusPriority[b.status ?? "pending"] ?? 10;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.id.localeCompare(b.id);
    });

    const columnHeight = column.length;
    column.forEach((node, index) => {
      // Calculate base position
      const baseX = level * horizontalSpacing + 80;

      // Add horizontal jitter for dense columns to reduce overlap
      let xOffset = 0;
      if (columnHeight > 5) {
        xOffset = ((index % 3) - 1) * siblingSpacing;
      }

      const x = baseX + xOffset;
      const y = index * verticalSpacing + 60;

      positioned.push({ ...node, x, y });
    });
  });

  return positioned;
}

export default function Graph({ nodes, edges }: GraphProps) {
  const positioned = useMemo(() => layout(nodes, edges), [nodes, edges]);
  const nodeMap = new Map(positioned.map((node) => [node.id, node] as const));
  if (positioned.length === 0) {
    return <div>No nodes in graph.</div>;
  }
  const width = Math.max(...positioned.map((node) => node.x)) + 160 || 320;
  const height = Math.max(...positioned.map((node) => node.y)) + 160 || 240;

  return (
    <svg width={width} height={height} role="img" aria-label="execution-graph">
      {edges.map((edge) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;
        const path = `M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y}, ${(from.x + to.x) / 2} ${to.y}, ${to.x} ${to.y}`;
        return (
          <g key={`${edge.from}-${edge.to}`} className="graph-edge">
            <path d={path} fill="none" stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrowhead)" />
            {edge.label && (
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2} textAnchor="middle" className="graph-edge__label">
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
      </defs>
      {positioned.map((node) => (
        <g key={node.id} className="graph-node" transform={`translate(${node.x - 50}, ${node.y - 20})`}>
          <rect width={100} height={40} rx={6} fill={STATUS_COLOR[node.status ?? "pending"]} opacity={0.85} />
          <text x={50} y={24} textAnchor="middle" fill="#fff">
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
