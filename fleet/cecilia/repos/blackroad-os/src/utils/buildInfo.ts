import * as childProcess from "child_process";

export interface BuildInfo {
  version: string;
  commit: string;
  buildTime: string;
}

export function readGitCommit(): string | undefined {
  try {
    return childProcess.execSync("git rev-parse HEAD", { stdio: "pipe" }).toString().trim();
  } catch {
    return undefined;
  }
}

export function getBuildInfo(gitReader: () => string | undefined = readGitCommit): BuildInfo {
  const version = process.env.APP_VERSION || "1.0.0";
  const commit = process.env.APP_COMMIT || gitReader() || "unknown";
  const buildTime = new Date().toISOString();
  return { version, commit, buildTime };
}
