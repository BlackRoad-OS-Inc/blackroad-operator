import { describe, expect, it, vi } from "vitest";
import { registerSampleJobProcessor } from "../src/jobs/sample.job";
vi.mock("bullmq", () => {
    class MockWorker {
        constructor(_name, processor, _opts) {
            this.handlers = {};
            this.processor = processor;
        }
        on(event, handler) {
            this.handlers[event] = this.handlers[event] || [];
            this.handlers[event].push(handler);
        }
    }
    return { Worker: MockWorker };
});
describe("registerSampleJobProcessor", () => {
    it("registers worker and handlers", () => {
        const consoleLog = vi.spyOn(console, "log").mockImplementation(() => { });
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });
        const worker = registerSampleJobProcessor({ host: "localhost", port: 6379 });
        expect(worker.processor).toBeInstanceOf(Function);
        expect(worker.handlers.failed).toHaveLength(1);
        // simulate processing and failure
        worker.processor({ id: 1, data: { hello: "world" } });
        worker.handlers.failed[0]({ id: 1 }, new Error("boom"));
        expect(consoleLog).toHaveBeenCalledWith("Processing job 1");
        expect(consoleError).toHaveBeenCalled();
        consoleLog.mockRestore();
        consoleError.mockRestore();
    });
});
