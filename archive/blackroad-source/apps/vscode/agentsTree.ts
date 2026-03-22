import * as vscode from 'vscode';
import { BlackRoadAPI, Agent } from '../api';

export class AgentsTreeProvider implements vscode.TreeDataProvider<AgentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private api: BlackRoadAPI) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AgentTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AgentTreeItem): Promise<AgentTreeItem[]> {
    if (!this.api.isConnected()) {
      return [];
    }

    if (!element) {
      // Root level - show divisions
      try {
        const agents = await this.api.listAgents();
        const divisions = new Map<string, Agent[]>();

        agents.forEach(agent => {
          const div = agent.division || 'Unassigned';
          if (!divisions.has(div)) {
            divisions.set(div, []);
          }
          divisions.get(div)!.push(agent);
        });

        return Array.from(divisions.entries()).map(([division, agents]) =>
          new AgentTreeItem(
            division,
            `${agents.length} agents`,
            vscode.TreeItemCollapsibleState.Collapsed,
            'division',
            undefined,
            agents
          )
        );
      } catch (error) {
        console.error('Failed to load agents:', error);
        return [];
      }
    } else if (element.contextValue === 'division' && element.agents) {
      // Division level - show agents
      return element.agents.map(agent =>
        new AgentTreeItem(
          agent.name,
          `${agent.type} | Level ${agent.level} | ${agent.status}`,
          vscode.TreeItemCollapsibleState.None,
          'agent',
          agent
        )
      );
    }

    return [];
  }
}

export class AgentTreeItem extends vscode.TreeItem {
  public agentId?: string;
  public agents?: Agent[];

  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    contextValue: string,
    agent?: Agent,
    agents?: Agent[]
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.contextValue = contextValue;
    this.agents = agents;

    if (agent) {
      this.agentId = agent.id;
      this.tooltip = new vscode.MarkdownString(
        `**${agent.name}**\n\n` +
        `- ID: \`${agent.id}\`\n` +
        `- Type: ${agent.type}\n` +
        `- Level: ${agent.level}\n` +
        `- Status: ${agent.status}\n` +
        `- Load: ${agent.load ? `${(agent.load * 100).toFixed(0)}%` : 'N/A'}\n` +
        `- Created: ${agent.created_at}`
      );

      // Set icon based on status
      switch (agent.status) {
        case 'active':
        case 'online':
          this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
          break;
        case 'busy':
          this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
          break;
        case 'offline':
        case 'inactive':
          this.iconPath = new vscode.ThemeIcon('circle-outline');
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('robot');
      }
    } else {
      this.iconPath = new vscode.ThemeIcon('folder');
    }
  }
}
