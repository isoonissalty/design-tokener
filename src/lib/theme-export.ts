import type { DesignTokenSystem } from "@/types/token-system";
import { generateDesignMarkdown } from "@/lib/design-md-generator";
import { exportThemeCss, exportThemeJson, exportTailwindConfig } from "@/lib/theme-io";

export type ExportFormat = "css4" | "css3" | "config3" | "json" | "design-md";

export function exportFile(tokens: DesignTokenSystem, format: ExportFormat) {
  if (format === "design-md") return { content: generateDesignMarkdown(tokens), name: "DESIGN.md", type: "text/markdown;charset=utf-8" };
  if (format === "json") return { content: exportThemeJson(tokens), name: "design-tokens.json", type: "application/json" };
  if (format === "config3") return { content: exportTailwindConfig(tokens), name: "tailwind.config.cjs", type: "text/javascript" };
  return { content: exportThemeCss(tokens, format === "css3" ? 3 : 4), name: "theme.css", type: "text/css" };
}
