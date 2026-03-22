import { describe, expect, it, vi, afterEach } from "vitest";
import { getBuildInfo } from "../src/utils/buildInfo";
const originalEnv = { ...process.env };
afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
});
describe("getBuildInfo", () => {
    it("uses env vars when provided", () => {
        process.env.APP_VERSION = "3.0.0";
        process.env.APP_COMMIT = "xyz";
        const info = getBuildInfo();
        expect(info.version).toBe("3.0.0");
        expect(info.commit).toBe("xyz");
        expect(new Date(info.buildTime).toString()).not.toBe("Invalid Date");
    });
    it("falls back to git when env missing", () => {
        const gitReader = vi.fn().mockReturnValue("abcdef");
        delete process.env.APP_COMMIT;
        const info = getBuildInfo(gitReader);
        expect(info.commit).toBe("abcdef");
    });
});
