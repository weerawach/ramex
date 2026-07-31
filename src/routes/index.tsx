import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WeightConfig } from "@/components/weight-config";
import { BinaryField, ScaleField } from "@/components/assessment-fields";
import {
  DEFAULT_SCORES,
  DEFAULT_WEIGHTS,
  type Scores,
  type Weights,
  evaluate,
} from "@/lib/mcdm";
import { saveAssessment } from "@/lib/assessment-store";
import { BarChart3, Database, Cpu, Users, ArrowRight, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Initiative Assessment — MCDM Evaluation for Retail" },
      {
        name: "description",
        content:
          "Score retail AI initiatives across business value, data readiness, technical feasibility and governance using weighted SAW scoring.",
      },
      { property: "og:title", content: "AI Initiative Assessment — MCDM Evaluation" },
      {
        property: "og:description",
        content:
          "Weighted multi-criteria assessment with hard and soft risk gates for retail AI initiatives.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const navigate = useNavigate();
  const [initiativeName, setInitiativeName] = useState("");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);

  const total = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0),
    [weights],
  );
  const weightsValid = total === 100;

  const set = <K extends keyof Scores>(key: K) => (value: Scores[K]) =>
    setScores((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(
    () =>
      evaluate({
        initiativeName,
        weights,
        scores,
        createdAt: new Date().toISOString(),
      }),
    [initiativeName, weights, scores],
  );

  const submit = () => {
    if (!weightsValid) return;
    saveAssessment({
      initiativeName: initiativeName.trim() || "Untitled AI Initiative",
      weights,
      scores,
      createdAt: new Date().toISOString(),
    });
    navigate({ to: "/results" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Retail AI Portfolio Governance
          </p>
          <h1 className="text-2xl font-bold text-primary-foreground">
            AI Initiative Evaluation &amp; Decision-Support System
          </h1>
          <p className="max-w-2xl text-sm text-primary-foreground/70">
            Multi-criteria decision making (MCDM) with Simple Additive Weighting across four
            evaluation dimensions and mandatory risk gates.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="surface-panel rounded-xl p-5">
            <label
              htmlFor="initiative"
              className="text-sm font-semibold text-foreground"
            >
              Initiative name
            </label>
            <Input
              id="initiative"
              value={initiativeName}
              maxLength={120}
              placeholder="e.g. Demand Forecasting for Fresh Categories"
              onChange={(e) => setInitiativeName(e.target.value)}
              className="mt-2"
            />
          </div>

          <Accordion
            type="multiple"
            defaultValue={["d1", "d2", "d3", "d4"]}
            className="space-y-4"
          >
            <Section
              value="d1"
              icon={<BarChart3 className="size-4" />}
              index="Dimension 1"
              title="Business Value"
              weight={weights.business}
              average={preview.dimensionAverages.business}
            >
              <ScaleField
                label="Financial Impact"
                description="Revenue uplift, margin gain or cost avoidance potential."
                value={scores.financialImpact}
                onChange={set("financialImpact")}
              />
              <ScaleField
                label="Operational Efficiency"
                description="Process cycle-time, labour and inventory efficiency gains."
                value={scores.operationalEfficiency}
                onChange={set("operationalEfficiency")}
              />
              <ScaleField
                label="Customer & Brand Value"
                description="Impact on customer experience, loyalty and brand equity."
                value={scores.customerBrandValue}
                onChange={set("customerBrandValue")}
              />
            </Section>

            <Section
              value="d2"
              icon={<Database className="size-4" />}
              index="Dimension 2"
              title="Data Readiness"
              weight={weights.data}
              average={preview.dimensionAverages.data}
            >
              <BinaryField
                label="Data Availability"
                description="Is the required data captured, retained and accessible today?"
                value={scores.dataAvailability}
                onChange={set("dataAvailability")}
              />
              <ScaleField
                label="Quality & Accessibility"
                description="Completeness, accuracy and ease of access to source data."
                value={scores.qualityAccessibility}
                onChange={set("qualityAccessibility")}
              />
              <ScaleField
                label="Integration Feasibility"
                description="Effort to pipeline data from POS, ERP, CRM and e-commerce."
                value={scores.integrationFeasibility}
                onChange={set("integrationFeasibility")}
              />
            </Section>

            <Section
              value="d3"
              icon={<Cpu className="size-4" />}
              index="Dimension 3"
              title="Technical Feasibility"
              weight={weights.technical}
              average={preview.dimensionAverages.technical}
            >
              <ScaleField
                label="Model Performance & Uptime"
                description="Expected accuracy, latency and service reliability."
                value={scores.modelPerformance}
                onChange={set("modelPerformance")}
              />
              <ScaleField
                label="Scalability & Interoperability"
                description="Ability to scale across stores, channels and existing systems."
                value={scores.scalability}
                onChange={set("scalability")}
              />
              <ScaleField
                label="Cloud FinOps & Total Cost of Ownership"
                description="Run-rate cost predictability across compute, storage and licences."
                value={scores.finOps}
                onChange={set("finOps")}
              />
            </Section>

            <Section
              value="d4"
              icon={<Users className="size-4" />}
              index="Dimension 4"
              title="Organizational & Governance Readiness"
              weight={weights.organizational}
              average={preview.dimensionAverages.organizational}
            >
              <ScaleField
                label="User Readiness & Change Capability"
                description="Store and HQ team adoption capacity and training maturity."
                value={scores.userReadiness}
                onChange={set("userReadiness")}
              />
              <ScaleField
                label="Leadership & Vendor Support"
                description="Executive sponsorship and vendor delivery commitment."
                value={scores.leadershipSupport}
                onChange={set("leadershipSupport")}
              />
              <BinaryField
                label="Governance, Privacy & Legal Gate"
                description="Does the initiative clear privacy, regulatory and legal review?"
                value={scores.governanceGate}
                onChange={set("governanceGate")}
              />
              <ScaleField
                label="Human-in-the-Loop Oversight"
                description="Maturity of human review, escalation and override mechanisms."
                value={scores.humanOversight}
                onChange={set("humanOversight")}
              />
            </Section>
          </Accordion>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <WeightConfig weights={weights} onChange={setWeights} total={total} />

          <div className="surface-panel rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live composite score
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
              {weightsValid ? preview.compositeScore.toFixed(2) : "—"}
              <span className="ml-1 text-base font-medium text-muted-foreground">
                / 5.00
              </span>
            </p>
            {preview.gates.length > 0 && (
              <p className="mt-3 flex items-start gap-2 text-xs font-medium text-warning-foreground">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-warning" />
                {preview.gates.length} risk gate
                {preview.gates.length > 1 ? "s" : ""} currently triggered
              </p>
            )}
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!weightsValid}
              onClick={submit}
            >
              Calculate decision <ArrowRight className="size-4" />
            </Button>
            {!weightsValid && (
              <p className="mt-2 text-center text-xs font-medium text-destructive">
                Weights must total exactly 100% to submit.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function Section({
  value,
  icon,
  index,
  title,
  weight,
  average,
  children,
}: {
  value: string;
  icon: React.ReactNode;
  index: string;
  title: string;
  weight: number;
  average: number;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem
      value={value}
      className="surface-panel overflow-hidden rounded-xl border-b"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-4 pr-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              {icon}
            </span>
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {index} · Weight {weight}%
              </p>
              <p className="text-base font-semibold text-foreground">{title}</p>
            </div>
          </div>
          <span className="text-sm font-bold tabular-nums text-primary">
            {average.toFixed(2)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-3 bg-surface px-5 pb-5 pt-1">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
