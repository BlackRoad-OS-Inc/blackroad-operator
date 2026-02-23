export interface CodexAgentRunnerConfig {
  endpoint: string;
  apiKey?: string;
  options?: Record<string, unknown>;
}

export interface CodexAgentRunnerEvent {
  type: string;
  timestamp: string;
  payload: unknown;
}

export type CodexAgentRunnerStatus = 'idle' | 'running' | 'error' | 'stopped';
