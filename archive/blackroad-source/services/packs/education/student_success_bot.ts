export type LearnerEvent = {
  learnerId: string;
  type: "login" | "submission" | "score" | "attendance";
  value?: number;
  timestamp: string;
};

export type RiskProfile = {
  learnerId: string;
  riskLevel: "low" | "medium" | "high";
  signals: string[];
};

export type InterventionPlan = {
  learnerId: string;
  recommendations: string[];
};

function aggregateSignals(events: LearnerEvent[]): Record<string, LearnerEvent[]> {
  return events.reduce<Record<string, LearnerEvent[]>>((acc, event) => {
    acc[event.learnerId] = acc[event.learnerId] || [];
    acc[event.learnerId].push(event);
    return acc;
  }, {});
}

export function detectRiskSignals(events: LearnerEvent[]): RiskProfile[] {
  const grouped = aggregateSignals(events);
  return Object.entries(grouped).map(([learnerId, learnerEvents]) => {
    const signals: string[] = [];
    const lowScores = learnerEvents.filter((e) => e.type === "score" && (e.value ?? 0) < 70);
    const noRecentLogin = !learnerEvents.some((e) => e.type === "login");

    if (lowScores.length >= 2) {
        signals.push("multiple_low_scores");
    }
    if (noRecentLogin) {
        signals.push("missing_logins");
    }

    const riskLevel: RiskProfile["riskLevel"] = signals.length >= 2
      ? "high"
      : signals.length === 1
        ? "medium"
        : "low";

    return { learnerId, riskLevel, signals };
  });
}

export function suggestInterventions(profile: RiskProfile): InterventionPlan {
  const recommendations: string[] = [];

  if (profile.signals.includes("multiple_low_scores")) {
    recommendations.push("Schedule a tutoring session focused on weak areas.");
  }
  if (profile.signals.includes("missing_logins")) {
    recommendations.push("Send a re-engagement nudge with quick-start materials.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Celebrate progress and offer optional enrichment.");
  }

  return { learnerId: profile.learnerId, recommendations };
}
