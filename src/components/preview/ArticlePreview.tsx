"use client";

import { useId, useState } from "react";
import { ArrowUpRight, BookOpen, Check, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeSample = `.feature-card {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}`;

const sections = [
  { id: "overview", label: "Overview" },
  { id: "foundations", label: "Start with foundations" },
  { id: "applying-tokens", label: "Apply your tokens" },
  { id: "next-steps", label: "Keep it consistent" },
] as const;

export function ArticlePreview() {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [copyStatus, setCopyStatus] = useState("");
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);
  const sectionId = (name: string) => `article-${instanceId}-${name}`;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(codeSample);
      setCopyStatus("Code copied to clipboard.");
    } catch {
      setCopyStatus("Copy is unavailable. Select the code below to copy it manually.");
    }
  }

  return (
    <div className="preview-page mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <span>Field notes</span>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Design systems</span>
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <aside className="min-w-0 flex-[1_1_12rem] rounded-lg border bg-card p-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</div>
          <nav aria-label="Article contents" className="flex flex-col gap-1">
            {sections.map(section => (
              <a
                key={section.id}
                href={`#${sectionId(section.id)}`}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">Guide · 5 minute read</div>
        </aside>

        <article className="min-w-0 flex-[3_1_28rem] space-y-8" aria-labelledby={sectionId("title")}>
          <header className="space-y-4 border-b pb-6">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">The essentials</span>
            <h1 id={sectionId("title")} className="break-words">Design with a shared language.</h1>
            <p className="text-muted-foreground">A practical guide to turning small design decisions into a system that feels consistent, from the first button to the final page.</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground" aria-hidden="true">JL</span>
              <span>Jamie Lee</span>
              <span aria-hidden="true">·</span>
              <time dateTime="2026-10-20">October 20, 2026</time>
            </div>
          </header>

          <section id={sectionId("overview")} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h2>Overview</h2>
            <p>Every interface is built from decisions: how much space a card needs, which color signals an action, and how a heading leads the eye. Design tokens give those decisions names, so you can reuse them with confidence.</p>
            <blockquote className="border-l-2 border-primary pl-4 font-serif text-lg italic text-muted-foreground">“A coherent system makes room for expression. It gives every detail a place to belong.”</blockquote>
            <p>Begin with a few useful choices. A clear type scale, a small spacing rhythm, and purposeful colors will carry you further than a large collection of unrelated styles.</p>
          </section>

          <section id={sectionId("foundations")} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h2>Start with foundations</h2>
            <p>Foundations describe the raw materials of your interface. Keep them predictable, then assign meaning through semantic tokens.</p>
            <ul className="list-disc space-y-3 pl-5 marker:text-primary">
              <li><strong>Color:</strong> build a palette with clear differences between surfaces, text, and actions.</li>
              <li><strong>Typography:</strong> choose a readable body style and a deliberate hierarchy of headings.</li>
              <li><strong>Spacing:</strong> use a repeating scale to connect related elements and separate sections.</li>
            </ul>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
              <Info className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="space-y-2"><h3>Name the purpose</h3><p className="text-muted-foreground">A name such as <code className="break-all rounded bg-muted px-1 font-mono text-sm">color-bg-surface</code> tells you where a color belongs, even when its value changes between light and dark mode.</p></div>
            </div>
          </section>

          <section id={sectionId("applying-tokens")} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h2>Apply your tokens</h2>
            <p>Reference tokens in the places where your components need a design decision. The card below uses the same surface, text, radius, and spacing language as the rest of the interface.</p>
            <div className="min-w-0 overflow-hidden rounded-lg border bg-muted/40">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">components.css</span>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  {copyStatus === "Code copied to clipboard." ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  Copy code
                </Button>
              </div>
              <pre className="max-w-full overflow-x-auto p-4 font-mono text-sm leading-relaxed" tabIndex={0} aria-label="CSS token example"><code>{codeSample}</code></pre>
            </div>
            <div className="min-h-5 text-xs text-muted-foreground" role="status">{copyStatus}</div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">In practice</div>
              <h3 className="mb-2">One card, many possibilities.</h3>
              <p className="text-muted-foreground">Change the theme in the editor to see how shared decisions shape this article and its examples.</p>
            </div>
          </section>

          <section id={sectionId("next-steps")} tabIndex={-1} className="scroll-mt-6 space-y-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h2>Keep it consistent</h2>
            <p>A system becomes useful when you try it in real layouts. Review your choices in both color modes and at different widths, then refine the decisions that make reading and interaction easier.</p>
            <ol className="list-decimal space-y-3 pl-5 marker:font-medium marker:text-primary">
              <li>Choose a starting palette and check text against each surface.</li>
              <li>Read a full page to assess type size, line height, and hierarchy.</li>
              <li>Try forms and buttons with a keyboard to review focus and interaction states.</li>
            </ol>
            <a href={`#${sectionId("overview")}`} className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Revisit the overview<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </section>

          <footer className="space-y-3 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium">Was this guide useful?</span>
              <div className="flex gap-2" role="group" aria-label="Guide feedback">
                <Button variant={feedback === "yes" ? "secondary" : "outline"} size="sm" aria-pressed={feedback === "yes"} onClick={() => setFeedback("yes")}>Yes, thanks</Button>
                <Button variant={feedback === "no" ? "secondary" : "outline"} size="sm" aria-pressed={feedback === "no"} onClick={() => setFeedback("no")}>Needs more detail</Button>
              </div>
            </div>
            <div className="min-h-5 text-xs text-muted-foreground" role="status">{feedback ? "Thanks for trying the guide. Your feedback is kept in this preview only." : ""}</div>
          </footer>
        </article>
      </div>
    </div>
  );
}
