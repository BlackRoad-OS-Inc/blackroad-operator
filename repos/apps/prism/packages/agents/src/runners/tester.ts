import { runCommand, RunCommandOptions, ShellError } from "../tools/shell";

export interface TestCommand extends RunCommandOptions {
  command: string;
  args?: string[];
  label?: string;
}

export interface TestResult {
  label: string;
  success: boolean;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export async function runTestMatrix(commands: TestCommand[]): Promise<TestResult[]> {
  const results: TestResult[] = [];
  for (const cmd of commands) {
    const label = cmd.label ?? `${cmd.command} ${(cmd.args ?? []).join(" ")}`.trim();
    try {
      const result = await runCommand(cmd.command, cmd.args ?? [], cmd);
      results.push({ label, success: true, stdout: result.stdout, stderr: result.stderr, durationMs: result.durationMs });
    } catch (error) {
      if (error instanceof ShellError) {
        results.push({
          label,
          success: false,
          stdout: error.result.stdout,
          stderr: error.result.stderr,
          durationMs: error.result.durationMs,
        });
      } else {
        throw error;
      }
    }
  }
  return results;
}
