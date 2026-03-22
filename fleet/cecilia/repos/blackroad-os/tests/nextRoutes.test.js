import { describe, expect, it, vi } from "vitest";
import { GET as health } from "../app/api/health/route";
import { GET as version } from "../app/api/version/route";
vi.mock("../src/utils/buildInfo", () => ({
    getBuildInfo: () => ({ version: "api-version", commit: "api-commit", buildTime: "now" })
}));
describe("Next API routes", () => {
    it("returns health response", async () => {
        const res = await health();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ status: "ok" });
    });
    it("returns version response", async () => {
        const res = await version();
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ version: "api-version", commit: "api-commit" });
    });
});
