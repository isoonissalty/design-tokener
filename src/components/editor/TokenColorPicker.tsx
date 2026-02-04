"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DesignTokenSystem } from "@/types/token-system";

interface TokenColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  tokens: DesignTokenSystem;
}

export function TokenColorPicker({ value, onChange, tokens }: TokenColorPickerProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedShade, setSelectedShade] = useState<string>("");

  // Parse initial value
  useEffect(() => {
    if (value.startsWith("{color.") && value.endsWith("}")) {
      const parts = value.slice(1, -1).split(".");
      // format: color.blue.500
      if (parts.length === 3) {
        setSelectedFamily(parts[1]);
        setSelectedShade(parts[2]);
      } else if (parts.length === 2 && parts[1] === "white") {
           // Handle cases like color.white.DEFAULT or just color.white (if flattened)
           // But here structure is color.white.DEFAULT
           setSelectedFamily(parts[1]);
      }
    }
  }, [value]);

  const families = Object.keys(tokens.foundation.colors);

  const shades = selectedFamily && tokens.foundation.colors[selectedFamily]
    ? Object.keys(tokens.foundation.colors[selectedFamily])
    : [];

  const handleFamilyChange = (family: string) => {
    setSelectedFamily(family);
    // Default to first shade or specific defaults
    const newShades = Object.keys(tokens.foundation.colors[family]);
    const defaultShade = newShades.includes("500") ? "500" : newShades.includes("DEFAULT") ? "DEFAULT" : newShades[0];

    setSelectedShade(defaultShade);
    onChange(`{color.${family}.${defaultShade}}`);
  };

  const handleShadeChange = (shade: string) => {
    setSelectedShade(shade);
    onChange(`{color.${selectedFamily}.${shade}}`);
  };

  // Check if current value is a hex or non-reference
  const isDirectValue = !value.startsWith("{");

  if (isDirectValue) {
      // If it's a direct hex value, maybe show a warning or a button to switch to reference mode?
      // For now, we assume this picker is used when we want to pick a reference.
      // But we can fallback to just showing the reference builder.
  }

  return (
    <div className="flex gap-2 w-full">
      <Select value={selectedFamily} onValueChange={handleFamilyChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Color" />
        </SelectTrigger>
        <SelectContent>
          {families.map((f) => (
            <SelectItem key={f} value={f} className="text-xs">
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

      <Select value={selectedShade} onValueChange={handleShadeChange} disabled={!selectedFamily}>
        <SelectTrigger className="flex-1 h-8 text-xs">
          <SelectValue placeholder="Shade" />
        </SelectTrigger>
        <SelectContent>
          {shades.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
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
}
