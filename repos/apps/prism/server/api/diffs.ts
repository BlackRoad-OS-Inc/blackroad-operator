import { FastifyInstance } from "fastify";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { publishEvent } from "../events/bus";
import { applyUnifiedDiff } from "../../packages/agents/src/runners/coder";

const WORK_DIR = path.resolve(process.cwd(), "prism/work");

class PatchApplicationError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "PatchApplicationError";
  }
}

export async function diffRoutes(fastify: FastifyInstance) {
  fs.mkdirSync(WORK_DIR, { recursive: true });
  fastify.post("/diffs/apply", async (req, reply) => {
    const body = z
      .object({
        diffs: z.array(
          z.object({
            path: z.string(),
            hunks: z.array(z.string()),
          })
        ),
        selection: z.record(z.array(z.number())).optional(),
      })
      .parse(req.body);

    const results: Array<{
      path: string;
      applied: boolean;
      error?: string;
    }> = [];

    for (const diff of body.diffs) {
      const selected = body.selection?.[diff.path] ?? diff.hunks.map((_, i) => i);
      const selectedHunks = diff.hunks.filter((_, i) => selected.includes(i));
      const patch = selectedHunks.join("\n");
      const target = path.resolve(WORK_DIR, diff.path);

      // Ensure target is within WORK_DIR (security check)
      const relativeTarget = path.relative(WORK_DIR, target);
      if (
        relativeTarget.length === 0 ||
        relativeTarget.startsWith("..") ||
        path.isAbsolute(relativeTarget)
      ) {
        results.push({
          path: diff.path,
          applied: false,
          error: "Invalid path: attempted directory traversal",
        });
        continue;
      }

      try {
        // Read existing file content or use empty string for new files
        let currentContent = "";
        if (fs.existsSync(target)) {
          currentContent = fs.readFileSync(target, "utf-8");
        } else {
          // Ensure parent directory exists for new files
          fs.mkdirSync(path.dirname(target), { recursive: true });
        }

        // Apply the unified diff patch
        const newContent = applyUnifiedDiff(currentContent, patch);

        // Write the result
        fs.writeFileSync(target, newContent, "utf-8");

        await publishEvent(
          "actions.file.write",
          { path: diff.path },
          { actor: "kindest-coder" }
        );

        results.push({
          path: diff.path,
          applied: true,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          path: diff.path,
          applied: false,
          error: errorMessage,
        });
      }
      const lines = diff.hunks.filter((_, i) => selected.includes(i));

      const sanitizedPath = diff.path.replace(/\\/g, "/");
      const normalizedPath = path.posix.normalize(sanitizedPath);

      const isInvalidPath =
        path.posix.isAbsolute(normalizedPath) ||
        normalizedPath === "." ||
        normalizedPath === "" ||
        normalizedPath === ".." ||
        normalizedPath.startsWith("../") ||
        normalizedPath.includes("/../") ||
        normalizedPath.endsWith("/..");

      if (isInvalidPath) {
        throw fastify.httpErrors.badRequest("Invalid diff path");
      }

      const target = path.join(WORK_DIR, normalizedPath);
      const resolvedTarget = path.resolve(target);
      if (
        resolvedTarget !== WORK_DIR &&
        !resolvedTarget.startsWith(WORK_DIR + path.sep)
      ) {
        throw fastify.httpErrors.badRequest("Invalid diff path");
      }

      fs.mkdirSync(path.dirname(resolvedTarget), { recursive: true });
      fs.appendFileSync(resolvedTarget, lines.join("\n") + "\n");
      events.emit("file.write", { path: normalizedPath });
    }

    const appliedCount = results.filter((r) => r.applied).length;
    const failedCount = results.filter((r) => !r.applied).length;

    if (failedCount > 0) {
      reply.code(207); // Multi-Status
    }

    return {
      applied: appliedCount,
      failed: failedCount,
      results,
    };
  });
}

export default diffRoutes;
