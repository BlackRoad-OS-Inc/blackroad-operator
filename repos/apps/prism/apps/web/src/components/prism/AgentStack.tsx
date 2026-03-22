import { Capability } from "@prism/core";

type AgentStatus = "idle" | "running" | "blocked" | "error";

type ActiveTask = {
  summary: string;
  startedAt: string;
  progress?: number;
};

type CompletedTask = {
  summary: string;
  completedAt: string;
  status: "ok" | "error";
};

type AgentDescriptor = {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  capabilities: Capability[];
  activeTask?: ActiveTask;
  lastCompleted?: CompletedTask;
  lastError?: string;
};

type AgentStackProps = {
  agents: AgentDescriptor[];
  onSelectAgent?: (agent: AgentDescriptor) => void;
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Idle",
  running: "Running",
  blocked: "Blocked",
  error: "Error",
};

export default function AgentStack({ agents, onSelectAgent }: AgentStackProps) {
  return (
    <div className="agent-stack">
      <h3>Active Agents</h3>
      <ul>
        {agents.map((agent) => (
          <li key={agent.id} className={`agent agent--${agent.status}`}>
            <button type="button" onClick={() => onSelectAgent?.(agent)}>
              <strong>{agent.name}</strong> <span>v{agent.version}</span>
            </button>
            <div className="agent-status" aria-label={`${agent.name}-status`}>
              {STATUS_LABEL[agent.status]}
            </div>
            <div className="agent-capabilities">
              {agent.capabilities.map((capability) => (
                <span key={capability} className="capability">
                  {capability}
                </span>
              ))}
            </div>
            {agent.activeTask && (
              <div className="agent-task">
                <div className="agent-task__summary">{agent.activeTask.summary}</div>
                <div className="agent-task__meta">
                  <time dateTime={agent.activeTask.startedAt}>Started {new Date(agent.activeTask.startedAt).toLocaleTimeString()}</time>
                  {typeof agent.activeTask.progress === "number" && (
                    <progress value={agent.activeTask.progress} max={1} aria-label={`${agent.name}-progress`} />
                  )}
                </div>
              </div>
            )}
            {agent.lastCompleted && (
              <div className="agent-last">
                Last: {agent.lastCompleted.summary} &mdash; {agent.lastCompleted.status} at{" "}
                <time dateTime={agent.lastCompleted.completedAt}>{new Date(agent.lastCompleted.completedAt).toLocaleTimeString()}</time>
              </div>
            )}
            {agent.lastError && <pre className="agent-error">{agent.lastError}</pre>}
          </li>
        ))}
      </ul>
    </div>
  );
}
