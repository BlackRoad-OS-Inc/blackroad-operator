import * as vscode from 'vscode';
import { BlackRoadAPI, Task } from '../api';

export class TasksTreeProvider implements vscode.TreeDataProvider<TaskTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TaskTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private api: BlackRoadAPI) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TaskTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TaskTreeItem): Promise<TaskTreeItem[]> {
    if (!this.api.isConnected()) {
      return [];
    }

    if (!element) {
      // Root level - show status categories
      try {
        const tasks = await this.api.listTasks();
        const byStatus = new Map<string, Task[]>();

        // Initialize common statuses
        ['urgent', 'pending', 'in_progress', 'assigned', 'completed'].forEach(s => byStatus.set(s, []));

        tasks.forEach(task => {
          const status = task.priority === 'urgent' ? 'urgent' : task.status;
          if (!byStatus.has(status)) {
            byStatus.set(status, []);
          }
          byStatus.get(status)!.push(task);
        });

        return Array.from(byStatus.entries())
          .filter(([_, tasks]) => tasks.length > 0)
          .map(([status, tasks]) =>
            new TaskTreeItem(
              formatStatus(status),
              `${tasks.length} tasks`,
              vscode.TreeItemCollapsibleState.Collapsed,
              'status',
              undefined,
              tasks,
              status
            )
          );
      } catch (error) {
        console.error('Failed to load tasks:', error);
        return [];
      }
    } else if (element.contextValue === 'status' && element.tasks) {
      // Status level - show tasks
      return element.tasks.map(task =>
        new TaskTreeItem(
          task.title,
          `${task.priority} | ${task.division || 'No division'}`,
          vscode.TreeItemCollapsibleState.None,
          'task',
          task
        )
      );
    }

    return [];
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'urgent': return 'Urgent';
    case 'pending': return 'Pending';
    case 'in_progress': return 'In Progress';
    case 'assigned': return 'Assigned';
    case 'completed': return 'Completed';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export class TaskTreeItem extends vscode.TreeItem {
  public taskId?: string;
  public tasks?: Task[];

  constructor(
    label: string,
    description: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    contextValue: string,
    task?: Task,
    tasks?: Task[],
    status?: string
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.contextValue = contextValue;
    this.tasks = tasks;

    if (task) {
      this.taskId = task.id;
      this.tooltip = new vscode.MarkdownString(
        `**${task.title}**\n\n` +
        (task.description ? `${task.description}\n\n` : '') +
        `- ID: \`${task.id}\`\n` +
        `- Status: ${task.status}\n` +
        `- Priority: ${task.priority}\n` +
        `- Division: ${task.division || 'N/A'}\n` +
        `- Assigned: ${task.assigned_agent || 'Unassigned'}\n` +
        `- Created: ${task.created_at}`
      );

      // Set icon based on priority and status
      if (task.status === 'completed') {
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      } else if (task.priority === 'urgent') {
        this.iconPath = new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'));
      } else if (task.priority === 'high') {
        this.iconPath = new vscode.ThemeIcon('arrow-up', new vscode.ThemeColor('charts.orange'));
      } else {
        this.iconPath = new vscode.ThemeIcon('circle-outline');
      }
    } else {
      // Status folder
      switch (status) {
        case 'urgent':
          this.iconPath = new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'));
          break;
        case 'in_progress':
          this.iconPath = new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('charts.blue'));
          break;
        case 'completed':
          this.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('charts.green'));
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('folder');
      }
    }
  }
}
