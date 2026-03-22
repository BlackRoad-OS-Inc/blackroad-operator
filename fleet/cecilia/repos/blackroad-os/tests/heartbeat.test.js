import { vi, describe, it, expect, beforeEach } from "vitest";
import cron from "node-cron";
import { startHeartbeatScheduler } from "../src/heartbeat";
vi.mock("node-cron", () => {
    return {
        default: {
            schedule: vi.fn((expression, callback) => ({ fireOnTick: callback, expression }))
        }
    };
});
describe("startHeartbeatScheduler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("schedules heartbeat every five minutes and enqueues payload", async () => {
        const add = vi.fn();
        const task = startHeartbeatScheduler({ add });
        expect(cron.schedule).toHaveBeenCalledWith("*/5 * * * *", expect.any(Function));
        // fire the cron callback
        task.fireOnTick();
        expect(add).toHaveBeenCalledWith("heartbeat", expect.objectContaining({ ts: expect.any(Number) }));
    });
});
