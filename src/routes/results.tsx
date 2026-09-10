import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DIMENSION_LABELS, type Weights } from "@/lib/mcdm";
import {
  clearAssessments,
  loadMockScenarios,
  useProjects,
  type ProjectRecord,
} from "@/lib/assessment-store";
import {
  ClipboardList,
  FileDown,
  FlaskConical,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Executive Portfolio Dashboard — AI Initiative Decisions" },
      {
        name: "description",
        content:
          "Ranked portfolio of evaluated retail AI initiatives with composite SAW scores, dimension comparison charts and triggered risk gates.",
      },
      {
        property: "og:title",
        content: "Executive Portfolio Dashboard — AI Initiative Decisions",
      },
      {
        property: "og:description",
        content:
          "Compare retail AI proposals side by side with composite scores, radar analysis and risk alerts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

const STATUS_STYLES: Record<ProjectRecord["status"], string> = {
  top: "bg-success text-success-foreground",
  conditional: "bg-info text-info-foreground",
  watch: "bg-warning text-warning-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

const DIM_KEYS = Object.keys(DIMENSION_LABELS) as (keyof Weights)[];
const SERIES_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function ActionBar() {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button variant="secondary" asChild>
        <Link to="/">
          <Plus className="size-4" /> Evaluate new initiative
        </Link>
      </Button>
      <Button variant="secondary" onClick={() => loadMockScenarios()}>
        <FlaskConical className="size-4" /> Load TC-08 Scenarios
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="size-4" /> Clear All Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete all evaluated AI
              project data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearAssessments()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete all data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ResultsPage() {
  const projects = useProjects();
  const ranked = [...projects].sort((a, b) => b.composite - a.composite);

  const barConfig: ChartConfig = {
    composite: { label: "Composite Score", color: "var(--color-chart-1)" },
  };

  const radarConfig: ChartConfig = Object.fromEntries(
    ranked.map((p, i) => [
      p.id,
      { label: p.name, color: SERIES_COLORS[i % SERIES_COLORS.length] },
    ]),
  );

  const barData = ranked.map((p) => ({
    name: p.name.split("·")[0]?.trim() || p.name,
    fullName: p.name,
    composite: Number(p.composite.toFixed(2)),
  }));

  const radarData = DIM_KEYS.map((key) => {
    const row: Record<string, string | number> = { dimension: DIMENSION_LABELS[key] };
    ranked.forEach((p) => {
      row[p.id] = Number(p.dimensions[key].toFixed(2));
    });
    return row;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
              Decision Output
            </p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              Executive AI Portfolio Dashboard
            </h1>
            <p className="text-sm text-primary-foreground/70">
              {ranked.length} initiative{ranked.length === 1 ? "" : "s"} evaluated · ranked
              by SAW composite score
            </p>
          </div>
          <ActionBar />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {ranked.length === 0 ? (
          <Card className="mx-auto max-w-xl">
            <CardHeader className="items-center text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface text-muted-foreground">
                <ClipboardList className="size-7" />
              </span>
              <CardTitle className="mt-2">No AI initiatives evaluated yet</CardTitle>
              <CardDescription>
                Score your first retail AI proposal in the MCDM assessment form, or load the
                TC-08 demonstration scenarios to preview the portfolio dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link to="/">
                  <Plus className="size-4" /> Evaluate new initiative
                </Link>
              </Button>
              <Button variant="outline" onClick={() => loadMockScenarios()}>
                <FlaskConical className="size-4" /> Load TC-08 Scenarios
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
                    Composite score comparison
                  </CardTitle>
                  <CardDescription>Ranked highest to lowest, out of 5.00.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barConfig} className="h-[320px] w-full">
                    <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 8 }}>
                      <CartesianGrid vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis domain={[0, 5]} tickCount={6} tickLine={false} axisLine={false} fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="composite" fill="var(--color-composite)" radius={6} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
                    Dimension profile comparison
                  </CardTitle>
                  <CardDescription>
                    Average score per dimension for every initiative.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={radarConfig} className="h-[320px] w-full">
                    <RadarChart data={radarData} outerRadius="65%">
                      <PolarGrid stroke="var(--color-border)" />
                      <PolarAngleAxis dataKey="dimension" fontSize={11} />
                      <PolarRadiusAxis domain={[0, 5]} tickCount={6} fontSize={10} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {ranked.map((p, i) => (
                        <Radar
                          key={p.id}
                          name={p.name}
                          dataKey={p.id}
                          stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                          fill={SERIES_COLORS[i % SERIES_COLORS.length]}
                          fillOpacity={0.12}
                        />
                      ))}
                      <ChartLegend content={<ChartLegendContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
                    Portfolio ranking
                  </CardTitle>
                  <CardDescription>
                    Dimension averages, composite score, decision status and triggered gates.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="no-print"
                  onClick={() => window.print()}
                >
                  <FileDown className="size-4" /> Export to PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>Initiative</TableHead>
                        <TableHead className="text-right">Bus</TableHead>
                        <TableHead className="text-right">Data</TableHead>
                        <TableHead className="text-right">Tech</TableHead>
                        <TableHead className="text-right">Org</TableHead>
                        <TableHead className="text-right">Composite</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk alerts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ranked.map((p, i) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-semibold tabular-nums text-muted-foreground">
                            {i + 1}
                          </TableCell>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          {DIM_KEYS.map((key) => (
                            <TableCell key={key} className="text-right tabular-nums">
                              {p.dimensions[key].toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-right text-base font-bold tabular-nums text-primary">
                            {p.composite.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[p.status]}`}
                            >
                              {p.statusLabel}
                            </span>
                          </TableCell>
                          <TableCell className="min-w-[220px]">
                            {p.alerts.length === 0 ? (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                                <ShieldCheck className="size-3.5" /> None
                              </span>
                            ) : (
                              <ul className="space-y-1">
                                {p.alerts.map((a) => (
                                  <li
                                    key={a}
                                    className={`text-xs font-medium ${a.startsWith("Hard") ? "text-destructive" : "text-warning-foreground"}`}
                                  >
                                    {a}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
