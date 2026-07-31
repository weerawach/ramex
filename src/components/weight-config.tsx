import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DEFAULT_WEIGHTS, DIMENSION_LABELS, type Weights } from "@/lib/mcdm";
import { CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

export function WeightConfig({
  weights,
  onChange,
  total,
}: {
  weights: Weights;
  onChange: (weights: Weights) => void;
  total: number;
}) {
  const valid = total === 100;
  const keys = Object.keys(DIMENSION_LABELS) as (keyof Weights)[];

  return (
    <div className="surface-panel rounded-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
            Criteria Weighting
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            MCDM importance per dimension
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(DEFAULT_WEIGHTS)}
          className="text-xs"
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>

      <div className="space-y-5 px-5 py-5">
        {keys.map((key) => (
          <div key={key}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {DIMENSION_LABELS[key]}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const next = Math.min(100, Math.max(0, Number.isNaN(raw) ? 0 : raw));
                    onChange({ ...weights, [key]: next });
                  }}
                  className="w-16 rounded-md border border-input bg-background px-2 py-1 text-right text-sm font-semibold tabular-nums outline-none focus:ring-2 focus:ring-ring"
                  aria-label={`${DIMENSION_LABELS[key]} weight`}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={100}
              step={5}
              value={[weights[key]]}
              onValueChange={([v]) => onChange({ ...weights, [key]: v ?? weights[key] })}
              aria-label={`${DIMENSION_LABELS[key]} weight slider`}
            />
          </div>
        ))}
      </div>

      <div
        className={`flex items-center justify-between rounded-b-xl border-t px-5 py-4 ${
          valid
            ? "border-success/30 bg-success/10"
            : "border-destructive/30 bg-destructive/10"
        }`}
      >
        <div className="flex items-center gap-2">
          {valid ? (
            <CheckCircle2 className="size-4 text-success" />
          ) : (
            <AlertCircle className="size-4 text-destructive" />
          )}
          <span
            className={`text-xs font-semibold ${valid ? "text-success" : "text-destructive"}`}
          >
            {valid ? "Weights valid" : `Total must equal 100% (${100 - total > 0 ? "add" : "remove"} ${Math.abs(100 - total)}%)`}
          </span>
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${valid ? "text-success" : "text-destructive"}`}
        >
          {total}%
        </span>
      </div>
    </div>
  );
}
