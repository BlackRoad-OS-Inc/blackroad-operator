import type { MentorGraph } from "./graph";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  ring: string;
}

export interface LayoutResult {
  positions: NodePosition[];
  radiusByRing: Record<string, number>;
}

const BASE_RADIUS = 120;
const RING_INCREMENT = 90;

function polarToCartesian(radius: number, angle: number): { x: number; y: number } {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export function radialLayout(graph: MentorGraph): LayoutResult {
  const radii: Record<string, number> = {
    mentor: BASE_RADIUS,
    peer: BASE_RADIUS + RING_INCREMENT,
    apprentice: BASE_RADIUS + RING_INCREMENT * 2,
  };

  const positions: NodePosition[] = [];

  for (const [ring, nodes] of Object.entries(graph.rings)) {
    const sortedNodes = nodes.slice().sort();
    const count = sortedNodes.length || 1;
    for (let index = 0; index < sortedNodes.length; index += 1) {
      const angle = (2 * Math.PI * index) / count;
      const { x, y } = polarToCartesian(radii[ring] ?? BASE_RADIUS, angle);
      positions.push({ id: sortedNodes[index], x, y, ring });
    }
  }

  for (const node of graph.nodes) {
    if (!positions.find((position) => position.id === node.id)) {
      const { x, y } = polarToCartesian(radii[node.ring] ?? BASE_RADIUS, 0);
      positions.push({ id: node.id, x, y, ring: node.ring });
    }
  }

  return { positions, radiusByRing: radii };
}
