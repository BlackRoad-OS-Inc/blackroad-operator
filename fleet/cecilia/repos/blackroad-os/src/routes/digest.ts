import { Router } from "express";
import type { Request, Response } from "express";
import {
  DigestVoiceRunner,
  createRunnerFromEnv,
  generateDigest,
  validateMetadata,
} from "../digest";
import type { PRMetadata, DigestRunnerConfig } from "../digest";

let runner: DigestVoiceRunner | null = null;

/**
 * Gets or creates the digest runner instance
 */
function getRunner(): DigestVoiceRunner {
  if (!runner) {
    runner = createRunnerFromEnv();
  }
  return runner;
}

/**
 * Creates the digest router with all digest-related endpoints
 */
export function createDigestRouter() {
  const digestRouter = Router();

  /**
   * POST /digest/generate
   *
   * Generates a text digest from PR metadata
   *
   * Request body: PRMetadata
   * Response: { digest: DigestContent }
   */
  digestRouter.post("/generate", (req: Request, res: Response) => {
    try {
      const metadata = req.body as PRMetadata;
      validateMetadata(metadata);

      const digest = generateDigest(metadata);
      res.json({ digest });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  });

  /**
   * POST /digest/run
   *
   * Runs the full digest pipeline (text + optional voice + optional Discord)
   *
   * Request body: PRMetadata
   * Response: DigestResult
   */
  digestRouter.post("/run", async (req: Request, res: Response) => {
    try {
      const metadata = req.body as PRMetadata;
      const digestRunner = getRunner();

      const result = await digestRunner.run(metadata);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  /**
   * GET /digest/config
   *
   * Returns the current runner configuration (without sensitive data)
   *
   * Response: Partial<DigestRunnerConfig>
   */
  digestRouter.get("/config", (_req: Request, res: Response) => {
    try {
      const digestRunner = getRunner();
      const config = digestRunner.getConfig();
      res.json(config);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: message });
    }
  });

  /**
   * POST /digest/config
   *
   * Updates the runner configuration
   *
   * Request body: Partial<DigestRunnerConfig>
   * Response: { success: true, config: ... }
   */
  digestRouter.post("/config", (req: Request, res: Response) => {
    try {
      const updates = req.body as Partial<DigestRunnerConfig>;
      const digestRunner = getRunner();

      digestRunner.updateConfig(updates);
      const config = digestRunner.getConfig();

      res.json({ success: true, config });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  });

  return digestRouter;
}
