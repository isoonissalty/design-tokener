"use client";

import { useId, useMemo, useState } from "react";
import { Check, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyGeneratedPalette, generatePalette, isValidPaletteName, normalizeHexColor, PALETTE_SHADES, randomPaletteSeed } from "@/lib/palette-generator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTokens } from "@/store/features/themeSlice";

export function PaletteGenerator() {
  const id = useId();
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.theme.present);
  const [seed, setSeed] = useState("#6366f1");
  const [name, setName] = useState("brand");
  const [makePrimary, setMakePrimary] = useState(true);
  const [status, setStatus] = useState("");
  const normalizedSeed = normalizeHexColor(seed);
  const palette = useMemo(() => normalizedSeed ? generatePalette(normalizedSeed) : null, [normalizedSeed]);
  const normalizedName = name.trim().toLowerCase();
  const validName = isValidPaletteName(normalizedName);
  const isExisting = Object.hasOwn(tokens.foundation.colors, normalizedName);

  function apply() {
    if (!palette || !validName) return;
    dispatch(setTokens(applyGeneratedPalette(tokens, normalizedName, palette, makePrimary)));
    setStatus(`Applied ${normalizedName}. Refine its shades in Foundation → Colors, or undo to restore your previous theme.`);
  }

  return (
    <section className="space-y-4 rounded-lg border bg-background p-4" aria-labelledby={`${id}-title`}>
      <div>
        <h3 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4" aria-hidden="true" /> Generate a palette</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Start with one color. Get 11 shades from 50 to 950, then refine them in the editor.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${id}-seed`} className="text-xs">Seed color · shade 500</Label>
        <div className="flex items-center gap-2">
          <Input type="color" aria-label="Choose palette seed color" value={normalizedSeed ?? "#6366f1"} onChange={(event) => { setSeed(event.target.value); setStatus(""); }} className="h-9 w-11 shrink-0 cursor-pointer p-1" />
          <Input id={`${id}-seed`} value={seed} onChange={(event) => { setSeed(event.target.value); setStatus(""); }} className="min-w-0 flex-1 font-mono text-xs" spellCheck={false} maxLength={7} aria-invalid={!normalizedSeed} aria-describedby={!normalizedSeed ? `${id}-seed-error` : undefined} />
          <Button type="button" variant="outline" size="icon" title="Generate a random seed color" aria-label="Generate a random seed color" onClick={() => { setSeed(randomPaletteSeed()); setStatus(""); }}><Shuffle className="h-4 w-4" /></Button>
        </div>
        {!normalizedSeed && <p id={`${id}-seed-error`} className="text-xs text-destructive" role="alert">Enter a hex color, such as #6366f1 or #63f.</p>}
      </div>

      {palette && <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11" aria-label="Generated palette preview">
        {PALETTE_SHADES.map((shade) => <div key={shade} className="min-w-0 text-center" title={`${shade}: ${palette[shade]}`}>
          <div className={`h-10 rounded border ${shade === "500" ? "ring-2 ring-foreground ring-offset-1" : ""}`} style={{ backgroundColor: palette[shade] }} />
          <span className="mt-1 block text-[10px] text-muted-foreground">{shade}</span>
        </div>)}
      </div>}

      <div className="space-y-2">
        <Label htmlFor={`${id}-name`} className="text-xs">Palette name</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => { setName(event.target.value); setStatus(""); }} className="text-xs" maxLength={40} placeholder="brand" spellCheck={false} aria-invalid={!validName} aria-describedby={`${id}-name-help`} />
        <p id={`${id}-name-help`} className={`text-xs ${validName ? "text-muted-foreground" : "text-destructive"}`}>
          {!validName ? "Start with a letter; use lowercase letters, numbers, or hyphens." : isExisting ? `Updates the existing ${normalizedName} palette. Other shades are preserved.` : `Adds color.${normalizedName}.50 through color.${normalizedName}.950.`}
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed" htmlFor={`${id}-primary`}>
        <input id={`${id}-primary`} type="checkbox" className="mt-0.5 accent-primary" checked={makePrimary} onChange={(event) => { setMakePrimary(event.target.checked); setStatus(""); }} />
        Use for primary color, focus rings, and buttons in light and dark mode
      </label>
      <Button type="button" className="w-full" size="sm" disabled={!palette || !validName} onClick={apply}><Check className="h-4 w-4" />Apply palette</Button>
      <p role="status" aria-live="polite" className="empty:hidden text-xs leading-relaxed text-muted-foreground">{status}</p>
    </section>
  );
}
