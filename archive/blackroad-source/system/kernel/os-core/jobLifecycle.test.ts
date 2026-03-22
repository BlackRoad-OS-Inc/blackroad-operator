import { completeJob, failJob, startJob } from "../src/jobs/jobLifecycle";
import type { Job } from "../src/jobs/jobTypes";

describe("jobLifecycle", () => {
  const baseJob: Job<{ task: string }> = {
    id: "pssha∞_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const,
    agentId: "pssha∞_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    type: "verification",
    status: "queued",
    input: { task: "demo" },
  };

  it("moves a job to running", () => {
    const now = "2024-01-01T00:01:00.000Z";
    const started = startJob(baseJob, now);
    expect(started.status).toBe("running");
    expect(started.updatedAt).toBe(now);
  });

  it("completes a job with output", () => {
    const now = "2024-01-01T00:02:00.000Z";
    const output = { ok: true };
    const completed = completeJob(baseJob, output, now);
    expect(completed.status).toBe("completed");
    expect(completed.output).toEqual(output);
    expect(completed.updatedAt).toBe(now);
  });

  it("fails a job with an error message", () => {
    const now = "2024-01-01T00:03:00.000Z";
    const failed = failJob(baseJob, "oops", now);
    expect(failed.status).toBe("failed");
    expect(failed.errorMessage).toBe("oops");
    expect(failed.updatedAt).toBe(now);
  });
});
