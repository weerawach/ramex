import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScaleField, BinaryField } from "@/components/assessment-fields";
import { WeightConfig } from "@/components/weight-config";
import {
  DEFAULT_SCORES,
  evaluate,
  type Scores,
  type Weights,
} from "@/lib/mcdm";
import { updateProject, type ProjectRecord } from "@/lib/assessment-store";
import { Pencil, ShieldAlert } from "lucide-react";

export function EditProjectDialog({ project }: { project: ProjectRecord }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [weights, setWeights] = useState<Weights>(project.weights);
  const [scores, setScores] = useState<Scores>(project.scores ?? DEFAULT_SCORES);

  // Re-sync the form whenever the dialog is opened for this project.
  useEffect(() => {
    if (open) {
      setName(project.name);
      setWeights(project.weights);
      setScores(project.scores ?? DEFAULT_SCORES);
    }
  }, [open, project]);

  const total = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0),
    [weights],
  );
  const weightsValid = total === 100;

  const set =
    <K extends keyof Scores>(key: K) =>
    (value: Scores[K]) =>
      setScores((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(
    () =>
      evaluate({
        initiativeName: name,
        weights,
        scores,
        createdAt: project.createdAt,
      }),
    [name, weights, scores, project.createdAt],
  );

  const save = () => {
    if (!weightsValid) return;
    updateProject(project.id, {
      name: name.trim() || project.name,
      weights,
      scores,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="no-print">
          <Pencil className="size-3.5" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit initiative</DialogTitle>
          <DialogDescription>
            Adjust scores and weights, then recalculate. Only this initiative is updated —
            every other evaluated project stays untouched.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div>
            <label
              htmlFor={`name-${project.id}`}
              className="text-sm font-semibold text-foreground"
            >
              Initiative name
            </label>
            <Input
              id={`name-${project.id}`}
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
            />
          </div>

          <WeightConfig weights={weights} onChange={setWeights} total={total} />

          <Group title="Business Value" average={preview.dimensionAverages.business}>
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
          </Group>

          <Group title="Data Readiness" average={preview.dimensionAverages.data}>
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
          </Group>

          <Group
            title="Technical Feasibility"
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
          </Group>

          <Group
            title="Organizational & Governance Readiness"
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
          </Group>
        </div>

        <DialogFooter className="mt-6 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recalculated composite
            </p>
            <p className="text-2xl font-bold tabular-nums text-primary">
              {weightsValid ? preview.compositeScore.toFixed(2) : "—"}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                / 5.00
              </span>
            </p>
            {preview.gates.length > 0 && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-warning-foreground">
                <ShieldAlert className="size-3.5 text-warning" />
                {preview.gates.length} risk gate
                {preview.gates.length > 1 ? "s" : ""} triggered
              </p>
            )}
            {!weightsValid && (
              <p className="text-xs font-medium text-destructive">
                Weights must total exactly 100%.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!weightsValid}>
              Calculate &amp; save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Group({
  title,
  average,
  children,
}: {
  title: string;
  average: number;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-panel rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-sm font-bold tabular-nums text-primary">
          {average.toFixed(2)}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
