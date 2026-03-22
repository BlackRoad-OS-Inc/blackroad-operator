import * as vscode from 'vscode';
import { BlackRoadAPI } from './api';
import { AgentsTreeProvider } from './providers/agentsTree';
import { TasksTreeProvider } from './providers/tasksTree';
import { MemoryTreeProvider } from './providers/memoryTree';
import { DashboardPanel } from './providers/dashboard';

let api: BlackRoadAPI;
let statusBarItem: vscode.StatusBarItem;
let agentsProvider: AgentsTreeProvider;
let tasksProvider: TasksTreeProvider;
let memoryProvider: MemoryTreeProvider;
let refreshInterval: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('BlackRoad extension activating...');

  // Initialize API
  api = new BlackRoadAPI();

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'blackroad.openDashboard';
  updateStatusBar(false);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Create tree view providers
  agentsProvider = new AgentsTreeProvider(api);
  tasksProvider = new TasksTreeProvider(api);
  memoryProvider = new MemoryTreeProvider(api);

  // Register tree views
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('blackroad.agents', agentsProvider),
    vscode.window.registerTreeDataProvider('blackroad.tasks', tasksProvider),
    vscode.window.registerTreeDataProvider('blackroad.memory', memoryProvider)
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('blackroad.connect', connect),
    vscode.commands.registerCommand('blackroad.disconnect', disconnect),
    vscode.commands.registerCommand('blackroad.refresh', refresh),
    vscode.commands.registerCommand('blackroad.openDashboard', () => DashboardPanel.createOrShow(context.extensionUri, api)),
    vscode.commands.registerCommand('blackroad.deploy', deployProject),
    vscode.commands.registerCommand('blackroad.viewLogs', viewLogs),
    vscode.commands.registerCommand('blackroad.dispatchTask', dispatchTask),
    vscode.commands.registerCommand('blackroad.registerAgent', registerAgent),
    vscode.commands.registerCommand('blackroad.logMemory', logMemory),
    vscode.commands.registerCommand('blackroad.searchMemory', searchMemory),
    vscode.commands.registerCommand('blackroad.agents.refresh', () => agentsProvider.refresh()),
    vscode.commands.registerCommand('blackroad.tasks.refresh', () => tasksProvider.refresh()),
    vscode.commands.registerCommand('blackroad.memory.refresh', () => memoryProvider.refresh()),
    vscode.commands.registerCommand('blackroad.agent.heartbeat', sendHeartbeat),
    vscode.commands.registerCommand('blackroad.task.complete', completeTask),
    vscode.commands.registerCommand('blackroad.task.assign', assignTask)
  );

  // Auto-connect if configured
  const config = vscode.workspace.getConfiguration('blackroad');
  if (config.get('autoConnect') && config.get('apiKey')) {
    connect();
  }
}

export function deactivate() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
}

function updateStatusBar(connected: boolean, info?: string) {
  if (connected) {
    statusBarItem.text = `$(check) BlackRoad${info ? `: ${info}` : ''}`;
    statusBarItem.tooltip = 'Connected to BlackRoad API - Click to open dashboard';
    statusBarItem.backgroundColor = undefined;
  } else {
    statusBarItem.text = '$(circle-slash) BlackRoad';
    statusBarItem.tooltip = 'Not connected - Click to connect';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  }
}

async function connect() {
  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Connecting to BlackRoad...',
      cancellable: false
    }, async () => {
      const success = await api.connect();
      if (success) {
        const health = await api.health();
        updateStatusBar(true, `v${health.version}`);
        refresh();
        setupAutoRefresh();
        vscode.window.showInformationMessage('Connected to BlackRoad!');
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to connect: ${error}`);
    updateStatusBar(false);
  }
}

function disconnect() {
  api.disconnect();
  updateStatusBar(false);
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
  vscode.window.showInformationMessage('Disconnected from BlackRoad');
}

function refresh() {
  agentsProvider.refresh();
  tasksProvider.refresh();
  memoryProvider.refresh();
}

function setupAutoRefresh() {
  const config = vscode.workspace.getConfiguration('blackroad');
  const interval = config.get<number>('refreshInterval') || 30;

  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (interval > 0) {
    refreshInterval = setInterval(refresh, interval * 1000);
  }
}

async function deployProject() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showWarningMessage('No workspace folder open');
    return;
  }

  const projectName = await vscode.window.showInputBox({
    prompt: 'Enter project name for deployment',
    value: workspaceFolders[0].name
  });

  if (projectName) {
    try {
      const task = await api.dispatchTask(`Deploy ${projectName}`, {
        description: `Deploy project ${projectName} to production`,
        priority: 'high',
        division: 'OS'
      });
      vscode.window.showInformationMessage(`Deployment task created: ${task.id}`);
      tasksProvider.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Deployment failed: ${error}`);
    }
  }
}

