import { spawn } from "node:child_process";

export interface RunCommandOptions {
  cwd?: string;
  env?: Record<string, string>;
  input?: string;
  timeoutMs?: number;
  shell?: boolean;
}

export interface RunCommandResult {
  stdout: string;
  stderr: string;
  code: number;
  durationMs: number;
}

export class ShellError extends Error {
  constructor(message: string, public readonly result: RunCommandResult) {
    super(message);
    this.name = "ShellError";
  }
}

export async function runCommand(
  command: string,
  args: string[] = [],
  options: RunCommandOptions = {}
): Promise<RunCommandResult> {
  const start = Date.now();
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env ? { ...process.env, ...options.env } : process.env,
    shell: options.shell ?? false,
    stdio: ["pipe", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  if (options.input) {
    child.stdin.write(options.input);
  }
  child.stdin.end();

  const exitCode: number = await new Promise((resolve, reject) => {
    const timeout = options.timeoutMs
      ? setTimeout(() => {
          child.kill("SIGKILL");
          reject(new ShellError(`Command timed out after ${options.timeoutMs}ms`, {
            stdout,
            stderr,
            code: -1,
            durationMs: Date.now() - start,
          }));
        }, options.timeoutMs)
      : null;

    child.on("error", reject);
    child.on("close", (code) => {
      if (timeout) clearTimeout(timeout);
      resolve(code ?? 0);
    });
  });

  const result: RunCommandResult = {
    stdout,
    stderr,
    code: exitCode,
    durationMs: Date.now() - start,
  };

  if (exitCode !== 0) {
    throw new ShellError(`Command failed: ${command} ${args.join(" ")}`.trim(), result);
  }

  return result;
}
