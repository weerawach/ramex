import { useSyncExternalStore } from "react";
import { evaluate, type Assessment, type Scores, type Weights } from "./mcdm";

const KEY = "ai-initiative-portfolio";

export type ProjectRecord = {
  id: string;
  name: string;
  dimensions: Record<keyof Weights, number>;
  weights: Weights;
  /** Raw 1-5 / yes-no inputs, kept so an initiative can be edited later. */
  scores?: Scores;
  composite: number;
  status: "top" | "conditional" | "watch" | "rejected";
  statusLabel: string;
  alerts: string[];
  createdAt: string;
};

const EMPTY: ProjectRecord[] = [];
let projects: ProjectRecord[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((l) => l());
};

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch {
    /* storage unavailable */
  }
};

const sortDesc = (list: ProjectRecord[]) =>
  [...list].sort((a, b) => b.composite - a.composite);

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) projects = sortDesc(JSON.parse(raw) as ProjectRecord[]);
  } catch {
    projects = [];
  }
}

export function getProjects(): ProjectRecord[] {
  return projects;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useProjects(): ProjectRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      hydrate();
      return projects;
    },
    () => EMPTY,
  );
}

export function addProject(record: ProjectRecord) {
  hydrate();
  projects = sortDesc([...projects, record]);
  persist();
  emit();
}

/** Evaluates an assessment from the form and appends it to the portfolio. */
export function saveAssessment(assessment: Assessment) {
  const result = evaluate(assessment);
  addProject({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: assessment.initiativeName,
    dimensions: {
      business: result.dimensionAverages.business,
      data: result.dimensionAverages.data,
      technical: result.dimensionAverages.technical,
      organizational: result.dimensionAverages.organizational,
    },
    weights: assessment.weights,
    scores: assessment.scores,
    composite: result.compositeScore,
    status: result.status,
    statusLabel: result.statusLabel,
    alerts: result.gates.map((g) => g.title),
    createdAt: assessment.createdAt,
  });
}

/**
 * Updates one initiative by id, re-running the SAW engine on its new inputs.
 * All other records are preserved exactly as they are.
 */
export function updateProject(
  id: string,
  patch: { name: string; weights: Weights; scores: Scores },
) {
  hydrate();
  const existing = projects.find((p) => p.id === id);
  if (!existing) return;

  const result = evaluate({
    initiativeName: patch.name,
    weights: patch.weights,
    scores: patch.scores,
    createdAt: existing.createdAt,
  });

  projects = sortDesc(
    projects.map((p) =>
      p.id === id
        ? {
            ...p,
            name: patch.name,
            weights: patch.weights,
            scores: patch.scores,
            dimensions: { ...result.dimensionAverages },
            composite: result.compositeScore,
            status: result.status,
            statusLabel: result.statusLabel,
            alerts: result.gates.map((g) => g.title),
          }
        : p,
    ),
  );
  persist();
  emit();
}


export function clearAssessments() {
  hydrated = true;
  projects = [];
  persist();
  emit();
}

const EVEN: Weights = { business: 25, data: 25, technical: 25, organizational: 25 };

const MOCK: Omit<ProjectRecord, "id" | "createdAt" | "weights">[] = [
  {
    name: "P1 · Demand Forecasting (High Readiness)",
    dimensions: { business: 4.67, data: 5.0, technical: 5.0, organizational: 4.33 },
    composite: 4.75,
    status: "top",
    statusLabel: "TOP PRIORITY",
    alerts: [],
  },
  {
    name: "P2 · Demand Forecasting (Legacy Constraints)",
    dimensions: { business: 4.67, data: 1.0, technical: 2.67, organizational: 3.0 },
    composite: 2.83,
    status: "watch",
    statusLabel: "WATCHLIST / DEPRIORITIZE",
    alerts: [
      "Soft Gate — Data Prep Warning",
      "Soft Gate — Integration Risk",
    ],
  },
  {
    name: "P3 · GenAI Personalization (Robust Governance)",
    dimensions: { business: 4.0, data: 4.0, technical: 3.67, organizational: 4.33 },
    composite: 4.0,
    status: "conditional",
    statusLabel: "CONDITIONAL GO",
    alerts: [],
  },
  {
    name: "P4 · GenAI Personalization (High Compliance Risk)",
    dimensions: { business: 4.67, data: 3.5, technical: 4.33, organizational: 2.67 },
    composite: 3.79,
    status: "rejected",
    statusLabel: "REJECTED / HIGH RISK",
    alerts: [
      "Hard Gate — Governance, Privacy & Legal",
      "Soft Gate — Oversight Gap",
    ],
  },
];

export function loadMockScenarios() {
  hydrated = true;
  const now = Date.now();
  projects = sortDesc(
    MOCK.map((m, i) => ({
      ...m,
      id: `tc08-${i + 1}`,
      weights: EVEN,
      createdAt: new Date(now + i).toISOString(),
    })),
  );
  persist();
  emit();
}
