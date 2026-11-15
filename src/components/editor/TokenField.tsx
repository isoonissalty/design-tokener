"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DesignTokenSystem } from "@/types/token-system";
import { TokenColorPicker } from "./TokenColorPicker";
import { TokenReferenceSelector } from "./TokenReferenceSelector";
import { useAppDispatch } from "@/store/hooks";
import { updateToken } from "@/store/features/themeSlice";

interface TokenFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  path: string[];
  tokens: DesignTokenSystem;
  typeHint?: string;
}

export function TokenField({ label, value, onChange, path, tokens, typeHint }: TokenFieldProps) {
  const dispatch = useAppDispatch();
  const inputId = useId();
  const fieldLabel = `${path.join(" · ")} (${label})`;
  // Keep one source of truth. Delayed local effects can replay stale values after
  // undo, imports, palette selection, or navigating away from an input.
  const update = (newValue: string) => {
    if (onChange) onChange(newValue);
    else dispatch(updateToken({ path, value: newValue }));
  };

  const lowerPath = path.map(part => part.toLowerCase());
  const isFoundation = path[0] === "foundation";
  const isBorderWidth = lowerPath.includes("borderwidth");
  const isColor = !isBorderWidth && (typeHint === "color" || lowerPath.some(part => ["colors", "color", "bg", "border"].includes(part)));
  const isSpacing = lowerPath.some(part => ["spacing", "padding", "gap"].includes(part));
  const isRadius = lowerPath.includes("radius");
  const isTypographySize = lowerPath.includes("fontsize");
  const isTypographyWeight = lowerPath.some(part => ["fontweight", "weight"].includes(part));
  const isFontFamily = lowerPath.includes("fontfamily");
  const isLineHeight = lowerPath.includes("lineheight");
  const isLetterSpacing = lowerPath.includes("letterspacing");

  let options: { label: string; value: string; previewValue?: string }[] = [];
  const references = (values: Record<string, string>, prefix: string) => Object.entries(values).map(([key, previewValue]) => ({ label: key, value: `{${prefix}.${key}}`, previewValue }));
  if (!isFoundation) {
    if (isSpacing) options = references(tokens.foundation.spacing, "space");
    else if (isRadius) options = references(tokens.foundation.radius, "radius");
    else if (isTypographySize) options = references(tokens.foundation.typography.size, "font.size");
    else if (isTypographyWeight) options = references(tokens.foundation.typography.weight, "font.weight");
    else if (isFontFamily) options = references(tokens.foundation.typography.family, "font.family");
    else if (isLineHeight) options = references(tokens.foundation.typography.lineHeight, "line.height");
    else if (isLetterSpacing) options = references(tokens.foundation.typography.letterSpacing, "letter.spacing");
  }

  // Native color inputs accept six-digit hex only. Other CSS color formats remain
  // editable in the text field without being silently replaced by black.
  const nativeColor = /^#[0-9a-f]{6}$/i.test(value) ? value : /^#[0-9a-f]{3}$/i.test(value)
    ? `#${value.slice(1).split("").map(char => char + char).join("")}` : null;

  return (
    <div className="flex items-start gap-2 mb-3">
      <Label htmlFor={inputId} className="w-24 shrink-0 truncate pt-2 text-xs sm:w-28" title={fieldLabel}>{label}</Label>
      <div className="min-w-0 flex-1 space-y-2">
        {isColor && !isFoundation && <TokenColorPicker value={value} onChange={update} tokens={tokens} ariaLabel={fieldLabel} />}
        {options.length > 0 && <TokenReferenceSelector value={value} onChange={update} options={options} ariaLabel={`${fieldLabel} reference`} />}
        {isFoundation && isTypographyWeight ? (
          <Select value={value} onValueChange={update}>
            <SelectTrigger id={inputId} aria-label={fieldLabel} className="h-8 text-xs w-full bg-background">
              <SelectValue placeholder="Select weight" />
            </SelectTrigger>
            <SelectContent>
              {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map(weight => <SelectItem key={weight} value={weight}>{weight}</SelectItem>)}
              {!/^[1-9]00$/.test(value) && value && <SelectItem value={value}>{value}</SelectItem>}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex min-w-0 gap-2">
            {isColor && nativeColor && <Input type="color" value={nativeColor} onChange={event => update(event.target.value)} aria-label={`${fieldLabel} color picker`} className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer shrink-0" />}
            <Input id={inputId} aria-label={fieldLabel} value={value} onChange={event => update(event.target.value)} className="h-8 min-w-0 text-xs font-mono flex-1" spellCheck={false} />
          </div>
        )}
      </div>
    </div>
  );
}
