/**
 * CodexAgentRunner
 * Agent Execution Runtime for Codex
 * 
 * Part of BlackRoad OS - https://blackroad.io
 */

import express from 'express';
import { EventEmitter } from 'events';

export class CodexAgentRunnerCore extends EventEmitter {
  private running = false;

  async start(): Promise<void> {
    this.running = true;
    this.emit('started');
    console.log('🖤 CodexAgentRunner started');
  }

  async stop(): Promise<void> {
    this.running = false;
    this.emit('stopped');
  }

  isRunning(): boolean {
    return this.running;
  }
}

const app = express();
const core = new CodexAgentRunnerCore();

app.get('/health', (req, res) => res.json({ 
  service: 'blackroad-os-codex-agent-runner',
  running: core.isRunning(),
  timestamp: new Date().toISOString()
}));

app.get('/start', async (req, res) => {
  await core.start();
  res.json({ status: 'started' });
});

app.get('/stop', async (req, res) => {
  await core.stop();
  res.json({ status: 'stopped' });
});

app.listen(3000, () => console.log('🖤 CodexAgentRunner on port 3000'));

export default core;
