import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  DIMENSION_LABELS,
  evaluate,
  type Assessment,
  type Result,
  type Weights,
} from "@/lib/mcdm";
import { clearAssessment, loadAssessment } from "@/lib/assessment-store";
import { AlertTriangle, FileDown, RefreshCw, ShieldX, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Decision Dashboard — AI Initiative Evaluation" },
      {
        name: "description",
        content:
          "Composite SAW score, weighted dimension radar and triggered risk gates for the evaluated retail AI initiative.",
      },
      { property: "og:title", content: "Decision Dashboard — AI Initiative Evaluation" },
      {
        property: "og:description",
        content:
          "Executive decision output with composite score, radar analysis and risk gate alerts.",
      },
    ],
  }),
  component: ResultsPage,
});

const STATUS_STYLES: Record<Result["status"], string> = {
  top: "bg-success text-success-foreground",
  conditional: "bg-info text-info-foreground",
  watch: "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

function ResultsPage() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAssessment(loadAssessment());
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="surface-panel max-w-md rounded-xl p-8 text-center">
          <h1 className="text-xl font-bold text-foreground">No assessment found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the MCDM assessment form to generate a decision output.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Start an assessment</Link>
          </Button>
        </div>
      </div>
    );
  }

  const result = evaluate(assessment);
  const keys = Object.keys(DIMENSION_LABELS) as (keyof Weights)[];
  const chartData = keys.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    score: Number(result.dimensionAverages[key].toFixed(2)),
  }));
  const hardGates = result.gates.filter((g) => g.level === "hard");
  const softGates = result.gates.filter((g) => g.level === "soft");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
              Decision Output
            </p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {assessment.initiativeName}
            </h1>
            <p className="text-sm text-primary-foreground/70">
              Evaluated {new Date(assessment.createdAt).toLocaleString()} · SAW composite
              method
            </p>
          </div>
          <div className="no-print flex gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              <FileDown className="size-4" /> Export to PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                clearAssessment();
                navigate({ to: "/" });
              }}
            >
              <RefreshCw className="size-4" /> Evaluate another initiative
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="surface-panel flex flex-col items-center justify-center rounded-xl p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Composite score
            </p>
            <p className="mt-2 text-6xl font-extrabold tabular-nums text-primary">
              {result.compositeScore.toFixed(2)}
              <span className="text-2xl font-semibold text-muted-foreground"> / 5.0</span>
            </p>
            <span
              className={`mt-5 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide ${STATUS_STYLES[result.status]}`}
            >
              {result.statusLabel}
            </span>
            <p className="mt-4 text-xs text-muted-foreground">
              Weights applied: Bus {assessment.weights.business}% · Data{" "}
              {assessment.weights.data}% · Tech {assessment.weights.technical}% · Org{" "}
              {assessment.weights.organizational}%
            </p>
          </div>

          <div className="surface-panel rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
              Dimension profile
            </h2>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius="70%">
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 5]}
                    tickCount={6}
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <Radar
                    name="Average score"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {keys.map((key) => (
            <div key={key} className="surface-panel rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {DIMENSION_LABELS[key]}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                {result.dimensionAverages[key].toFixed(2)}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(result.dimensionAverages[key] / 5) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Weight {assessment.weights[key]}% · contributes{" "}
                {((result.dimensionAverages[key] * assessment.weights[key]) / 100).toFixed(
                  2,
                )}
              </p>
            </div>
          ))}
        </section>

        <section className="surface-panel rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
            Risk alerts
          </h2>
          {result.gates.length === 0 ? (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
              <ShieldCheck className="size-4" /> No hard or soft gates triggered. The
              initiative is clear to proceed to business case sign-off.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {hardGates.map((gate) => (
                <div
                  key={gate.title}
                  className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4"
                >
                  <ShieldX className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-bold text-destructive">{gate.title}</p>
                    <p className="mt-0.5 text-sm text-foreground/80">{gate.detail}</p>
                  </div>
                </div>
              ))}
              {softGates.map((gate) => (
                <div
                  key={gate.title}
                  className="flex gap-3 rounded-lg border border-warning/50 bg-warning/15 p-4"
                >
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-bold text-warning-foreground">
                      {gate.title}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground/80">{gate.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
