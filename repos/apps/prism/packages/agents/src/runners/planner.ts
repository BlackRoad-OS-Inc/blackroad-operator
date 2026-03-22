import { PrismDiff, summarizeDiffs } from "../../../prism-core/src/diffs";

export type PlanStep = {
  id: string;
  summary: string;
  files: string[];
  status: "pending" | "ready" | "running" | "done";
};

export interface PlanSynopsis {
  steps: PlanStep[];
  totalFiles: number;
  totalChanges: number;
}

export function buildPlanFromDiffs(diffs: PrismDiff[]): PlanSynopsis {
  if (diffs.length === 0) {
    return { steps: [], totalFiles: 0, totalChanges: 0 };
  }
  const summary = summarizeDiffs(diffs);
  const steps: PlanStep[] = diffs.map((diff, index) => ({
    id: `step-${index + 1}`,
    summary: `Update ${diff.path}`,
    files: [diff.path],
    status: "pending",
  }));
  return {
    steps,
    totalFiles: summary.files,
    totalChanges: summary.changes,
  };
}

export function markStepStatus(plan: PlanSynopsis, stepId: string, status: PlanStep["status"]): PlanSynopsis {
  const steps = plan.steps.map((step) => (step.id === stepId ? { ...step, status } : step));
  return { ...plan, steps };
}
