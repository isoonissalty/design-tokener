"use client";

import { ThemeConfig, ColorPalette } from "@/types/theme";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";

interface GlobalTokenEditorProps {
  config: ThemeConfig;
  onChange: (config: ThemeConfig) => void;
}

const colorGroups = [
  { name: "Base", keys: ["background", "foreground"] },
  { name: "Primary", keys: ["primary", "primaryForeground"] },
  { name: "Secondary", keys: ["secondary", "secondaryForeground"] },
  { name: "Muted", keys: ["muted", "mutedForeground"] },
  { name: "Accent", keys: ["accent", "accentForeground"] },
  { name: "Destructive", keys: ["destructive", "destructiveForeground"] },
  { name: "Card", keys: ["card", "cardForeground"] },
  { name: "Popover", keys: ["popover", "popoverForeground"] },
  { name: "Borders", keys: ["border", "input", "ring"] },
];

export function GlobalTokenEditor({ config, onChange }: GlobalTokenEditorProps) {
  const [activeTab, setActiveTab] = useState("light");

  const updateColor = (mode: "light" | "dark", key: keyof ColorPalette, value: string) => {
    onChange({
      ...config,
      [mode]: {
        ...config[mode],
        [key]: value,
      },
    });
  };

  const updateRadius = (value: number) => {
    onChange({
      ...config,
      radius: value,
    });
  };

  const renderColorInputs = (mode: "light" | "dark") => (
    <div className="space-y-6">
      {colorGroups.map((group) => (
        <div key={group.name} className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">{group.name}</h4>
          <div className="grid grid-cols-1 gap-2">
            {group.keys.map((key) => {
                const colorKey = key as keyof ColorPalette;
                return (
              <div key={key} className="flex items-center gap-2">
                <Input
                  type="color"
                  value={config[mode][colorKey]}
                  onChange={(e) => updateColor(mode, colorKey, e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer shrink-0"
                />
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-medium capitalize shrink-0 w-24 truncate" title={key}>
                        {key.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                         <Input
                        type="text"
                        value={config[mode][colorKey]}
                        onChange={(e) => updateColor(mode, colorKey, e.target.value)}
                        className="h-6 w-20 text-[10px] font-mono px-1"
                        />
                    </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Card>
        <CardHeader className="pb-3 pt-3">
          <CardTitle className="text-sm font-medium">Global Radius</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Border Radius</Label>
              <span className="text-xs text-muted-foreground">{config.radius}rem</span>
            </div>
            <Slider
              value={[config.radius]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={(vals) => updateRadius(vals[0])}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold">Theme Colors</h3>
             <TabsList className="grid w-24 grid-cols-2">
                <TabsTrigger value="light">
                    <Sun className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="dark">
                    <Moon className="h-4 w-4" />
                </TabsTrigger>
             </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="light" className="mt-0">
                {renderColorInputs("light")}
            </TabsContent>
            <TabsContent value="dark" className="mt-0">
                {renderColorInputs("dark")}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
