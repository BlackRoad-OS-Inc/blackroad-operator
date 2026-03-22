import { afterEach, describe, expect, it, vi } from "vitest";
import { getEnvironments, getEnvById, getHealth, getVersion } from "../lib/fetcher";
const originalEnv = { ...process.env };
afterEach(() => {
    process.env = { ...originalEnv };
});
describe("fetcher", () => {
    it("returns mock environments", async () => {
        const envs = await getEnvironments();
        expect(envs).toHaveLength(2);
        expect(envs[0]).toEqual(expect.objectContaining({ id: "env_1", name: "Development", region: "us-east-1" }));
    });
    it("returns environment by id", async () => {
        const env = await getEnvById("env_2");
        expect(env?.name).toBe("Staging");
        expect(await getEnvById("missing"))?.toBeUndefined();
    });
    it("returns health with uptime", async () => {
        vi.spyOn(process, "uptime").mockReturnValue(42);
        const health = await getHealth();
        expect(health).toEqual({ status: "ok", uptime: 42 });
    });
    it("returns version info", async () => {
        process.env.APP_VERSION = "2.0.0";
        process.env.APP_COMMIT = "abc123";
        const info = await getVersion();
        expect(info).toEqual({ version: "2.0.0", commit: "abc123" });
    });
});
