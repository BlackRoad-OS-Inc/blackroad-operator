/**
 * Agent manifest structure
 */
export interface AgentManifest {
  name: string;
  version: string;
  agent_id: string;
  description: string;
  capabilities: string[];
  dependencies?: string[];
  resources?: {
    cpu?: string;
    memory?: string;
  };
  profile?: {
    agent_id: string;
    agent_name: string;
    type: string;
    capabilities: string[];
    affiliation?: string;
    status?: string;
    handles?: Record<string, string>;
    aliases?: string[];
  };
}

/**
 * Agent status information
 */
export interface AgentStatus {
  agent_id: string;
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error';
  last_heartbeat?: Date;
  uptime_seconds?: number;
  tasks_completed?: number;
  tasks_failed?: number;
  cpu_usage?: number;
  memory_usage?: number;
}

/**
 * Task submission request
 */
export interface TaskRequest {
  task: string;
  context?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  timeout_ms?: number;
  callback_url?: string;
}

/**
 * Task execution result
 */
export interface TaskResult {
  task_id: string;
  agent_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  result?: any;
  error?: string;
  started_at: Date;
  completed_at?: Date;
  execution_time_ms?: number;
}

/**
 * Agent message format
 */
export interface AgentMessage {
  from_agent: string;
  to_agent: string;
  task_id: string;
  action: string;
  payload: Record<string, any>;
  timestamp: Date;
}
