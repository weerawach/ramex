import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";

const SCALE_HINTS = ["Critical", "Low", "Moderate", "Strong", "Optimal"];

export function ScaleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const low = value <= 2;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <span
            className={`text-2xl font-bold tabular-nums ${low ? "text-destructive" : "text-primary"}`}
          >
            {value}
          </span>
          <p className="text-[11px] font-medium text-muted-foreground">
            {SCALE_HINTS[value - 1]}
          </p>
        </div>
      </div>
      <Slider
        className="mt-4"
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>1 · Critical</span>
        <span>5 · Optimal</span>
      </div>
      {low && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertTriangle className="size-3.5" /> Soft gate will be triggered
        </p>
      )}
    </div>
  );
}

export function BinaryField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${value ? "border-border bg-card" : "border-destructive/40 bg-destructive/5"}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {label}
            <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
              Hard gate
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-xs font-bold ${value ? "text-success" : "text-destructive"}`}
          >
            {value ? "YES" : "NO"}
          </span>
          <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
        </div>
      </div>
      {!value && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertTriangle className="size-3.5" /> Initiative will be flagged REJECTED / HIGH
          RISK
        </p>
      )}
    </div>
  );
}
