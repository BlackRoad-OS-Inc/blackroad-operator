import * as vscode from 'vscode';
import { BlackRoadAPI } from '../api';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  public static readonly viewType = 'blackroadDashboard';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _api: BlackRoadAPI;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, api: BlackRoadAPI) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel._panel.reveal(column);
      DashboardPanel.currentPanel._update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      DashboardPanel.viewType,
      'BlackRoad Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri, api);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, api: BlackRoadAPI) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._api = api;

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'refresh':
            this._update();
            break;
          case 'dispatchTask':
            vscode.commands.executeCommand('blackroad.dispatchTask');
            break;
          case 'registerAgent':
            vscode.commands.executeCommand('blackroad.registerAgent');
            break;
        }
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    DashboardPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    let agentStats = { total: 0, active: 0 };
    let taskStats = { total: 0, pending: 0, completed: 0 };
    let memoryStats = { total: 0 };

    try {
      if (this._api.isConnected()) {
        [agentStats, taskStats, memoryStats] = await Promise.all([
          this._api.getAgentStats(),
          this._api.getTaskStats(),
          this._api.getMemoryStats()
        ]);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }

    webview.html = this._getHtmlForWebview(webview, agentStats, taskStats, memoryStats);
  }

  private _getHtmlForWebview(
    webview: vscode.Webview,
    agentStats: { total: number; active?: number },
    taskStats: { total: number; pending?: number; completed?: number },
    memoryStats: { total: number }
  ) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BlackRoad Dashboard</title>
  <style>
    :root {
      --hot-pink: #FF1D6C;
      --amber: #F5A623;
      --electric-blue: #2979FF;
      --violet: #9C27B0;
    }

    body {
      font-family: var(--vscode-font-family);
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      padding: 20px;
      margin: 0;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      background: linear-gradient(135deg, var(--amber), var(--hot-pink), var(--violet), var(--electric-blue));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .refresh-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .refresh-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.7;
    }

    .stat-card .value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-card .sub {
      font-size: 12px;
      opacity: 0.6;
    }

    .stat-card.agents .value { color: var(--electric-blue); }
    .stat-card.tasks .value { color: var(--amber); }
    .stat-card.memory .value { color: var(--violet); }
    .stat-card.health .value { color: var(--hot-pink); }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: linear-gradient(135deg, var(--hot-pink), var(--violet));
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .action-btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .connection-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .connection-status .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${this._api.isConnected() ? '#4CAF50' : '#f44336'};
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BlackRoad Dashboard</h1>
    <div style="display: flex; align-items: center; gap: 20px;">
      <div class="connection-status">
        <span class="dot"></span>
        <span>${this._api.isConnected() ? 'Connected' : 'Disconnected'}</span>
      </div>
      <button class="refresh-btn" onclick="refresh()">Refresh</button>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card agents">
      <h3>Agents</h3>
      <div class="value">${agentStats.total}</div>
      <div class="sub">${agentStats.active || 0} active</div>
    </div>
    <div class="stat-card tasks">
      <h3>Tasks</h3>
      <div class="value">${taskStats.total}</div>
      <div class="sub">${taskStats.pending || 0} pending</div>
    </div>
    <div class="stat-card memory">
      <h3>Memory Entries</h3>
      <div class="value">${memoryStats.total}</div>
      <div class="sub">PS-SHA-infinity chain</div>
    </div>
    <div class="stat-card health">
      <h3>Status</h3>
      <div class="value">${this._api.isConnected() ? 'OK' : '--'}</div>
      <div class="sub">${this._api.isConnected() ? 'All systems operational' : 'Not connected'}</div>
    </div>
  </div>

  <div class="actions">
    <button class="action-btn" onclick="dispatchTask()">Dispatch Task</button>
    <button class="action-btn" onclick="registerAgent()">Register Agent</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function refresh() {
      vscode.postMessage({ command: 'refresh' });
    }

    function dispatchTask() {
      vscode.postMessage({ command: 'dispatchTask' });
    }

    function registerAgent() {
      vscode.postMessage({ command: 'registerAgent' });
    }
  </script>
</body>
</html>`;
  }
}
