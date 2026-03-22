import { describe, expect, it } from "vitest";
import { detectRiskSignals, suggestInterventions, LearnerEvent } from "../agents/student_success_bot";

describe("student success bot", () => {
  const events: LearnerEvent[] = [
    { learnerId: "learner-1", type: "score", value: 60, timestamp: "2024-01-01T00:00:00Z" },
    { learnerId: "learner-1", type: "score", value: 58, timestamp: "2024-01-02T00:00:00Z" },
    { learnerId: "learner-2", type: "login", timestamp: "2024-01-03T00:00:00Z" },
  ];

  it("flags at-risk learners based on signals", () => {
    const profiles = detectRiskSignals(events);
    const riskProfile = profiles.find((p) => p.learnerId === "learner-1");
    expect(riskProfile).toBeDefined();
    expect(riskProfile?.riskLevel).toBe("high");
    expect(riskProfile?.signals).toContain("multiple_low_scores");
  });

  it("suggests interventions for detected signals", () => {
    const [profile] = detectRiskSignals(events);
    const plan = suggestInterventions(profile);
    expect(plan.recommendations.length).toBeGreaterThan(0);
  });
});
