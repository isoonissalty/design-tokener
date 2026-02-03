"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DesignTokens } from "@/types/tokens";

interface TokenEditorProps {
  tokens: DesignTokens;
  onChange: (newTokens: DesignTokens) => void;
}

export function TokenEditor({ tokens, onChange }: TokenEditorProps) {
  const updateToken = (
    category: keyof DesignTokens,
    key: string,
    value: string | number
  ) => {
    onChange({
      ...tokens,
      [category]: {
        ...tokens[category],
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
      {/* Colors */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(tokens.colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <Label className="w-24 capitalize">{key}</Label>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => updateToken("colors", key, e.target.value)}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => updateToken("colors", key, e.target.value)}
                  className="flex-1 h-8 font-mono text-xs"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Spacing (px)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(tokens.spacing).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between">
                <Label className="capitalize">{key}</Label>
                <span className="text-xs text-muted-foreground">{value}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[value]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(vals) => updateToken("spacing", key, vals[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateToken("spacing", key, Number(e.target.value))}
                  className="w-16 h-8"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Typography (px)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(tokens.typography).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between">
                <Label className="capitalize">{key}</Label>
                <span className="text-xs text-muted-foreground">{value}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[value]}
                  min={8}
                  max={100}
                  step={1}
                  onValueChange={(vals) => updateToken("typography", key, vals[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateToken("typography", key, Number(e.target.value))}
                  className="w-16 h-8"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Border Radius (px)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(tokens.borderRadius).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between">
                <Label className="capitalize">{key}</Label>
                <span className="text-xs text-muted-foreground">{value}px</span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[value]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(vals) => updateToken("borderRadius", key, vals[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateToken("borderRadius", key, Number(e.target.value))}
                  className="w-16 h-8"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
