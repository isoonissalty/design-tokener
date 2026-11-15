"use client";

import { useCallback, useState } from "react";
import { Check, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyGeneration } from "@/store/features/themeSlice";
import { setGeneratorCategory } from "@/store/features/uiSlice";
import { contrastRatio, readableForeground } from "@/lib/palette-generator";
import type { GenerationCategory, GenerationResult } from "@/types/generation";
import { GenerationDetails, generatedValue } from "./GenerationDetails";
import { PaletteGenerator } from "./PaletteGenerator";
import { ScaleGenerator } from "./ScaleGenerator";

const categories: { id: GenerationCategory; label: string }[] = [
  { id: "colors", label: "Palette" },
  { id: "spacing", label: "Spacing" },
  { id: "radius", label: "Radius" },
  { id: "sizing", label: "Sizing" },
];

function PalettePreview({ result }: { result: GenerationResult }) {
  return (
    <div className="space-y-4" aria-label="Generated palette preview">
      {["primary", "secondary"].map((role) => {
        const family = result.parameters[`${role}Name`] || role;
        const tokens = result.tokens.filter((token) => token.key.startsWith(`${family}.`));
        const seed = tokens.find((token) => token.key.endsWith(".500"))?.value || "#000000";
        const foreground = readableForeground(seed);
        return (
          <div key={family} className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium capitalize">{role}{family !== role ? ` · ${family}` : ""}</span>
              <span className="font-mono text-muted-foreground">500 = {seed}</span>
            </div>
            <div className="grid grid-cols-11 gap-0.5">
              {tokens.map((token) => (
                <div key={token.key} className="min-w-0 text-center" title={`${token.key}: ${token.value}. ${token.reason}`}>
                  <div style={{ backgroundColor: token.value }} className="h-10 rounded-sm border border-black/5" />
                  <span className="mt-1 block text-[9px] text-muted-foreground">{token.key.split(".")[1]}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md px-3 py-1.5 text-xs font-medium capitalize" style={{ backgroundColor: seed, color: foreground }}>{role} example</span>
              <span className="text-[11px] text-muted-foreground">Text on seed: {contrastRatio(seed, foreground).toFixed(2)}:1</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScalePreview({ result, root }: { result: GenerationResult; root: number }) {
  const pixels = (value: string) => parseFloat(value) * (value.endsWith("rem") ? root : 1);
  const max = Math.max(...result.tokens.filter((token) => token.key !== "full").map((token) => pixels(token.value)), 1);
  if (result.category === "radius") {
    return (
      <div className="grid grid-cols-4 gap-3" aria-label="Generated radius preview">
        {result.tokens.map((token) => (
          <div key={token.key} className="space-y-1 text-center">
            <div className="mx-auto h-10 w-10 border-2 border-foreground/60 bg-muted" style={{ borderRadius: `${pixels(token.value)}px` }} />
            <p className="text-xs font-medium">{token.key}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{token.value}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2" aria-label={`Generated ${result.category} preview`}>
      {result.tokens.map((token) => (
        <div key={token.key} className="flex items-center gap-2 text-xs">
          <span className="w-14 shrink-0 font-mono">{token.key}</span>
          <div className="flex-1 min-w-0"><div className="h-3 rounded-sm bg-foreground/70" style={{ width: `${Math.max(0, pixels(token.value) / max * 100)}%` }} /></div>
          <span className="w-20 shrink-0 text-right font-mono text-[11px] text-muted-foreground">{token.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GeneratorPanel() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.theme.present);
  const category = useAppSelector((state) => state.ui.generatorCategory);
  const [results, setResults] = useState<Partial<Record<GenerationCategory, GenerationResult | null>>>({});
  const onPalette = useCallback((result: GenerationResult | null) => setResults((previous) => ({ ...previous, colors: result })), []);
  const onSpacing = useCallback((result: GenerationResult | null) => setResults((previous) => ({ ...previous, spacing: result })), []);
  const onRadius = useCallback((result: GenerationResult | null) => setResults((previous) => ({ ...previous, radius: result })), []);
  const onSizing = useCallback((result: GenerationResult | null) => setResults((previous) => ({ ...previous, sizing: result })), []);
  const callbacks = { spacing: onSpacing, radius: onRadius, sizing: onSizing };
  const result = results[category];
  const applied = !!result && JSON.stringify(tokens.generation?.[category]) === JSON.stringify(result) && result.tokens.every((token) => generatedValue(tokens, result, token.key) === token.value);
  const label = categories.find((item) => item.id === category)?.label.toLowerCase();
  const root = parseFloat(tokens.settings?.baseFontSize || "16px") || 16;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-3 pb-4 shrink-0">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold"><WandSparkles className="h-4 w-4" aria-hidden="true" />Token generators</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Build a consistent foundation. Every value comes with a reason and a reference.</p>
        </div>
        <div className="grid grid-cols-4 rounded-lg bg-muted p-1" aria-label="Generator category">
          {categories.map((item) => (
            <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => dispatch(setGeneratorCategory(item.id))} className={`rounded-md px-2 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${category === item.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto space-y-5 pr-1 pb-4">
        <div hidden={category !== "colors"}><PaletteGenerator onChange={onPalette} initial={tokens.generation?.colors} /></div>
        {(["spacing", "radius", "sizing"] as const).map((item) => (
          <div key={item} hidden={category !== item}><ScaleGenerator category={item} baseFontSize={tokens.settings?.baseFontSize || "16px"} onChange={callbacks[item]} /></div>
        ))}
        {result && <>
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview · {result.tokens.length} tokens</h3>
            {category === "colors" ? <PalettePreview result={result} /> : <ScalePreview result={result} root={root} />}
          </div>
          <GenerationDetails result={result} />
        </>}
      </div>
      <div className="border-t pt-3 shrink-0 space-y-2">
        <Button className="w-full" disabled={!result || applied} onClick={() => result && dispatch(applyGeneration(result))}>
          {applied ? <Check className="h-4 w-4" /> : <WandSparkles className="h-4 w-4" />}{applied ? `${category === "colors" ? "Palette" : categories.find((item) => item.id === category)?.label} applied` : `Apply ${label}`}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground" role="status">{applied ? "Applied to your foundation. Use Undo to restore." : category === "colors" ? result?.parameters.makePrimary === "false" ? "Adds named foundation palettes. Each apply can be undone." : "Adds primary + secondary palettes and connects them to your preview." : "Updates matching foundation tokens. Each apply can be undone."}</p>
      </div>
    </div>
  );
}
