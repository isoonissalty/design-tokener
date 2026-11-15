"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateRadius, generateSizing, generateSpacing,
  type RadiusMethod, type ScaleUnit, type SpacingMethod,
} from "@/lib/scale-generators";
import type { GenerationResult } from "@/types/generation";

interface ScaleGeneratorProps {
  category: "spacing" | "radius" | "sizing";
  baseFontSize: string;
  onChange: (result: GenerationResult | null) => void;
}

const selectStyle = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ScaleGenerator({ category, baseFontSize, onChange }: ScaleGeneratorProps) {
  const id = useId();
  const [unit, setUnit] = useState<ScaleUnit>("rem");
  const [spacingMethod, setSpacingMethod] = useState<SpacingMethod>("grid-4");
  const [radiusMethod, setRadiusMethod] = useState<RadiusMethod>("tailwind");
  const [scale, setScale] = useState("1");
  const [base, setBase] = useState("20");
  const [step, setStep] = useState("4");
  const [container, setContainer] = useState("80");
  const rootMatch = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(baseFontSize);
  const rootFontSize = rootMatch ? Number(rootMatch[1]) : NaN;

  const result = useMemo(() => {
    try {
      if (!Number.isFinite(rootFontSize) || rootFontSize <= 0) {
        throw new Error("Set a positive pixel root font size in Tokens → Settings to calculate this scale.");
      }
      const config = { unit, rootFontSize };
      const value = category === "spacing"
        ? generateSpacing({ ...config, method: spacingMethod, scale: Number(scale) })
        : category === "radius"
          ? generateRadius({ ...config, method: radiusMethod, scale: Number(scale) })
          : generateSizing({ ...config, base: Number(base), step: Number(step), container: Number(container) });
      return { value, error: null };
    } catch (error) {
      return { value: null, error: error instanceof Error ? error.message : "Check the scale inputs." };
    }
  }, [category, unit, rootFontSize, spacingMethod, radiusMethod, scale, base, step, container]);

  useEffect(() => { onChange(result.value); }, [onChange, result]);

  return (
    <div className="space-y-4">
      {category === "spacing" && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-spacing-method`}>Spacing method</Label>
          <select id={`${id}-spacing-method`} className={selectStyle} value={spacingMethod} onChange={event => setSpacingMethod(event.target.value as SpacingMethod)}>
            <option value="grid-4">4px grid · flexible everyday spacing</option>
            <option value="grid-8">8px grid · larger layout rhythm</option>
            <option value="carbon">Carbon · published spacing scale</option>
          </select>
        </div>
      )}
      {category === "radius" && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-radius-method`}>Radius method</Label>
          <select id={`${id}-radius-method`} className={selectStyle} value={radiusMethod} onChange={event => setRadiusMethod(event.target.value as RadiusMethod)}>
            <option value="tailwind">Tailwind v3 · 2, 4, 6, 8, 12, 16, 24px</option>
            <option value="material">Material 3 · 4, 8, 12, 16, 28px</option>
          </select>
        </div>
      )}
      {category !== "sizing" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${id}-scale`}>Scale factor</Label>
            <Input id={`${id}-scale`} type="number" min="0.01" max="4" step="0.25" value={scale} onChange={event => setScale(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-unit`}>Output unit</Label>
            <select id={`${id}-unit`} className={selectStyle} value={unit} onChange={event => setUnit(event.target.value as ScaleUnit)}>
              <option value="rem">rem</option><option value="px">px</option>
            </select>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`${id}-base`}>Smallest width (rem)</Label>
              <Input id={`${id}-base`} type="number" min="0.01" max="256" step="1" value={base} onChange={event => setBase(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-step`}>Width increment (rem)</Label>
              <Input id={`${id}-step`} type="number" min="0.01" max="64" step="1" value={step} onChange={event => setStep(event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`${id}-container`}>Container width (rem)</Label>
              <Input id={`${id}-container`} type="number" min="0.01" max="512" step="1" value={container} onChange={event => setContainer(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-unit`}>Output unit</Label>
              <select id={`${id}-unit`} className={selectStyle} value={unit} onChange={event => setUnit(event.target.value as ScaleUnit)}>
                <option value="rem">rem</option><option value="px">px</option>
              </select>
            </div>
          </div>
        </>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {category === "sizing"
          ? "Widths start at the smallest size and grow by the increment. The container sets the maximum content width."
          : "1× uses the reference dimensions. Changing the factor creates a custom variation."}
        {Number.isFinite(rootFontSize) && ` Conversion: 1rem = ${rootFontSize}px from your root setting.`}
      </p>
      {result.error && <p role="alert" className="text-sm text-destructive">{result.error}</p>}
    </div>
  );
}
