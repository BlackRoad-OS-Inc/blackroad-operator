import type { PsShaInfinity } from "../identity/identityTypes";
import type { AgentAssessment, TruthState, TruthValue } from "./truthState";

export interface TruthAggregationInput {
  truthId: PsShaInfinity;
  snapshotId: PsShaInfinity;
  jobId: PsShaInfinity;
  assessments: AgentAssessment[];
  updatedAt: string;
  ledgerTxId?: string;
  contradictionMargin?: number;
}

type VerdictTotals = Record<TruthValue, number>;

const defaultMargins = {
  contradiction: 0.1,
};

function initializeTotals(): VerdictTotals {
  return {
    true: 0,
    false: 0,
    unknown: 0,
    contradictory: 0,
  };
}

function summarizeAssessments(assessments: AgentAssessment[]): VerdictTotals {
  return assessments.reduce<VerdictTotals>((totals, assessment) => {
    const boundedConfidence = Math.max(0, assessment.confidence);
    totals[assessment.verdict] += boundedConfidence;
    return totals;
  }, initializeTotals());
}

function selectLeaders(totals: VerdictTotals): [TruthValue, number, TruthValue, number] {
  const ordered = (Object.entries(totals) as [TruthValue, number][]) // preserve typing
    .sort(([, a], [, b]) => b - a);

  const [winnerVerdict, winnerScore] = ordered[0] ?? ["unknown", 0];
  const [runnerVerdict, runnerScore] = ordered[1] ?? ["unknown", 0];

  return [winnerVerdict, winnerScore, runnerVerdict, runnerScore];
}

export function aggregateTruthState(input: TruthAggregationInput): TruthState {
  const totals = summarizeAssessments(input.assessments);
  const totalConfidence = Object.values(totals).reduce((acc, value) => acc + value, 0);

  const [winnerVerdict, winnerScore, runnerVerdict, runnerScore] = selectLeaders(totals);
  const contradictionMargin =
    input.contradictionMargin ?? defaultMargins.contradiction * totalConfidence;

  const hasContradiction =
    totalConfidence > 0 &&
    winnerVerdict !== "unknown" &&
    runnerScore > 0 &&
    winnerScore - runnerScore <= contradictionMargin;

  const aggregatedVerdict: TruthValue = totalConfidence === 0
    ? "unknown"
    : hasContradiction
      ? "contradictory"
      : winnerVerdict;

  const aggregatedConfidence =
    totalConfidence === 0 || aggregatedVerdict === "contradictory"
      ? 0
      : Number((winnerScore / totalConfidence).toFixed(4));

  const minorityReports = aggregatedVerdict === "contradictory"
    ? input.assessments
    : aggregatedVerdict === "unknown"
      ? []
      : input.assessments.filter((assessment) => assessment.verdict !== aggregatedVerdict);

  return {
    id: input.truthId,
    snapshotId: input.snapshotId,
    jobId: input.jobId,
    aggregatedVerdict,
    aggregatedConfidence,
    minorityReports: minorityReports.length ? minorityReports : undefined,
    ledgerTxId: input.ledgerTxId,
    updatedAt: input.updatedAt,
  };
}
