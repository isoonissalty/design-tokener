"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { PaddingTokens } from "@/app/page";

interface TokenEditorProps {
  padding: PaddingTokens;
  onChange: (key: keyof PaddingTokens, value: number) => void;
}

export function TokenEditor({ padding, onChange }: TokenEditorProps) {
  return (
    <div className="space-y-4">
      {(Object.keys(padding) as Array<keyof PaddingTokens>).map((key) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium capitalize">
              Padding {key}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[padding[key]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(vals) => onChange(key, vals[0])}
                />
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  value={padding[key]}
                  onChange={(e) => onChange(key, Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <span className="text-sm text-muted-foreground w-6">px</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
