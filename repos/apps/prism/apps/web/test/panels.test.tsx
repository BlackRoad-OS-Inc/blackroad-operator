import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Policies from "../src/components/prism/Policies";
import AgentStack from "../src/components/prism/AgentStack";
import Graph from "../src/components/prism/Graph";
import Env from "../src/components/prism/Env";
import Diffs from "../src/components/prism/Diffs";
import Timeline from "../src/components/prism/Timeline";
import Traces from "../src/components/prism/Traces";
import { createPolicy, PrismDiff, PrismEvent, PrismSpan } from "@prism/core";

describe("Prism panels", () => {
  it("renders policies and reacts to mode change", () => {
    const onModeChange = vi.fn();
    render(
      <Policies
        onModeChange={onModeChange}
        policies={[
          { id: "p1", name: "Global", policy: createPolicy("dev") },
          { id: "p2", name: "Prod", policy: createPolicy("prod") },
        ]}
      />
    );
    fireEvent.change(screen.getByLabelText("Global-mode"), { target: { value: "trusted" } });
    expect(onModeChange).toHaveBeenCalledWith("p1", "trusted");
    expect(screen.getByLabelText("dev-count")).toHaveTextContent("Dev — 1");
  });

  it("shows agent statuses", () => {
    render(
      <AgentStack
        agents={[
          {
            id: "coder",
            name: "Coder",
            version: "1.0.0",
            status: "running",
            capabilities: ["read", "write"],
            activeTask: { summary: "Update login", startedAt: new Date().toISOString(), progress: 0.5 },
            lastCompleted: { summary: "Scaffold UI", completedAt: new Date().toISOString(), status: "ok" },
          },
        ]}
      />
    );
    expect(screen.getByLabelText("Coder-status")).toHaveTextContent("Running");
  });

  it("renders execution graph", () => {
    render(
      <Graph
        nodes={[
          { id: "plan", label: "Plan", status: "done" },
          { id: "code", label: "Code", status: "running" },
        ]}
        edges={[{ from: "plan", to: "code" }]}
      />
    );
    expect(screen.getByLabelText("execution-graph")).toBeInTheDocument();
  });

  it("filters environment variables", () => {
    render(<Env values={{ GOOGLE_CLIENT_ID: "abc", DEBUG: "true" }} secrets={["GOOGLE_CLIENT_ID"]} />);
    expect(screen.getByText("••••••")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search env vars"), { target: { value: "debug" } });
    expect(screen.getByText("DEBUG")).toBeInTheDocument();
  });

  it("switches between diff files", () => {
    const diffs: PrismDiff[] = [
      {
        path: "a.txt",
        beforeSha: "1",
        afterSha: "2",
        patch: "@@ -1 +1\n-foo\n+bar",
      },
      {
        path: "b.txt",
        beforeSha: "1",
        afterSha: "2",
        patch: "@@ -1 +1\n-baz\n+qux",
      },
    ];
    render(<Diffs diffs={diffs} />);
    fireEvent.click(screen.getByText("b.txt"));
    expect(screen.getByText("+qux")).toBeInTheDocument();
  });

  it("filters timeline events", () => {
    const events: PrismEvent[] = [
      { id: "1", at: new Date().toISOString(), actor: "agent:coder", topic: "actions.run.start", payload: {} },
      { id: "2", at: new Date().toISOString(), actor: "agent:coder", topic: "actions.run.end", payload: { status: "ok" } },
    ];
    render(<Timeline events={events} />);
    fireEvent.click(screen.getByText("runs"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders trace tree", () => {
    const tree: (PrismSpan & { children: PrismSpan[] })[] = [
      {
        spanId: "s1",
        name: "root",
        startTs: new Date().toISOString(),
        status: "ok",
        children: [
          {
            spanId: "s2",
            parentSpanId: "s1",
            name: "child",
            startTs: new Date().toISOString(),
            status: "ok",
          } as PrismSpan,
        ],
      } as PrismSpan & { children: PrismSpan[] },
    ];
    render(<Traces tree={tree as any} />);
    expect(screen.getByText("root")).toBeInTheDocument();
  });
});
