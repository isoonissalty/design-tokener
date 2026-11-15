"use client";

import { useId, useState } from "react";
import { AlertCircle, AlertTriangle, Bookmark, CheckCircle2, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const buttonExamples = [
  { label: "Primary", variant: "default" },
  { label: "Secondary", variant: "secondary" },
  { label: "Outline", variant: "outline" },
  { label: "Ghost", variant: "ghost" },
  { label: "Link", variant: "link" },
  { label: "Destructive", variant: "destructive" },
] as const;

const notices = [
  { title: "Changes saved", detail: "Your workspace is up to date.", intent: "success", icon: CheckCircle2 },
  { title: "Storage almost full", detail: "Review your files before your next upload.", intent: "warning", icon: AlertTriangle },
  { title: "Connection interrupted", detail: "Try again when your connection is restored.", intent: "error", icon: AlertCircle },
] as const;

export function ComponentGalleryPreview() {
  const id = useId();
  const [message, setMessage] = useState("Choose a button to try its interaction.");
  const [name, setName] = useState("Design workspace");
  const [email, setEmail] = useState("alex@");
  const [tab, setTab] = useState("overview");
  const [volume, setVolume] = useState([60]);
  const [saved, setSaved] = useState(false);
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="preview-page mx-auto max-w-6xl space-y-8">
      <div className="space-y-2">
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Design system / Components</span>
        <h1 className="break-words text-3xl font-bold tracking-tight">Small details. One system.</h1>
        <p className="max-w-2xl text-muted-foreground">Explore your theme through everyday components, interaction states, and typography.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle><h2>Buttons</h2></CardTitle>
          <CardDescription>Hover, focus, and press to compare every variant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {buttonExamples.map(example => (
              <Button
                key={example.variant}
                variant={example.variant}
                onClick={() => setMessage(`${example.label} button pressed.`)}
              >
                {example.label}
              </Button>
            ))}
            <Button disabled>Disabled</Button>
          </div>
          <p className="min-h-6 text-sm text-muted-foreground" role="status">{message}</p>
        </CardContent>
      </Card>

      <div className="preview-grid-two grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle><h2>Form fields</h2></CardTitle>
            <CardDescription>Default, invalid, and disabled states in context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-name`}>Workspace name</Label>
              <Input id={`${id}-name`} value={name} onChange={event => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Contact email</Label>
              <Input
                id={`${id}-email`}
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                aria-invalid={emailInvalid}
                aria-describedby={`${id}-email-help`}
                className={emailInvalid ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              <p id={`${id}-email-help`} className={`text-xs ${emailInvalid ? "text-destructive" : "text-muted-foreground"}`}>
                {emailInvalid ? "Enter a complete email address, such as alex@example.com." : "This email address is ready to use."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-account`}>Account ID</Label>
              <Input id={`${id}-account`} value="WS-2048" disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><h2>Tabs & controls</h2></CardTitle>
            <CardDescription>Try the arrow keys on tabs and the slider.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList aria-label="Component controls" className="mb-4 h-auto max-w-full flex-wrap">
                <TabsTrigger value="overview" className="min-w-0 whitespace-normal">Overview</TabsTrigger>
                <TabsTrigger value="preferences" className="min-w-0 whitespace-normal">Preferences</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary"><Layers3 aria-hidden="true" /></div>
                <h3 className="text-lg font-semibold">Built to work together</h3>
                <p className="text-sm text-muted-foreground">Cards provide a surface for content. Borders, spacing, and shadows create a clear hierarchy.</p>
                <Button
                  variant="outline"
                  aria-pressed={saved}
                  onClick={() => setSaved(current => !current)}
                >
                  <Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} />
                  {saved ? "Saved to collection" : "Save to collection"}
                </Button>
                <span className="sr-only" role="status">{saved ? "Component saved to your sample collection." : "Component is not saved."}</span>
              </TabsContent>
              <TabsContent value="preferences" className="space-y-6 py-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span id={`${id}-volume-label`} className="text-sm font-medium">Volume</span>
                    <output className="text-sm tabular-nums text-muted-foreground">{volume[0]}%</output>
                  </div>
                  <Slider value={volume} onValueChange={setVolume} max={100} step={1} aria-label="Volume" aria-labelledby={`${id}-volume-label`} />
                </div>
                <p className="text-sm text-muted-foreground">Your sample volume is set to {volume[0]}%. These controls update this preview only.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby={`${id}-status-title`} className="space-y-4">
        <h2 id={`${id}-status-title`} className="text-xl font-semibold">Status messages</h2>
        <div className="preview-grid-three grid gap-4">
          {notices.map(notice => {
            const Icon = notice.icon;
            const color = `var(--color-intent-${notice.intent})`;
            return (
              <div key={notice.intent} className="space-y-3 rounded-lg border bg-card p-4 text-card-foreground" style={{ borderColor: color }}>
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
                <h3 className="text-sm font-semibold">{notice.title}</h3>
                <p className="text-sm text-muted-foreground">{notice.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle><h2>Typography</h2></CardTitle>
          <CardDescription>A consistent rhythm, from the first heading to the smallest detail.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-xl font-semibold">Make room for better ideas.</h3>
          <p className="max-w-2xl">Good typography helps people find what matters. Adjust your heading and body tokens to see how family, weight, size, and line height shape this page.</p>
          <blockquote className="border-l-2 border-primary pl-4 text-muted-foreground">Clarity comes from giving each element a purpose.</blockquote>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <span className="text-xs text-muted-foreground">Caption · Updated just now</span>
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">font-family: var(--font-family-mono)</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