async function viewLogs() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const entries = await api.queryMemory({ limit: 100 });

  const doc = await vscode.workspace.openTextDocument({
    content: entries.map(e => `[${e.timestamp}] ${e.action} - ${e.entity}: ${e.details || ''}`).join('\n'),
    language: 'log'
  });

  await vscode.window.showTextDocument(doc);
}

async function dispatchTask() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const title = await vscode.window.showInputBox({
    prompt: 'Task title',
    placeHolder: 'e.g., Deploy authentication service'
  });

  if (!title) return;

  const priority = await vscode.window.showQuickPick(
    ['low', 'medium', 'high', 'urgent'],
    { placeHolder: 'Select priority' }
  );

  const division = await vscode.window.showQuickPick(
    ['OS', 'AI', 'Cloud', 'Security', 'Media', 'Foundation', 'Labs'],
    { placeHolder: 'Select division (optional)' }
  );

  try {
    const task = await api.dispatchTask(title, { priority, division });
    vscode.window.showInformationMessage(`Task dispatched: ${task.id}`);
    tasksProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to dispatch task: ${error}`);
  }
}

async function registerAgent() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Agent name',
    placeHolder: 'e.g., my-vscode-agent'
  });

  if (!name) return;

  const type = await vscode.window.showQuickPick(
    ['ai', 'human', 'bot', 'service'],
    { placeHolder: 'Select agent type' }
  );

  try {
    const agent = await api.registerAgent(name, type || 'ai');
    vscode.window.showInformationMessage(`Agent registered: ${agent.id}`);
    agentsProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to register agent: ${error}`);
  }
}

async function logMemory() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const action = await vscode.window.showQuickPick(
    ['deployed', 'created', 'updated', 'fixed', 'configured', 'milestone', 'til'],
    { placeHolder: 'Select action type' }
  );

  if (!action) return;

  const entity = await vscode.window.showInputBox({
    prompt: 'Entity name',
    placeHolder: 'e.g., auth-service'
  });

  if (!entity) return;

  const details = await vscode.window.showInputBox({
    prompt: 'Details (optional)',
    placeHolder: 'e.g., Deployed v2.0.0 to production'
  });

  try {
    const entry = await api.logMemory(action, entity, details);
    vscode.window.showInformationMessage(`Logged to memory: ${entry.hash.substring(0, 8)}...`);
    memoryProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to log: ${error}`);
  }
}

async function searchMemory() {
  if (!api.isConnected()) {
    vscode.window.showWarningMessage('Please connect to BlackRoad first');
    return;
  }

  const query = await vscode.window.showInputBox({
    prompt: 'Search memory',
    placeHolder: 'e.g., deployment'
  });

  if (query) {
    const entries = await api.queryMemory({ search: query });

    if (entries.length === 0) {
      vscode.window.showInformationMessage('No matching entries found');
      return;
    }

    const items = entries.map(e => ({
      label: `${e.action}: ${e.entity}`,
      description: e.details,
      detail: `${e.timestamp} | ${e.hash.substring(0, 8)}...`
    }));

    await vscode.window.showQuickPick(items, {
      placeHolder: `Found ${entries.length} entries`
    });
  }
}

async function sendHeartbeat(item: { agentId: string }) {
  try {
    await api.sendHeartbeat(item.agentId);
    vscode.window.showInformationMessage('Heartbeat sent!');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to send heartbeat: ${error}`);
  }
}

async function completeTask(item: { taskId: string }) {
  const result = await vscode.window.showInputBox({
    prompt: 'Completion result (optional)',
    placeHolder: 'e.g., Successfully deployed to production'
  });

  try {
    await api.completeTask(item.taskId, result);
    vscode.window.showInformationMessage('Task completed!');
    tasksProvider.refresh();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to complete task: ${error}`);
  }
}

async function assignTask(item: { taskId: string }) {
  const agents = await api.listAgents();

  const selected = await vscode.window.showQuickPick(
    agents.map(a => ({ label: a.name, description: `${a.type} | Level ${a.level}`, agentId: a.id })),
    { placeHolder: 'Select agent to assign' }
  );

  if (selected) {
    try {
      await api.assignTask(item.taskId, selected.agentId);
      vscode.window.showInformationMessage(`Task assigned to ${selected.label}`);
      tasksProvider.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to assign task: ${error}`);
    }
  }
}
