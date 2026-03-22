import * as vscode from 'vscode';
import { BlackRoadAPI, MemoryEntry } from '../api';

export class MemoryTreeProvider implements vscode.TreeDataProvider<MemoryTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<MemoryTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private api: BlackRoadAPI) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MemoryTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: MemoryTreeItem): Promise<MemoryTreeItem[]> {
    if (!this.api.isConnected()) {
      return [];
    }

    if (!element) {
      // Root level - show recent entries grouped by action
      try {
        const entries = await this.api.queryMemory({ limit: 100 });
        const byAction = new Map<string, MemoryEntry[]>();

        entries.forEach(entry => {
          if (!byAction.has(entry.action)) {
            byAction.set(entry.action, []);
          }
          byAction.get(entry.action)!.push(entry);
        });

        return Array.from(byAction.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .map(([action, entries]) =>
            new MemoryTreeItem(
              formatAction(action),
              `${entries.length} entries`,
              vscode.TreeItemCollapsibleState.Collapsed,
              'action',
              undefined,
              entries,
              action
            )
          );
      } catch (error) {
        console.error('Failed to load memory:', error);
        return [];
      }
    } else if (element.contextValue === 'action' && element.entries) {
      // Action level - show entries
      return element.entries.slice(0, 20).map(entry =>
        new MemoryTreeItem(
          entry.entity,
          entry.details?.substring(0, 50) || formatTimestamp(entry.timestamp),
          vscode.TreeItemCollapsibleState.None,
          'entry',
          entry
        )
      );
    }

    return [];
  }
}

function formatAction(action: string): string {
  const icons: Record<string, string> = {
    'deployed': 'Deployed',
    'created': 'Created',
    'updated': 'Updated',
    'fixed': 'Fixed',
    'configured': 'Configured',
    'milestone': 'Milestones',
    'til': 'TIL',
    'announce': 'Announcements',
    'progress': 'Progress',
    'blocked': 'Blocked'
  };
  return icons[action] || action.charAt(0).toUpperCase() + action.slice(1);
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export class MemoryTreeItem extends vscode.TreeItem {
  public entryHash?: string;
  public entries?: MemoryEntry[];

  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    contextValue: string,
    entry?: MemoryEntry,
    entries?: MemoryEntry[],
    action?: string
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.contextValue = contextValue;
    this.entries = entries;

    if (entry) {
      this.entryHash = entry.hash;
      this.tooltip = new vscode.MarkdownString(
        `**${entry.entity}**\n\n` +
        (entry.details ? `${entry.details}\n\n` : '') +
        `- Hash: \`${entry.hash.substring(0, 16)}...\`\n` +
        `- Action: ${entry.action}\n` +
        `- Time: ${entry.timestamp}\n` +
        (entry.tags ? `- Tags: ${entry.tags.join(', ')}` : '')
      );

      // Set icon based on action
      switch (entry.action) {
        case 'deployed':
          this.iconPath = new vscode.ThemeIcon('rocket', new vscode.ThemeColor('charts.green'));
          break;
        case 'created':
          this.iconPath = new vscode.ThemeIcon('add', new vscode.ThemeColor('charts.blue'));
          break;
        case 'fixed':
          this.iconPath = new vscode.ThemeIcon('wrench', new vscode.ThemeColor('charts.orange'));
          break;
        case 'til':
          this.iconPath = new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor('charts.yellow'));
          break;
        case 'milestone':
          this.iconPath = new vscode.ThemeIcon('star-full', new vscode.ThemeColor('charts.purple'));
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('history');
      }
    } else {
      // Action folder
      switch (action) {
        case 'deployed':
          this.iconPath = new vscode.ThemeIcon('rocket');
          break;
        case 'created':
          this.iconPath = new vscode.ThemeIcon('add');
          break;
        case 'fixed':
          this.iconPath = new vscode.ThemeIcon('wrench');
          break;
        case 'til':
          this.iconPath = new vscode.ThemeIcon('lightbulb');
          break;
        case 'milestone':
          this.iconPath = new vscode.ThemeIcon('star-full');
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('folder');
      }
    }
  }
}
