"use client";

import { ExternalLink } from "lucide-react";
import type { GenerationResult } from "@/types/generation";
import type { DesignTokenSystem } from "@/types/token-system";

export function generatedValue(tokens: DesignTokenSystem, result: GenerationResult, key: string): string | undefined {
  const category = tokens.foundation[result.category];
  if (result.category === "colors") {
    const [family, shade] = key.split(".");
    return tokens.foundation.colors[family]?.[shade];
  }
  return (category as Record<string, string>)[key];
}

export function GenerationDetails({ result, currentTokens }: { result: GenerationResult; currentTokens?: DesignTokenSystem }) {
  const generatedRoot = result.parameters.rootFontSize;
  const currentRoot = currentTokens?.settings?.baseFontSize;
  const rootChanged = generatedRoot && currentRoot && parseFloat(generatedRoot) !== parseFloat(currentRoot) && result.tokens.some((token) => token.value.endsWith("rem"));
  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-md border bg-muted/30 p-3 space-y-2">
        <p className="font-medium text-foreground">{result.title}</p>
        <p className="leading-relaxed text-muted-foreground">{result.summary}</p>
        {generatedRoot && <p className="text-muted-foreground">Conversion at generation: 1rem = {generatedRoot}.{rootChanged ? ` Your current root is ${currentRoot}, so rem values now render at a different pixel size. Regenerate to keep the reference pixel sizes.` : ""}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-2 pt-1" aria-label="References">
          {result.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-muted-foreground">
              {source.title}<ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <details className="rounded-md border">
        <summary className="cursor-pointer px-3 py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Why these values? <span className="font-normal text-muted-foreground">({result.tokens.length} tokens)</span></summary>
        <div className="divide-y border-t">
          {result.tokens.map((token) => {
            const currentValue = currentTokens ? generatedValue(currentTokens, result, token.key) : token.value;
            const edited = currentValue !== token.value;
            return (
              <div key={token.key} className="space-y-1 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 font-mono">
                  <span>{token.key}</span><span>{currentValue ?? "Removed"}</span>
                </div>
                <p className="leading-relaxed text-muted-foreground">{edited ? `Manually edited. Originally ${token.value}: ${token.reason}` : token.reason}</p>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
