import { Router } from "express";
import { getBuildInfo } from "../utils/buildInfo";
export function createMetaRouter() {
    const router = Router();
    router.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });
    router.get("/version", (_req, res) => {
        const info = getBuildInfo();
        res.json({ version: info.version, commit: info.commit });
    });
    return router;
}
