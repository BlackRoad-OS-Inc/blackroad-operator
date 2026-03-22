import { err, ok, type Result } from "../results/result";
import type { LucidiaEdge, LucidiaGraph, LucidiaProgram } from "./lucidiaTypes";

export type LucidiaValidationCode =
  | "missing_graph"
  | "duplicate_node"
  | "missing_node_reference"
  | "cycle_detected"
  | "disconnected_graph";

export interface LucidiaValidationIssue {
  code: LucidiaValidationCode;
  message: string;
  path?: string;
}

export interface LucidiaValidationSuccess {
  program: LucidiaProgram;
}

export function validateLucidiaProgram(
  program: LucidiaProgram,
): Result<LucidiaValidationSuccess, LucidiaValidationIssue[]> {
  const issues: LucidiaValidationIssue[] = [];

  if (!program.graph) {
    return err([
      {
        code: "missing_graph",
        message: "Program is missing a graph definition.",
        path: "graph",
      },
    ]);
  }

  const { nodes, edges } = program.graph;
  const nodeIds = new Set<string>();

  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        code: "duplicate_node",
        message: "Node id '" + node.id + "' is duplicated in the graph.",
        path: "graph.nodes." + node.id,
      });
    } else {
      nodeIds.add(node.id);
    }
  }

  for (const node of nodes) {
    if (!node.inputs) {
      continue;
    }

    for (const input of node.inputs) {
      if (input.fromNode && !nodeIds.has(input.fromNode)) {
        issues.push({
          code: "missing_node_reference",
          message: "Input references missing node '" + input.fromNode + "'.",
          path: "graph.nodes." + node.id + ".inputs." + input.key,
        });
      }
    }
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.from)) {
      issues.push({
        code: "missing_node_reference",
        message: "Edge '" + edge.id + "' references missing source node '" + edge.from + "'.",
        path: "graph.edges." + edge.id + ".from",
      });
    }
    if (!nodeIds.has(edge.to)) {
      issues.push({
        code: "missing_node_reference",
        message: "Edge '" + edge.id + "' references missing target node '" + edge.to + "'.",
        path: "graph.edges." + edge.id + ".to",
      });
    }
  }

  if (issues.length > 0) {
    return err(issues);
  }

  const cycleIssues = detectCycles(nodes.map((node) => node.id), edges);
  issues.push(...cycleIssues);

  if (issues.length > 0) {
    return err(issues);
  }

  return ok({ program });
}

function detectCycles(nodeIds: string[], edges: LucidiaEdge[]): LucidiaValidationIssue[] {
  const adjacency = new Map<string, string[]>();
  for (const id of nodeIds) {
    adjacency.set(id, []);
  }

  for (const edge of edges) {
    const neighbors = adjacency.get(edge.from);
    if (neighbors) {
      neighbors.push(edge.to);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const issues: LucidiaValidationIssue[] = [];

  const dfs = (nodeId: string, path: string[]): void => {
    if (visiting.has(nodeId)) {
      const cyclePath = [...path, nodeId].join(" -> ");
      issues.push({
        code: "cycle_detected",
        message: "Cycle detected in graph: " + cyclePath,
        path: "graph.edges",
      });
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      dfs(neighbor, [...path, nodeId]);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }

  return issues;
}

export function assertGraphConnectivity(graph: LucidiaGraph): LucidiaValidationIssue[] {
  if (graph.nodes.length === 0) {
    return [
      {
        code: "missing_graph",
        message: "Graph must contain at least one node.",
        path: "graph.nodes",
      },
    ];
  }

  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const neighbors = adjacency.get(edge.from);
    if (neighbors) {
      neighbors.push(edge.to);
    }
  }

  const visited = new Set<string>();
  const stack = [graph.nodes[0]?.id];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || visited.has(node)) {
      continue;
    }

    visited.add(node);
    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  if (visited.size !== graph.nodes.length) {
    const unreachable = graph.nodes
      .map((node) => node.id)
      .filter((id) => !visited.has(id));
    return [
      {
        code: "disconnected_graph",
        message: "Graph is disconnected. Unreachable nodes: " + unreachable.join(", "),
        path: "graph.nodes",
      },
    ];
  }

  return [];
}
