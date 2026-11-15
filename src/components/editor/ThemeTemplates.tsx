"use client";

import { useId, useMemo, useState } from "react";
import { Check, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { themeTemplates, type ThemeTemplate } from "@/lib/theme-templates";
import { getTemplateSwatches } from "@/lib/saved-templates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTokens } from "@/store/features/themeSlice";
import { saveThemeTemplate } from "@/store/features/templatesSlice";
import { setFocusedPalette } from "@/store/features/uiSlice";
import { cn } from "@/lib/utils";

function Swatches({ colors }: { colors: string[] }) {
  return <div className="mb-3 flex h-8 overflow-hidden rounded-md border" aria-hidden="true">
    {colors.map((color, index) => <span key={index} className="flex-1" style={{ backgroundColor: color }} />)}
  </div>;
}

export function ThemeTemplates() {
  const id = useId();
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.theme.present);
  const { items: savedTemplates, ready, error } = useAppSelector((state) => state.templates);
  const focusedPalette = useAppSelector((state) => state.ui.focusedPalette);
  const [search, setSearch] = useState("");
  const [name, setName] = useState(focusedPalette && tokens.foundation.colors[focusedPalette] ? focusedPalette : "My theme");
  const [message, setMessage] = useState("");
  const currentSwatches = useMemo(() => getTemplateSwatches(tokens, focusedPalette ?? undefined), [tokens, focusedPalette]);
  const serializedTokens = useMemo(() => JSON.stringify(tokens), [tokens]);
  const templates = [...savedTemplates, ...themeTemplates];
  const selectedId = templates.find((template) => JSON.stringify(template.tokens) === serializedTokens)?.id;
  const matches = (template: ThemeTemplate) => `${template.name} ${template.description}`.toLowerCase().includes(search.toLowerCase().trim());
  const filteredSaved = savedTemplates.filter(matches);
  const filteredPresets = themeTemplates.filter(matches);

  function applyTemplate(template: ThemeTemplate) {
    dispatch(setTokens(structuredClone(template.tokens)));
    dispatch(setFocusedPalette(template.paletteName ?? null));
    setMessage(`${template.name} applied to your tokens and preview. Undo is available.`);
  }

  function saveTemplate(event: React.FormEvent) {
    event.preventDefault();
    const result = dispatch(saveThemeTemplate({ name, tokens, paletteName: focusedPalette ?? undefined }));
    if (result.ok) {
      setSearch("");
      setMessage(`${result.template.name} saved in this browser. Apply it from Your templates whenever you need it.`);
    } else {
      setMessage(result.error);
    }
  }

  function templateCard(template: ThemeTemplate) {
    const selected = selectedId === template.id;
    return <button
      key={template.id}
      type="button"
      aria-label={`Apply ${template.name} template`}
      aria-pressed={selected}
      onClick={() => applyTemplate(template)}
      disabled={selected}
      className={cn(
        "w-full rounded-lg border bg-background p-4 text-left transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default",
        selected && "border-slate-900 ring-1 ring-slate-900",
      )}
    >
      <Swatches colors={template.swatches} />
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 break-words text-sm font-semibold">{template.name}</span>
        {selected ? <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium"><Check className="h-3 w-3" aria-hidden="true" /> Applied</span>
          : <span className="shrink-0 text-xs text-muted-foreground">Apply theme</span>}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{template.description}</p>
    </button>;
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4" aria-label="Theme templates">
      <div className="shrink-0 space-y-2">
        <h2 className="text-sm font-semibold">Theme templates</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">Save your current theme or apply a starting point. Templates include every token and both color modes.</p>
      </div>
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input aria-label="Search templates" placeholder="Search templates…" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-2 pr-1">
        <form onSubmit={saveTemplate} className="space-y-3 rounded-lg border bg-background p-4" aria-label="Save current theme as template">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Current theme</h3>
            <Swatches colors={currentSwatches} />
            <p className="text-xs leading-relaxed text-muted-foreground">Includes your applied palette, token edits, and component styles. Saved templates stay available after a reload.</p>
            {tokens.generation && Object.keys(tokens.generation).length > 0 && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Generation recipes: {Object.values(tokens.generation).map((result) => result.title).join(", ")}.</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`} className="text-xs">Template name</Label>
            <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required placeholder="My theme" />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={!ready || !name.trim()}><Save className="h-4 w-4" aria-hidden="true" />Save as template</Button>
        </form>
        <p className="text-xs leading-relaxed text-muted-foreground" role="status" aria-live="polite">{message || error || "Applying a template replaces the current theme. Every change can be undone."}</p>
        <div className="space-y-3" aria-label="Your templates">
          <h3 className="text-xs font-semibold">Your templates{savedTemplates.length > 0 ? ` (${savedTemplates.length})` : ""}</h3>
          {!ready ? <p className="text-xs text-muted-foreground">Loading saved templates…</p>
            : !savedTemplates.length ? <p className="text-xs text-muted-foreground">Save the current theme above to reuse it here.</p>
            : filteredSaved.map(templateCard)}
        </div>
        <div className="space-y-3" aria-label="Built-in templates">
          <h3 className="text-xs font-semibold">Built-in templates</h3>
          {filteredPresets.map(templateCard)}
        </div>
        {filteredSaved.length === 0 && filteredPresets.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No templates match your search.</p>}
      </div>
    </section>
  );
}
