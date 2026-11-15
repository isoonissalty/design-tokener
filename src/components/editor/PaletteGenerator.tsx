"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generatePalette, deriveSecondaryColor, isValidHex, normalizeHex, type PaletteMethod, type SecondaryRelationship } from "@/lib/palette-generator";
import type { GenerationResult } from "@/types/generation";

const methodNotes: Record<PaletteMethod, string> = {
  oklch: "Perceptual lightness with a consistent hue. Chroma is reduced where needed to fit sRGB displays.",
  hsl: "A familiar hue and saturation scale. Equal lightness steps can look uneven across different hues.",
  rgb: "Mixes the seed with white for tints and black for shades in encoded sRGB.",
};

export function PaletteGenerator({ onChange, initial }: { onChange: (result: GenerationResult | null) => void; initial?: GenerationResult }) {
  const [method, setMethod] = useState<PaletteMethod>(() => {
    const value = initial?.parameters.method;
    return value === "hsl" || value === "rgb" ? value : "oklch";
  });
  const [primary, setPrimary] = useState(initial?.parameters.primary || "#3b82f6");
  const [secondary, setSecondary] = useState(initial?.parameters.secondary || "#8b5cf6");
  const [relationship, setRelationship] = useState<SecondaryRelationship>(() => {
    const value = initial?.parameters.relationship;
    return value === "analogous" || value === "complementary" || value === "triadic" ? value : "custom";
  });

  const primaryValid = isValidHex(primary);
  const secondaryValid = isValidHex(secondary);
  const displayedSecondary = relationship !== "custom" && primaryValid ? deriveSecondaryColor(primary, relationship, method) : secondary;
  const result = useMemo(() => {
    if (!isValidHex(primary) || (relationship === "custom" && !isValidHex(secondary))) return null;
    return generatePalette({ primary, secondary: relationship === "custom" ? secondary : primary, method, relationship });
  }, [primary, secondary, method, relationship]);

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
        <p className="text-xs leading-relaxed text-muted-foreground">Both colors stay exact at 500. The live theme uses 600 in light mode and 400 in dark mode. Editing the secondary selects Custom.</p>
      </div>
    </div>
  );
}
