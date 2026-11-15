"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DesignTokenSystem } from "@/types/token-system";
import { TokenColorPicker } from "./TokenColorPicker";
import { TokenReferenceSelector } from "./TokenReferenceSelector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
  const revision = useAppSelector((state) => state.theme.past.length);
  const [draft, setDraft] = useState({ source: value, value, revision });
  // Reset the draft during render when Undo, Load, or a generator changes it.
  // Cancel the pending text commit below so it cannot overwrite that change.
  if (draft.source !== value || draft.revision !== revision) setDraft({ source: value, value, revision });
  const localValue = draft.source === value && draft.revision === revision ? draft.value : value;
  const pendingCommit = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathKey = JSON.stringify(path);
  
  // Use a ref to hold the latest path to avoid stale closures in memoized children
  const pathRef = useRef(path);
  useEffect(() => { pathRef.current = path; }, [path]);

  // Stable update function that dispatches directly to Redux
  // Use pathRef.current to always get the latest path value
  const dispatchUpdate = useCallback((newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      dispatch(updateToken({ path: pathRef.current, value: newValue }));
    }
  }, [dispatch, onChange]);

  useEffect(() => () => {
    if (pendingCommit.current) clearTimeout(pendingCommit.current);
  }, [value, pathKey, revision]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setDraft({ source: value, value: nextValue, revision });
    if (pendingCommit.current) clearTimeout(pendingCommit.current);
    if (nextValue !== value) pendingCommit.current = setTimeout(() => dispatchUpdate(nextValue), 500);
  };

  const handleImmediateChange = useCallback((newValue: string) => {
    if (pendingCommit.current) clearTimeout(pendingCommit.current);
    setDraft({ source: value, value: newValue, revision });
    if (newValue !== value) dispatchUpdate(newValue);
  }, [dispatchUpdate, value, revision]);


  // Determine Type
  const isColor = typeHint === "color" ||
                  path.some(p => p.toLowerCase().includes("color") || p.toLowerCase().includes("bg") || p.toLowerCase().includes("border") && !p.includes("Width"));

  // Exclude borderWidth from being detected as color just because it has "border"
  const isBorderWidth = path.some(p => p.toLowerCase().includes("width"));

  const isSpacing = path.some(p => p.toLowerCase().includes("spacing") || p.toLowerCase().includes("padding") || p.toLowerCase().includes("gap"));
  const isRadius = path.some(p => p.toLowerCase().includes("radius"));
  const isTypographySize = path.some(p => p.toLowerCase().includes("fontsize"));
  const isTypographyWeight = path.some(p => p.toLowerCase().includes("fontweight") || p.toLowerCase().includes("weight"));
  const isFontFamily = path.some(p => p.toLowerCase().includes("fontfamily"));

  // Foundation tokens are definitions, Semantic/Component tokens are references.
  // If we are editing Foundation tokens, we usually want a text input or a color picker (hex).
  // If we are editing Semantic/Component tokens, we want Reference Selectors.
  const isFoundation = path[0] === "foundation";

  if (isFoundation || path[0] === "settings") {
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

      // Font Weight Dropdown
      if (isTypographyWeight) {
          const weights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
          return (
              <div className="flex items-center gap-2 mb-2">
                  <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
                  <div className="flex-1">
                      <Select value={localValue} onValueChange={handleImmediateChange}>
                        <SelectTrigger className="h-8 text-xs w-full bg-white">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent>
                          {weights.map(w => <SelectItem key={w} value={w} className="text-xs">{w}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
