import { isErr, isOk } from "../src/results/result";
import {
  assertGraphConnectivity,
  validateLucidiaProgram,
} from "../src/lucidia/validation";
import type { LucidiaProgram } from "../src/lucidia/lucidiaTypes";

describe("validateLucidiaProgram", () => {
  const baseProgram: LucidiaProgram = {
    id: "lucidia-demo",
    name: "Demo program",
    schemaVersion: "v0.1.0",
    graph: {
      nodes: [
        { id: "fetch_logs", type: "http", outputs: [{ key: "logs" }] },
        {
          id: "summarize",
          type: "agent_call",
          inputs: [{ key: "input", fromNode: "fetch_logs", fromOutput: "logs" }],
          outputs: [{ key: "summary" }],
        },
        {
          id: "email_report",
          type: "custom",
          inputs: [{ key: "body", fromNode: "summarize", fromOutput: "summary" }],
        },
      ],
      edges: [
        { id: "edge-1", from: "fetch_logs", to: "summarize" },
        { id: "edge-2", from: "summarize", to: "email_report" },
      ],
    },
  };

  it("accepts a well-formed program", () => {
    const result = validateLucidiaProgram(baseProgram);
    expect(isOk(result)).toBe(true);
  });

  it("rejects missing node references", () => {
    const result = validateLucidiaProgram({
      ...baseProgram,
      graph: {
        nodes: [...baseProgram.graph.nodes],
        edges: [{ id: "edge-1", from: "missing", to: "summarize" }],
      },
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error[0]).toMatchObject({ code: "missing_node_reference" });
    }
  });

  it("detects cycles in the graph", () => {
    const result = validateLucidiaProgram({
      ...baseProgram,
      graph: {
        nodes: [
          { id: "a", type: "http" },
          { id: "b", type: "http" },
        ],
        edges: [
          { id: "edge-1", from: "a", to: "b" },
          { id: "edge-2", from: "b", to: "a" },
        ],
      },
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.some((issue) => issue.code === "cycle_detected")).toBe(true);
    }
  });
});

describe("assertGraphConnectivity", () => {
  it("flags disconnected graphs", () => {
    const issues = assertGraphConnectivity({
      nodes: [
        { id: "root", type: "http" },
        { id: "orphan", type: "http" },
      ],
      edges: [{ id: "edge-1", from: "root", to: "root" }],
    });

    expect(issues.some((issue) => issue.code === "disconnected_graph")).toBe(true);
  });

  it("passes when all nodes are reachable", () => {
    const issues = assertGraphConnectivity({
      nodes: [
        { id: "root", type: "http" },
        { id: "child", type: "http" },
      ],
      edges: [{ id: "edge-1", from: "root", to: "child" }],
    });

    expect(issues.length).toBe(0);
  });
});
