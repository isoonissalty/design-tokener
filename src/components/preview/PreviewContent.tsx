"use client";

import { useId, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Check, ChevronRight, Circle, Layers3, Moon, Plus, Search, Sun } from "lucide-react";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type PreviewTemplateId = "landing" | "dashboard" | "pricing";

interface PreviewContentProps {
  template: PreviewTemplateId;
  isDark: boolean;
  toggleTheme: () => void;
}

function PreviewHeader({ isDark, toggleTheme, title }: Omit<PreviewContentProps, "template"> & { title: string }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-4">
      <div className="flex items-center gap-2 font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Layers3 className="h-4 w-4" /></span>
        <span>{title}</span>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}

const initialProjects = [
  { name: "Website redesign", detail: "Design system · 12 tasks", progress: 72, state: "In progress" },
  { name: "Mobile experience", detail: "Product design · 8 tasks", progress: 45, state: "In progress" },
  { name: "Brand guidelines", detail: "Brand identity · 6 tasks", progress: 100, state: "Completed" },
];

function DashboardPreview() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [projects, setProjects] = useState(initialProjects);
  const searchId = useId();
  const filtered = projects.filter(project => project.name.toLowerCase().includes(query.toLowerCase()));
  const chart = period === "week" ? [35, 54, 42, 71, 63, 85, 74] : [48, 68, 59, 91];
  const chartLabels = period === "week" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Week 1", "Week 2", "Week 3", "Week 4"];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-1 text-sm text-muted-foreground">Your workspace, at a glance</p><h1 className="text-3xl font-bold tracking-tight">Overview</h1></div>
        <Button onClick={() => setProjects(current => [...current, { name: `New project ${current.length - 2}`, detail: "New workspace · 0 tasks", progress: 0, state: "Not started" }])}><Plus />New project</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total revenue", value: "$48,250", change: "+12.8%", positive: true },
          { label: "Active projects", value: String(projects.filter(project => project.progress < 100).length), change: "+2 this month", positive: true },
          { label: "Open tasks", value: "24", change: "−8 this week", positive: false },
        ].map(metric => <Card key={metric.label}><CardHeader className="pb-3"><CardDescription>{metric.label}</CardDescription><CardTitle className="text-3xl">{metric.value}</CardTitle></CardHeader><CardContent><p className="flex items-center gap-1 text-xs text-muted-foreground">{metric.positive ? <ArrowUpRight className="h-3 w-3 text-primary" /> : <ArrowDownRight className="h-3 w-3 text-primary" />}{metric.change}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4">
          <div className="space-y-1"><CardTitle>Activity</CardTitle><CardDescription>Completed tasks across your workspace</CardDescription></div>
          <div className="flex rounded-md border p-1" role="group" aria-label="Activity period">
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
          <div className="relative w-full sm:w-52"><label htmlFor={searchId} className="sr-only">Search projects</label><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input id={searchId} className="pl-9" placeholder="Search projects..." value={query} onChange={event => setQuery(event.target.value)} /></div>
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

const plans = [
  { name: "Starter", description: "For your next great idea.", monthly: 0, annual: 0, features: ["3 projects", "Basic analytics", "Community support"], featured: false },
  { name: "Pro", description: "Room to build and grow.", monthly: 24, annual: 19, features: ["Unlimited projects", "Advanced analytics", "Team collaboration", "Priority support"], featured: true },
  { name: "Business", description: "Bring your whole team together.", monthly: 59, annual: 47, features: ["Everything in Pro", "Unlimited team members", "Custom integrations", "Dedicated account manager"], featured: false },
];

function PricingPreview() {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Simple, transparent pricing</span>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">A plan for every possibility.</h1>
        <p className="text-muted-foreground">Start small. Make something great. Choose the tools that grow with you.</p>
        <div className="mt-6 inline-flex items-center gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Billing cycle">
          <Button variant={!annual ? "secondary" : "ghost"} size="sm" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</Button>
          <Button variant={annual ? "secondary" : "ghost"} size="sm" aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly <span className="text-xs text-primary">Save 20%</span></Button>
        </div>
      </div>
      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {plans.map(plan => <Card key={plan.name} className={`relative flex flex-col ${plan.featured ? "border-primary ring-1 ring-primary" : ""}`}>
          {plan.featured && <div className="absolute inset-x-6 -top-3 rounded-full bg-primary py-1 text-center text-xs font-medium text-primary-foreground">Most popular</div>}
          <CardHeader className="pt-8"><CardTitle>{plan.name}</CardTitle><CardDescription>{plan.description}</CardDescription></CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <p className="mb-1"><span className="text-4xl font-bold">${annual ? plan.annual : plan.monthly}</span><span className="text-sm text-muted-foreground"> / month</span></p>
            <p className="mb-6 text-xs text-muted-foreground">{plan.monthly === 0 ? "Free, for as long as you need" : annual ? `$${plan.annual * 12} billed yearly` : "Billed monthly"}</p>
            <Button variant={plan.featured ? "default" : "outline"} className="mb-6 w-full" onClick={() => setSelected(plan.name)}>{selected === plan.name ? <><Check />Selected</> : <>Get started<ChevronRight /></>}</Button>
            <div className="mb-4 border-t" /><ul className="space-y-3 text-sm">{plan.features.map(feature => <li key={feature} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{feature}</span></li>)}</ul>
          </CardContent>
        </Card>)}
      </div>
      <p className="mt-6 min-h-5 text-center text-sm text-muted-foreground" role="status">{selected ? `${selected} selected with ${annual ? "yearly" : "monthly"} billing. This is an interactive theme preview.` : "All plans include secure hosting and automatic updates."}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-6 border-t pt-8 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Circle className="h-3 w-3 text-primary" />No setup fees</span><span className="flex items-center gap-2"><Circle className="h-3 w-3 text-primary" />Cancel anytime</span><span className="flex items-center gap-2"><Circle className="h-3 w-3 text-primary" />Your data stays yours</span></div>
    </div>
  );
}

export function PreviewContent({ template, isDark, toggleTheme }: PreviewContentProps) {
  if (template === "landing") return <LandingPage isDark={isDark} toggleTheme={toggleTheme} />;

  return (
    <div className={`min-h-full w-full bg-background font-sans text-foreground ${isDark ? "dark" : ""}`}>
      <PreviewHeader title={template === "dashboard" ? "Workspace" : "Forma"} isDark={isDark} toggleTheme={toggleTheme} />
      {template === "dashboard" ? <DashboardPreview /> : <PricingPreview />}
    </div>
  );
}
