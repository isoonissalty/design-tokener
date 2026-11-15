"use client";

import { useId, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Layers3, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialProjects = [
  { name: "Website redesign", detail: "Design system · 12 tasks", progress: 72, state: "In progress" },
  { name: "Mobile experience", detail: "Product design · 8 tasks", progress: 45, state: "In progress" },
  { name: "Brand guidelines", detail: "Brand identity · 6 tasks", progress: 100, state: "Completed" },
];

export function DashboardPreview() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [projects, setProjects] = useState(initialProjects);
  const searchId = useId();
  const filtered = projects.filter(project => project.name.toLowerCase().includes(query.toLowerCase()));
  const chart = period === "week" ? [35, 54, 42, 71, 63, 85, 74] : [48, 68, 59, 91];
  const chartLabels = period === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Week 1", "Week 2", "Week 3", "Week 4"];

  return (
    <div className="preview-page mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-1 text-sm text-muted-foreground">Your workspace, at a glance</p><h1 className="text-3xl font-bold tracking-tight">Overview</h1></div>
        <Button onClick={() => setProjects(current => [...current, { name: `New project ${current.length - 2}`, detail: "New workspace · 0 tasks", progress: 0, state: "Not started" }])}><Plus />New project</Button>
      </div>

      <div className="preview-grid-three gap-4">
        {[
          { label: "Total revenue", value: "$48,250", change: "+12.8%", positive: true },
          { label: "Active projects", value: String(projects.filter(project => project.progress < 100).length), change: "+2 this month", positive: true },
          { label: "Open tasks", value: "24", change: "−8 this week", positive: false },
        ].map(metric => <Card key={metric.label}><CardHeader className="pb-3"><CardDescription>{metric.label}</CardDescription><CardTitle className="text-3xl">{metric.value}</CardTitle></CardHeader><CardContent><p className="flex items-center gap-1 text-xs text-muted-foreground">{metric.positive ? <ArrowUpRight className="h-3 w-3 text-primary" /> : <ArrowDownRight className="h-3 w-3 text-primary" />}{metric.change}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
          <div className="space-y-1"><CardTitle>Activity</CardTitle><CardDescription>Completed tasks across your workspace</CardDescription></div>
          <div className="flex max-w-full flex-wrap rounded-md border p-1" role="group" aria-label="Activity period">
            {(["week", "month"] as const).map(value => <Button key={value} variant={period === value ? "secondary" : "ghost"} size="sm" aria-pressed={period === value} onClick={() => setPeriod(value)}>{value === "week" ? "This week" : "This month"}</Button>)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-44 items-end gap-3 border-b pb-2" role="img" aria-label={`${period === "week" ? "Weekly" : "Monthly"} completed tasks: ${chart.map((height, index) => `${chartLabels[index]} ${height}`).join(", ")}`}>
            {chart.map((height, index) => <div key={chartLabels[index]} className="flex h-full flex-1 items-end"><div className="w-full rounded-t-md bg-primary transition-all" style={{ height: `${height}%`, opacity: index === chart.length - 1 ? 1 : 0.55 }} /></div>)}
          </div>
          <div className="mt-2 flex gap-3 text-center text-xs text-muted-foreground">{chartLabels.map(label => <span key={label} className="flex-1">{label}</span>)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-4">
          <div className="space-y-1"><CardTitle>Projects</CardTitle><CardDescription>Keep your team moving forward.</CardDescription></div>
          <div className="relative w-full max-w-64"><label htmlFor={searchId} className="sr-only">Search projects</label><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input id={searchId} className="pl-9" placeholder="Search projects..." value={query} onChange={event => setQuery(event.target.value)} /></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.map((project, index) => <div key={`${project.name}-${index}`} className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary"><Layers3 className="h-5 w-5" /></span><div><h2 className="text-sm font-medium">{project.name}</h2><p className="mt-1 text-xs text-muted-foreground">{project.detail}</p></div></div>
            <div className="ml-auto w-32 space-y-2"><div className="flex justify-between text-xs text-muted-foreground"><span>{project.state}</span><span>{project.progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${project.name} completion`} aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} /></div></div>
          </div>)}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No projects match your search.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

