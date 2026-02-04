"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DesignTokenSystem } from "@/types/token-system";
import { TokenColorPicker } from "./TokenColorPicker";
import { TokenReferenceSelector } from "./TokenReferenceSelector";
import { useDebounce } from "@/hooks/use-debounce";

interface TokenFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  path: string[];
  tokens: DesignTokenSystem;
  typeHint?: string;
}

export function TokenField({ label, value, onChange, path, tokens, typeHint }: TokenFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);
  
  // Track the last value we sent to parent to prevent the debounce from reverting immediate changes
  const lastPropagatedValue = useRef(value);

  // Sync external changes to local state
  useEffect(() => {
    setLocalValue(value);
    lastPropagatedValue.current = value;
  }, [value]);

  // Handle debounced updates for text input ONLY
  // Only propagate if the debounced value differs from what we last sent
  useEffect(() => {
    if (debouncedValue !== lastPropagatedValue.current) {
      lastPropagatedValue.current = debouncedValue;
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleImmediateChange = useCallback((newValue: string) => {
    // For immediate changes (selects, color pickers), update immediately
    // Also update the ref so debounce doesn't revert it
    lastPropagatedValue.current = newValue;
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  // Determine Type
  const isColor = typeHint === "color" ||
                  path.some(p => p.toLowerCase().includes("color") || p.toLowerCase().includes("bg") || p.toLowerCase().includes("border") && !p.includes("Width"));

  // Exclude borderWidth from being detected as color just because it has "border"
  const isBorderWidth = path.some(p => p.toLowerCase().includes("width"));

  const isSpacing = path.some(p => p.toLowerCase().includes("spacing") || p.toLowerCase().includes("padding") || p.toLowerCase().includes("gap"));
  const isRadius = path.some(p => p.toLowerCase().includes("radius"));
  const isSizing = path.some(p => p.toLowerCase().includes("size") || p.toLowerCase().includes("width") || p.toLowerCase().includes("height"));
  const isTypographySize = path.some(p => p.toLowerCase().includes("fontsize"));
  const isTypographyWeight = path.some(p => p.toLowerCase().includes("fontweight"));
  const isFontFamily = path.some(p => p.toLowerCase().includes("fontfamily"));

  // Foundation tokens are definitions, Semantic/Component tokens are references.
  // If we are editing Foundation tokens, we usually want a text input or a color picker (hex).
  // If we are editing Semantic/Component tokens, we want Reference Selectors.
  const isFoundation = path[0] === "foundation";

  if (isFoundation) {
      // Editing the source of truth
      if (isColor && !value.startsWith("{")) {
          return (
              <div className="flex items-center gap-2 mb-2">
                  <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
                  <div className="flex-1 flex gap-2">
                       <div className="relative">
                            <Input
                                type="color"
                                value={value}
                                onChange={(e) => handleImmediateChange(e.target.value)}
                                className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer shrink-0"
                            />
                        </div>
                        <Input
                            type="text"
                            value={localValue}
                            onChange={handleInputChange}
                            className="h-8 text-xs font-mono"
                        />
                  </div>
              </div>
          );
      }
      // Default text input for other foundation values
       return (
          <div className="flex items-center gap-2 mb-2">
              <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
              <Input
                  type="text"
                  value={localValue}
                  onChange={handleInputChange}
                  className="h-8 text-xs font-mono flex-1"
              />
          </div>
      );
  }

  // Semantic / Component Mode -> Use Selectors

  if (isColor && !isBorderWidth) {
      return (
        <div className="flex items-center gap-2 mb-2">
            <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
            <div className="flex-1">
                 <TokenColorPicker value={value} onChange={handleImmediateChange} tokens={tokens} />
            </div>
        </div>
      );
  }

  // Generic Reference Selectors
  let options: { label: string, value: string, previewValue?: string }[] = [];

  if (isSpacing) {
      options = Object.entries(tokens.foundation.spacing).map(([k, v]) => ({ label: k, value: `{space.${k}}`, previewValue: v }));
  } else if (isRadius) {
      options = Object.entries(tokens.foundation.radius).map(([k, v]) => ({ label: k, value: `{radius.${k}}`, previewValue: v }));
  } else if (isTypographySize) {
      options = Object.entries(tokens.foundation.typography.size).map(([k, v]) => ({ label: k, value: `{font.size.${k}}`, previewValue: v }));
  } else if (isTypographyWeight) {
      options = Object.entries(tokens.foundation.typography.weight).map(([k, v]) => ({ label: k, value: `{font.weight.${k}}`, previewValue: v }));
  } else if (isFontFamily) {
      options = Object.entries(tokens.foundation.typography.family).map(([k, v]) => ({ label: k, value: `{font.family.${k}}`, previewValue: v }));
  }

  if (options.length > 0) {
      return (
        <div className="flex items-center gap-2 mb-2">
            <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
            <div className="flex-1">
                 <TokenReferenceSelector value={value} onChange={handleImmediateChange} options={options} />
            </div>
        </div>
      );
  }

  // Fallback to text input
  return (
    <div className="flex items-center gap-2 mb-2">
      <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
      <Input
        value={localValue}
        onChange={handleInputChange}
        className="h-8 text-xs font-mono flex-1"
      />
    </div>
  );
}
