import { EventEmitter } from 'events';
import { GraphNode, GraphEdge } from '../types';

type ProjectNodes = Map<string, GraphNode>;
type ProjectEdges = Map<string, GraphEdge>;

export class GraphStore extends EventEmitter {
  private resources = new Map<string, ProjectNodes>();
  private links = new Map<string, ProjectEdges>();

  private getNodes(projectId: string) {
    if (!this.resources.has(projectId)) {
      this.resources.set(projectId, new Map());
    }
    return this.resources.get(projectId)!;
import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
import { GraphNode, GraphEdge } from '../types';

export class GraphStore extends EventEmitter {
  db: Database;
  constructor() {
    super();
    this.db = new Database(':memory:');
    this.init();
  }

  private getEdges(projectId: string) {
    if (!this.links.has(projectId)) {
      this.links.set(projectId, new Map());
    }
    return this.links.get(projectId)!;
  }

  upsertResource(projectId: string, id: string, kind: GraphNode['kind'], label: string, attrs: any) {
    const nodes = this.getNodes(projectId);
    nodes.set(id, { id, kind, label, attrs });
    this.emit('node', projectId, nodes.get(id));
  }

  upsertLink(projectId: string, id: string, fromId: string, toId: string, kind: GraphEdge['kind'], attrs: any) {
    const edges = this.getEdges(projectId);
    edges.set(id, { id, from: fromId, to: toId, kind, attrs });
    this.emit('edge', projectId, edges.get(id));
  upsertResource(projectId: string, id: string, kind: string, label: string, attrs: any) {
    const stmt = this.db.prepare(`INSERT INTO resources(id, projectId, kind, label, attrs, updatedAt)
      VALUES(@id,@projectId,@kind,@label,@attrs,@updatedAt)
      ON CONFLICT(id) DO UPDATE SET label=@label, attrs=@attrs, updatedAt=@updatedAt`);
    stmt.run({ id, projectId, kind, label, attrs: JSON.stringify(attrs || {}), updatedAt: new Date().toISOString() });
    this.emit('node', projectId, { id, kind, label, attrs });
  }
  upsertLink(projectId: string, id: string, fromId: string, toId: string, kind: string, attrs: any) {
    const stmt = this.db.prepare(`INSERT INTO links(id, projectId, fromId, toId, kind, attrs, updatedAt)
      VALUES(@id,@projectId,@fromId,@toId,@kind,@attrs,@updatedAt)
      ON CONFLICT(id) DO UPDATE SET attrs=@attrs, updatedAt=@updatedAt`);
    stmt.run({ id, projectId, fromId, toId, kind, attrs: JSON.stringify(attrs || {}), updatedAt: new Date().toISOString() });
    this.emit('edge', projectId, { id, from: fromId, to: toId, kind, attrs });
  }

  ingest(projectId: string, event: any) {
    if (event.type === 'run.start') {
      this.upsertResource(projectId, `process:${event.runId}`, 'process', event.runId, { cmd: event.cmd, cwd: event.cwd });
    } else if (event.type === 'run.end') {
      this.upsertResource(projectId, `process:${event.runId}`, 'process', event.runId, {
        status: event.status,
        exitCode: event.exitCode,
      });
    } else if (event.type === 'file.write') {
      this.upsertResource(projectId, `file:${event.path}`, 'file', event.path, {});
      const from = event.runId ? `process:${event.runId}` : 'process:unknown';
      this.upsertResource(projectId, from, 'process', from.split(':')[1] ?? 'unknown', {});
      this.upsertLink(projectId, `link:${from}->file:${event.path}`, from, `file:${event.path}`, 'writes', {});
    }
  }

  getGraph(projectId: string) {
    const nodes = Array.from(this.getNodes(projectId).values());
    const edges = Array.from(this.getEdges(projectId).values());
    return { nodes, edges };
  }

  rebuild(_projectId: string) {
    // no persistence layer, nothing to rebuild
  }
}

export const graphStore = new GraphStore();
