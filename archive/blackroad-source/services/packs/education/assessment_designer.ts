export type Objective = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  objectiveId: string;
  stem: string;
  type: "multiple_choice" | "short_answer" | "project";
};

export type RubricLevel = {
  level: string;
  descriptor: string;
};

export type Rubric = {
  objectiveId: string;
  levels: RubricLevel[];
};

const DEFAULT_LEVELS: RubricLevel[] = [
  { level: "exceeds", descriptor: "Exceeds the stated objective with depth and clarity." },
  { level: "meets", descriptor: "Fully meets the objective with minor feedback." },
  { level: "approaches", descriptor: "Partially meets the objective; needs reinforcement." },
  { level: "does_not_meet", descriptor: "Does not meet the objective; significant gaps remain." },
];

export function generateQuestionBank(objectives: Objective[]): Question[] {
  return objectives.map((objective, index) => ({
    id: `q-${index + 1}`,
    objectiveId: objective.id,
    stem: `How would you demonstrate competency for: ${objective.text}?`,
    type: index % 2 === 0 ? "short_answer" : "multiple_choice",
  }));
}

export function generateRubric(objective: Objective): Rubric {
  return {
    objectiveId: objective.id,
    levels: DEFAULT_LEVELS.map((level) => ({
      ...level,
      descriptor: `${level.descriptor} (Objective: ${objective.text})`,
    })),
  };
}
