import { describe, expect, it } from "vitest";
import { generateQuestionBank, generateRubric, Objective } from "../agents/assessment_designer";

describe("assessment designer", () => {
  const objectives: Objective[] = [
    { id: "obj-1", text: "Explain key concepts" },
    { id: "obj-2", text: "Apply knowledge" },
  ];

  it("creates a non-empty question bank aligned to objectives", () => {
    const questions = generateQuestionBank(objectives);
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((question) => {
      expect(question.objectiveId).toBeDefined();
      expect(objectives.map((o) => o.id)).toContain(question.objectiveId);
    });
  });

  it("creates rubric levels per objective", () => {
    const rubric = generateRubric(objectives[0]);
    expect(rubric.objectiveId).toBe(objectives[0].id);
    expect(rubric.levels.length).toBeGreaterThan(0);
  });
});
