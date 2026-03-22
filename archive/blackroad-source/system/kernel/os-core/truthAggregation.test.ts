import { aggregateTruthState } from "../src/truth/truthAggregation";
import type { AgentAssessment } from "../src/truth/truthState";

describe("aggregateTruthState", () => {
  const baseIds = {
    truthId: "pssha∞_0000000000000000000000000000000000000000000000000000000000000001" as const,
    snapshotId: "pssha∞_0000000000000000000000000000000000000000000000000000000000000002" as const,
    jobId: "pssha∞_0000000000000000000000000000000000000000000000000000000000000003" as const,
  };

  const assessment = (overrides: Partial<AgentAssessment> = {}): AgentAssessment => ({
    id: "pssha∞_a" as const,
    jobId: baseIds.jobId,
    agentId: "pssha∞_b" as const,
    createdAt: "2024-01-01T00:00:00.000Z",
    verdict: "true",
    confidence: 0.5,
    ...overrides,
  });

  it("weights majority verdicts by confidence", () => {
    const assessments: AgentAssessment[] = [
      assessment({ verdict: "true", confidence: 0.9 }),
      assessment({ verdict: "true", confidence: 0.6 }),
      assessment({ verdict: "false", confidence: 0.2 }),
    ];

    const state = aggregateTruthState({
      ...baseIds,
      assessments,
      updatedAt: "2024-01-02T00:00:00.000Z",
    });

    expect(state.aggregatedVerdict).toBe("true");
    expect(state.aggregatedConfidence).toBeCloseTo(1.5 / 1.7, 4);
    expect(state.minorityReports?.length).toBe(1);
  });

  it("flags contradictory outcomes when signals are too close", () => {
    const assessments: AgentAssessment[] = [
      assessment({ verdict: "true", confidence: 0.5 }),
      assessment({ verdict: "false", confidence: 0.45 }),
      assessment({ verdict: "unknown", confidence: 0.05 }),
    ];

    const state = aggregateTruthState({
      ...baseIds,
      assessments,
      updatedAt: "2024-01-02T00:00:00.000Z",
    });

    expect(state.aggregatedVerdict).toBe("contradictory");
    expect(state.aggregatedConfidence).toBe(0);
    expect(state.minorityReports?.length).toBe(3);
  });

  it("falls back to unknown when confidence is zero", () => {
    const assessments: AgentAssessment[] = [
      assessment({ verdict: "true", confidence: 0 }),
      assessment({ verdict: "false", confidence: -0.1 }),
    ];

    const state = aggregateTruthState({
      ...baseIds,
      assessments,
      updatedAt: "2024-01-02T00:00:00.000Z",
    });

    expect(state.aggregatedVerdict).toBe("unknown");
    expect(state.aggregatedConfidence).toBe(0);
    expect(state.minorityReports).toBeUndefined();
  });
});
