export type Weights = {
  business: number;
  data: number;
  technical: number;
  organizational: number;
};

export type Scores = {
  // Business Value
  financialImpact: number;
  operationalEfficiency: number;
  customerBrandValue: number;
  // Data Readiness
  dataAvailability: boolean;
  qualityAccessibility: number;
  integrationFeasibility: number;
  // Technical Feasibility
  modelPerformance: number;
  scalability: number;
  finOps: number;
  // Organizational & Governance
  userReadiness: number;
  leadershipSupport: number;
  governanceGate: boolean;
  humanOversight: number;
};

export type Assessment = {
  initiativeName: string;
  weights: Weights;
  scores: Scores;
  createdAt: string;
};

export const DEFAULT_WEIGHTS: Weights = {
  business: 25,
  data: 25,
  technical: 25,
  organizational: 25,
};

export const DEFAULT_SCORES: Scores = {
  financialImpact: 3,
  operationalEfficiency: 3,
  customerBrandValue: 3,
  dataAvailability: true,
  qualityAccessibility: 3,
  integrationFeasibility: 3,
  modelPerformance: 3,
  scalability: 3,
  finOps: 3,
  userReadiness: 3,
  leadershipSupport: 3,
  governanceGate: true,
  humanOversight: 3,
};

export const DIMENSION_LABELS: Record<keyof Weights, string> = {
  business: "Business Value",
  data: "Data Readiness",
  technical: "Technical Feasibility",
  organizational: "Organizational & Governance",
};

export const SCALE_LABELS: Record<string, string> = {
  financialImpact: "Financial Impact",
  operationalEfficiency: "Operational Efficiency",
  customerBrandValue: "Customer & Brand Value",
  qualityAccessibility: "Quality & Accessibility",
  integrationFeasibility: "Integration Feasibility",
  modelPerformance: "Model Performance & Uptime",
  scalability: "Scalability & Interoperability",
  finOps: "Cloud FinOps & Total Cost of Ownership",
  userReadiness: "User Readiness & Change Capability",
  leadershipSupport: "Leadership & Vendor Support",
  humanOversight: "Human-in-the-Loop Oversight",
};

const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

export type Gate = { level: "hard" | "soft"; title: string; detail: string };

export type Result = {
  dimensionAverages: Record<keyof Weights, number>;
  compositeScore: number;
  status: "top" | "conditional" | "watch" | "rejected";
  statusLabel: string;
  gates: Gate[];
};

export function evaluate(assessment: Assessment): Result {
  const { scores, weights } = assessment;

  const dimensionAverages: Record<keyof Weights, number> = {
    business: avg([
      scores.financialImpact,
      scores.operationalEfficiency,
      scores.customerBrandValue,
    ]),
    data: avg([scores.qualityAccessibility, scores.integrationFeasibility]),
    technical: avg([scores.modelPerformance, scores.scalability, scores.finOps]),
    organizational: avg([
      scores.userReadiness,
      scores.leadershipSupport,
      scores.humanOversight,
    ]),
  };

  const compositeScore =
    (dimensionAverages.business * weights.business +
      dimensionAverages.data * weights.data +
      dimensionAverages.technical * weights.technical +
      dimensionAverages.organizational * weights.organizational) /
    100;

  const gates: Gate[] = [];

  if (!scores.dataAvailability) {
    gates.push({
      level: "hard",
      title: "Hard Gate — Data Availability",
      detail:
        "Required data is not available. The initiative cannot proceed until data sourcing is resolved.",
    });
  }
  if (!scores.governanceGate) {
    gates.push({
      level: "hard",
      title: "Hard Gate — Governance, Privacy & Legal",
      detail:
        "The initiative does not clear governance, privacy or legal review. Escalate to the compliance board.",
    });
  }

  const softChecks: Array<[keyof Scores, string]> = [
    ["qualityAccessibility", "Data Prep Warning"],
    ["financialImpact", "Weak Business Case"],
    ["operationalEfficiency", "Limited Efficiency Gain"],
    ["customerBrandValue", "Low Customer Impact"],
    ["integrationFeasibility", "Integration Risk"],
    ["modelPerformance", "Model Reliability Risk"],
    ["scalability", "Scalability Constraint"],
    ["finOps", "Cost Exposure Risk"],
    ["userReadiness", "Change Management Risk"],
    ["leadershipSupport", "Sponsorship Risk"],
    ["humanOversight", "Oversight Gap"],
  ];

  for (const [key, label] of softChecks) {
    const value = scores[key] as number;
    if (value <= 2) {
      gates.push({
        level: "soft",
        title: `Soft Gate — ${label}`,
        detail: `${SCALE_LABELS[key]} scored ${value}/5. Mitigation plan required before rollout.`,
      });
    }
  }

  const hardFail = gates.some((g) => g.level === "hard");
  let status: Result["status"];
  if (hardFail) status = "rejected";
  else if (compositeScore >= 4) status = "top";
  else if (compositeScore >= 3) status = "conditional";
  else status = "watch";

  const statusLabel = {
    rejected: "REJECTED / HIGH RISK",
    top: "TOP PRIORITY",
    conditional: "CONDITIONAL GO",
    watch: "WATCHLIST / DEPRIORITIZE",
  }[status];

  return { dimensionAverages, compositeScore, status, statusLabel, gates };
}
