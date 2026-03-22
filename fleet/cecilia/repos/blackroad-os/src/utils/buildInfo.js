import * as childProcess from "child_process";
export function readGitCommit() {
    try {
        return childProcess.execSync("git rev-parse HEAD", { stdio: "pipe" }).toString().trim();
    }
    catch {
        return undefined;
    }
}
export function getBuildInfo(gitReader = readGitCommit) {
    const version = process.env.APP_VERSION || "1.0.0";
    const commit = process.env.APP_COMMIT || gitReader() || "unknown";
    const buildTime = new Date().toISOString();
    return { version, commit, buildTime };
}
