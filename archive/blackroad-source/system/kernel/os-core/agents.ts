import { Router } from "express";
import { prisma } from "../db/prisma";

const router = Router();

/**
 * GET /agents
 * Returns list of agents ordered by createdAt desc
 */
router.get("/agents", async (_req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ agents });
  } catch (err) {
    console.error("[core] GET /agents error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /agents
 * Body: { name: string, status?: string }
 */
router.post("/agents", async (req, res) => {
  try {
    const { name, status } = req.body ?? {};

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name_required" });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        status: typeof status === "string" ? status : "active"
      }
    });

    res.status(201).json({ agent });
  } catch (err) {
    console.error("[core] POST /agents error", err);
    res.status(500).json({ error: "internal_error" });
  }
});

export default router;
