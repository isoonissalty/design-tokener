"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaddingTokens } from "@/app/page";

interface PreviewProps {
  padding: PaddingTokens;
}

export function Preview({ padding }: PreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
               <span className="text-xs text-muted-foreground">Small ({padding.small}px)</span>
               <button
                 className="bg-primary text-primary-foreground rounded-md font-medium text-sm transition-colors hover:bg-primary/90"
                 style={{ padding: `${padding.small}px` }}
               >
                 Button
               </button>
            </div>

            <div className="flex flex-col items-center gap-2">
               <span className="text-xs text-muted-foreground">Medium ({padding.medium}px)</span>
               <button
                 className="bg-primary text-primary-foreground rounded-md font-medium text-sm transition-colors hover:bg-primary/90"
                 style={{ padding: `${padding.medium}px` }}
               >
                 Button
               </button>
            </div>

            <div className="flex flex-col items-center gap-2">
               <span className="text-xs text-muted-foreground">Large ({padding.large}px)</span>
               <button
                 className="bg-primary text-primary-foreground rounded-md font-medium text-sm transition-colors hover:bg-primary/90"
                 style={{ padding: `${padding.large}px` }}
               >
                 Button
               </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Container Spacing</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="border rounded-lg border-dashed border-muted-foreground/50 bg-muted/20">
              <div
                className="bg-background border rounded shadow-sm"
                style={{ margin: `${padding.medium}px`, padding: `${padding.large}px` }}
              >
                <h3 className="font-semibold mb-2">Content Box</h3>
                <p className="text-sm text-muted-foreground">
                  This box has a margin of <strong>{padding.medium}px</strong> and padding of <strong>{padding.large}px</strong>.
                </p>
              </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
