"use client";

import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePalette, deriveSecondaryColor, isValidHex, normalizeHex, isValidPaletteName, randomPaletteSeed, type PaletteMethod, type SecondaryRelationship } from "@/lib/palette-generator";
import { useAppSelector } from "@/store/hooks";
import type { GenerationResult } from "@/types/generation";

const methodNotes: Record<PaletteMethod, string> = {
  oklch: "Perceptual lightness with a consistent hue. Chroma is reduced where needed to fit sRGB displays.",
  hsl: "A familiar hue and saturation scale. Equal lightness steps can look uneven across different hues.",
  rgb: "Mixes the seed with white for tints and black for shades in encoded sRGB.",
};

export function PaletteGenerator({ onChange, initial }: { onChange: (result: GenerationResult | null) => void; initial?: GenerationResult }) {
  const colors = useAppSelector((state) => state.theme.present.foundation.colors);
  const [method, setMethod] = useState<PaletteMethod>(() => {
    const value = initial?.parameters.method;
    return value === "hsl" || value === "rgb" ? value : "oklch";
  });
  const [primary, setPrimary] = useState(initial?.parameters.primary || "#3b82f6");
  const [secondary, setSecondary] = useState(initial?.parameters.secondary || "#8b5cf6");
  const [primaryName, setPrimaryName] = useState(initial?.parameters.primaryName || "primary");
  const [secondaryName, setSecondaryName] = useState(initial?.parameters.secondaryName || "secondary");
  const [makePrimary, setMakePrimary] = useState(initial?.parameters.makePrimary !== "false");
  const [relationship, setRelationship] = useState<SecondaryRelationship>(() => {
    const value = initial?.parameters.relationship;
    return value === "analogous" || value === "complementary" || value === "triadic" ? value : "custom";
  });

  const primaryValid = isValidHex(primary);
  const secondaryValid = isValidHex(secondary);
  const normalizedPrimaryName = primaryName.trim().toLowerCase();
  const normalizedSecondaryName = secondaryName.trim().toLowerCase();
  const primaryNameValid = isValidPaletteName(normalizedPrimaryName);
  const secondaryNameValid = isValidPaletteName(normalizedSecondaryName) && normalizedSecondaryName !== normalizedPrimaryName;
  const displayedSecondary = relationship !== "custom" && primaryValid ? deriveSecondaryColor(primary, relationship, method) : secondary;
  const result = useMemo(() => {
    if (!isValidHex(primary) || (relationship === "custom" && !isValidHex(secondary)) || !primaryNameValid || !secondaryNameValid) return null;
    const generated = generatePalette({ primary, secondary: relationship === "custom" ? secondary : primary, method, relationship });
    return {
      ...generated,
      summary: `${generated.summary.replace(/The live theme uses .*$/, "")}${makePrimary ? "Applies both named palettes to the theme's primary and secondary colors, with matching focus and button states." : "Adds foundation palettes only; semantic colors and button mappings keep their current values."}`,
      parameters: { ...generated.parameters, primaryName: normalizedPrimaryName, secondaryName: normalizedSecondaryName, makePrimary: String(makePrimary) },
      tokens: generated.tokens.map((token) => ({ ...token, key: `${token.key.startsWith("primary.") ? normalizedPrimaryName : normalizedSecondaryName}.${token.key.split(".")[1]}` })),
    };
  }, [primary, secondary, method, relationship, primaryNameValid, secondaryNameValid, normalizedPrimaryName, normalizedSecondaryName, makePrimary]);

  useEffect(() => { onChange(result); }, [result, onChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="palette-method">Color method</Label>
        <select id="palette-method" value={method} onChange={(event) => setMethod(event.target.value as PaletteMethod)} className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="oklch">OKLCH · perceptual (recommended)</option>
          <option value="hsl">HSL · hue, saturation, lightness</option>
          <option value="rgb">sRGB · tints and shades</option>
        </select>
        <p className="text-xs leading-relaxed text-muted-foreground">{methodNotes[method]}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="primary-hex">Primary color</Label>
          <div className="flex gap-2">
            <Input type="color" aria-label="Pick primary color" value={primaryValid ? normalizeHex(primary) : "#3b82f6"} onChange={(event) => setPrimary(event.target.value)} className="h-9 w-10 shrink-0 cursor-pointer p-1" />
            <Input id="primary-hex" value={primary} onChange={(event) => setPrimary(event.target.value)} aria-invalid={!primaryValid} aria-describedby={!primaryValid ? "primary-error" : undefined} spellCheck={false} className="min-w-0 font-mono text-xs" />
          </div>
          {!primaryValid && <p id="primary-error" className="text-xs text-destructive">Use a 3 or 6 digit hex color.</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secondary-hex">Secondary color</Label>
          <div className="flex gap-2">
            <Input type="color" aria-label="Pick secondary color" value={isValidHex(displayedSecondary) ? normalizeHex(displayedSecondary) : "#8b5cf6"} onChange={(event) => { setRelationship("custom"); setSecondary(event.target.value); }} className="h-9 w-10 shrink-0 cursor-pointer p-1" />
            <Input id="secondary-hex" value={displayedSecondary} onChange={(event) => { setRelationship("custom"); setSecondary(event.target.value); }} aria-invalid={relationship === "custom" && !secondaryValid} aria-describedby={relationship === "custom" && !secondaryValid ? "secondary-error" : undefined} spellCheck={false} className="min-w-0 font-mono text-xs" />
          </div>
          {relationship === "custom" && !secondaryValid && <p id="secondary-error" className="text-xs text-destructive">Use a 3 or 6 digit hex color.</p>}
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => setPrimary(randomPaletteSeed())}><Shuffle className="h-3.5 w-3.5" />Random primary seed</Button>
      <div className="space-y-1.5">
        <Label htmlFor="secondary-relationship">Secondary relationship</Label>
        <select id="secondary-relationship" value={relationship} onChange={(event) => {
          const next = event.target.value as SecondaryRelationship;
          if (next === "custom") setSecondary(displayedSecondary);
          setRelationship(next);
        }} className="h-9 w-full rounded-md border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="custom">Custom · pick any secondary color</option>
          <option value="complementary">Complementary · +180°</option>
          <option value="analogous">Analogous · +30°</option>
          <option value="triadic">Triadic partner · +120°</option>
        </select>
        <p className="text-xs leading-relaxed text-muted-foreground">Both colors stay exact at 500. Editing the secondary selects Custom.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="primary-name">Primary palette name</Label>
          <Input id="primary-name" value={primaryName} onChange={(event) => setPrimaryName(event.target.value)} aria-invalid={!primaryNameValid} maxLength={40} spellCheck={false} className="text-xs" />
          <p className={`text-xs ${primaryNameValid ? "text-muted-foreground" : "text-destructive"}`}>{!primaryNameValid ? "Start with a letter; use letters, numbers, or hyphens." : Object.hasOwn(colors, normalizedPrimaryName) ? `Updates ${normalizedPrimaryName}; custom shades are preserved.` : `Adds color.${normalizedPrimaryName}.50–950.`}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secondary-name">Secondary palette name</Label>
          <Input id="secondary-name" value={secondaryName} onChange={(event) => setSecondaryName(event.target.value)} aria-invalid={!secondaryNameValid} maxLength={40} spellCheck={false} className="text-xs" />
          <p className={`text-xs ${secondaryNameValid ? "text-muted-foreground" : "text-destructive"}`}>{!secondaryNameValid ? "Use a different valid palette name." : Object.hasOwn(colors, normalizedSecondaryName) ? `Updates ${normalizedSecondaryName}; custom shades are preserved.` : `Adds color.${normalizedSecondaryName}.50–950.`}</p>
        </div>
      </div>
      <label htmlFor="palette-use-theme" className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
        <input id="palette-use-theme" type="checkbox" checked={makePrimary} onChange={(event) => setMakePrimary(event.target.checked)} className="mt-0.5 accent-primary" />
        Use for theme primary and secondary colors, focus rings, and buttons in light and dark mode
      </label>
    </div>
  );
}
