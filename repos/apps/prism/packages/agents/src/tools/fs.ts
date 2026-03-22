import fs from "node:fs/promises";
import path from "node:path";

export interface WriteOptions {
  mode?: number;
  append?: boolean;
}

export class WorkspaceFS {
  constructor(private rootDir: string = process.cwd()) {}

  private resolve(target: string): string {
    const resolved = path.resolve(this.rootDir, target);
    if (!resolved.startsWith(path.resolve(this.rootDir))) {
      throw new Error(`Refusing to escape workspace root: ${target}`);
    }
    return resolved;
  }

  async readFile(file: string): Promise<string> {
    const resolved = this.resolve(file);
    return fs.readFile(resolved, "utf8");
  }

  async writeFile(file: string, content: string, options: WriteOptions = {}): Promise<void> {
    const resolved = this.resolve(file);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    if (options.append) {
      await fs.appendFile(resolved, content, { mode: options.mode });
    } else {
      await fs.writeFile(resolved, content, { mode: options.mode });
    }
  }

  async list(dir = "."): Promise<string[]> {
    const resolved = this.resolve(dir);
    const entries = await fs.readdir(resolved, { withFileTypes: true });
    return entries.map((entry) => path.join(dir, entry.name));
  }

  async exists(target: string): Promise<boolean> {
    try {
      const resolved = this.resolve(target);
      await fs.access(resolved);
      return true;
    } catch {
      return false;
    }
  }

  async remove(target: string): Promise<void> {
    const resolved = this.resolve(target);
    await fs.rm(resolved, { recursive: true, force: true });
  }
}

export function createWorkspaceFS(rootDir?: string): WorkspaceFS {
  return new WorkspaceFS(rootDir);
}
