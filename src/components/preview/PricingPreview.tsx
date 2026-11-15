"use client";

import { useState } from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  { name: "Starter", description: "For your next great idea.", monthly: 0, annual: 0, features: ["3 projects", "Basic analytics", "Community support"], featured: false },
  { name: "Pro", description: "Room to build and grow.", monthly: 24, annual: 19, features: ["Unlimited projects", "Advanced analytics", "Team collaboration", "Priority support"], featured: true },
  { name: "Business", description: "Bring your whole team together.", monthly: 59, annual: 47, features: ["Everything in Pro", "Unlimited team members", "Custom integrations", "Dedicated account manager"], featured: false },
];

export function PricingPreview() {
  const [annual, setAnnual] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="preview-page mx-auto max-w-6xl">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Simple, transparent pricing</span>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">A plan for every possibility.</h1>
        <p className="text-muted-foreground">Start small. Make something great. Choose the tools that grow with you.</p>
        <div className="mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-lg border bg-card p-1" role="group" aria-label="Billing cycle">
          <Button variant={!annual ? "secondary" : "ghost"} size="sm" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</Button>
          <Button variant={annual ? "secondary" : "ghost"} size="sm" aria-pressed={annual} onClick={() => setAnnual(true)}>Yearly <span className="text-xs text-primary">Save 20%</span></Button>
        </div>
      </div>
      <div className="preview-grid-three items-stretch gap-6">
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

