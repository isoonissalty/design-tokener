"use client";
import { useCallback, useMemo, memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DesignTokenSystem } from "@/types/token-system";

interface TokenColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  tokens: DesignTokenSystem;
  ariaLabel?: string;
}

export const TokenColorPicker = memo(function TokenColorPicker({ value, onChange, tokens, ariaLabel = "Color" }: TokenColorPickerProps) {

  // Parse the current value to extract family and shade
  const { selectedFamily, selectedShade } = useMemo(() => {
    let family = "";
    let shade = "";
    
    if (value.startsWith("{color.") && value.endsWith("}")) {
      const parts = value.slice(1, -1).split(".");
      // format: color.blue.500
      if (parts.length === 3 && tokens.foundation.colors[parts[1]]?.[parts[2]]) {
        family = parts[1];
        shade = parts[2];
      } else if (parts.length === 2 && tokens.foundation.colors[parts[1]]?.DEFAULT) {
        family = parts[1];
        shade = "DEFAULT";
      }
    }
    return { selectedFamily: family, selectedShade: shade };
  }, [value, tokens.foundation.colors]);

  const families = useMemo(() => Object.keys(tokens.foundation.colors), [tokens.foundation.colors]);

  const shades = useMemo(() => {
    if (selectedFamily && tokens.foundation.colors[selectedFamily]) {
      return Object.keys(tokens.foundation.colors[selectedFamily]);
    }
    return [];
  }, [selectedFamily, tokens.foundation.colors]);

  const handleFamilyChange = useCallback((family: string) => {
    // Default to first shade or specific defaults
    const familyColors = tokens.foundation.colors[family] || {};
    const availableShades = Object.keys(familyColors);
    const defaultShade = availableShades.includes("500") 
      ? "500" 
      : availableShades.includes("DEFAULT") 
        ? "DEFAULT" 
        : availableShades[0];
    
    if (defaultShade) onChange(`{color.${family}.${defaultShade}}`);
  }, [tokens.foundation.colors, onChange]);

  const handleShadeChange = useCallback((shade: string) => {
    if (selectedFamily && shade) onChange(`{color.${selectedFamily}.${shade}}`);
  }, [selectedFamily, onChange]);

  return (
    <div className="flex gap-2 w-full">
      <Select value={selectedFamily} onValueChange={handleFamilyChange}>
        <SelectTrigger aria-label={`${ariaLabel} family`} className="w-[120px] h-8 text-xs bg-background">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {families.map((f) => (
            <SelectItem key={f} value={f} className="text-xs bg-background">
              <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: tokens.foundation.colors[f]["500"] || tokens.foundation.colors[f]["DEFAULT"] }}
                />
                {f}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        key={selectedFamily} 
        value={selectedShade} 
        onValueChange={handleShadeChange} 
        disabled={!selectedFamily}
      >
        <SelectTrigger aria-label={`${ariaLabel} shade`} className="flex-1 h-8 text-xs bg-background">
          <SelectValue placeholder="Shade" />
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {shades.map((s) => (
            <SelectItem key={s} value={s} className="text-xs bg-background">
              <div className="flex items-center gap-2">
                 <div
                    className="w-3 h-3 rounded-sm border"
                    style={{ backgroundColor: tokens.foundation.colors[selectedFamily]?.[s] }}
                />
                {s}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
