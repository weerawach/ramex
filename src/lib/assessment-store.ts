import type { Assessment } from "./mcdm";

const KEY = "ai-initiative-assessment";

let cached: Assessment | null = null;

export function saveAssessment(assessment: Assessment) {
  cached = assessment;
  try {
    localStorage.setItem(KEY, JSON.stringify(assessment));
  } catch {
    /* storage unavailable */
  }
}

export function loadAssessment(): Assessment | null {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    cached = JSON.parse(raw) as Assessment;
    return cached;
  } catch {
    return null;
  }
}

export function clearAssessment() {
  cached = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
