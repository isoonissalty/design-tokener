"use client";

import { ButtonConfig, ThemeConfig } from "@/types/theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button"; // Standard button
import { ThemeWrapper } from "@/components/ThemeWrapper";

interface ButtonComponentEditorProps {
  buttonConfig: ButtonConfig;
  themeConfig: ThemeConfig;
  onChange: (config: ButtonConfig) => void;
}

export function ButtonComponentEditor({ buttonConfig, themeConfig, onChange }: ButtonComponentEditorProps) {
  const update = (key: keyof ButtonConfig, value: string | number) => {
    onChange({
      ...buttonConfig,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
       {/* Preview Section */}
      <Card className="shrink-0">
        <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-sm font-medium">Live Button Preview</CardTitle>
        </CardHeader>
        <CardContent>
            {/* We use ThemeWrapper here to apply the styles to these buttons specifically */}
            <ThemeWrapper themeConfig={themeConfig} buttonConfig={buttonConfig} className="p-6 border rounded-md bg-muted/30 flex flex-wrap gap-4 items-center justify-center min-h-[100px]">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
            </ThemeWrapper>
        </CardContent>
      </Card>

      {/* Editor Controls */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Dimensions</h4>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Horizontal Padding (px)</Label>
                    <span className="text-xs text-muted-foreground">{buttonConfig.paddingX}px</span>
                </div>
                <Slider
                    value={[buttonConfig.paddingX]}
                    min={0}
                    max={60}
                    step={1}
                    onValueChange={(vals) => update("paddingX", vals[0])}
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Vertical Padding (px)</Label>
                    <span className="text-xs text-muted-foreground">{buttonConfig.paddingY}px</span>
                </div>
                <Slider
                    value={[buttonConfig.paddingY]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={(vals) => update("paddingY", vals[0])}
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Border Radius (rem)</Label>
                    <span className="text-xs text-muted-foreground">{buttonConfig.borderRadius}rem</span>
                </div>
                <Slider
                    value={[buttonConfig.borderRadius]}
                    min={0}
                    max={3}
                    step={0.125}
                    onValueChange={(vals) => update("borderRadius", vals[0])}
                />
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Typography</h4>
             <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Font Size (px)</Label>
                    <span className="text-xs text-muted-foreground">{buttonConfig.fontSize}px</span>
                </div>
                <Slider
                    value={[buttonConfig.fontSize]}
                    min={10}
                    max={24}
                    step={1}
                    onValueChange={(vals) => update("fontSize", vals[0])}
                />
            </div>
             <div className="space-y-2">
                <Label>Font Weight</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={buttonConfig.fontWeight}
                    onChange={(e) => update("fontWeight", e.target.value)}
                >
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                </select>
            </div>
             <div className="space-y-2">
                <Label>Text Transform</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={buttonConfig.textTransform}
                    onChange={(e) => update("textTransform", e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="capitalize">Capitalize</option>
                </select>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Effects</h4>
             <div className="space-y-2">
                <Label>Shadow</Label>
                <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={buttonConfig.boxShadow}
                    onChange={(e) => update("boxShadow", e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                </select>
            </div>
        </div>
      </div>
    </div>
  );
}
