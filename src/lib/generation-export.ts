import type { DesignTokenSystem } from "@/types/token-system";
import { exportThemeCss, exportTailwindConfig } from "@/lib/theme-io";

export { generationComments } from "@/lib/generation-provenance";

/** Backwards-compatible pair using the shared, roundtrippable export pipeline. */
export function generateThemeExport(tokens: DesignTokenSystem) {
  return { cssContent: exportThemeCss(tokens, 3), configContent: exportTailwindConfig(tokens) };
}
