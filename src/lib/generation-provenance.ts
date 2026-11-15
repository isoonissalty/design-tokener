import type { DesignTokenSystem } from "@/types/token-system";

const commentText = (value: string) => value.replace(/\*\//g, "* /").replace(/[\r\n]+/g, " ");

/** Keep provenance useful after manual edits, without attributing edited values to a source. */
export function generationComments(tokens: DesignTokenSystem): string {
  const lines: string[] = [];
  for (const record of Object.values(tokens.generation ?? {})) {
    if (!record) continue;
    lines.push(record.title, record.summary);
    for (const [name, value] of Object.entries(record.parameters)) {
      lines.push(`${name}: ${value}`);
    }
    if (record.parameters.rootFontSize && parseFloat(record.parameters.rootFontSize) !== parseFloat(tokens.settings?.baseFontSize || "16px") && record.tokens.some((token) => token.value.endsWith("rem"))) {
      lines.push(`The root changed from ${record.parameters.rootFontSize} at generation to ${tokens.settings?.baseFontSize || "16px"}. Rem values scale with the current root; reference pixel sizes describe the original conversion.`);
    }
    for (const source of record.sources) {
      lines.push(`Reference: ${source.title} — ${source.url}`);
    }
    for (const token of record.tokens) {
      let actual: unknown = tokens.foundation[record.category];
      for (const key of token.key.split(".")) {
        actual = actual && typeof actual === "object" ? (actual as Record<string, unknown>)[key] : undefined;
      }
      lines.push(actual === token.value
        ? `${record.category}.${token.key} = ${token.value}: ${token.reason}`
        : `${record.category}.${token.key}: manually edited after generation; current value ${String(actual)}. Original generated rationale no longer applies.`);
    }
    lines.push("");
  }
  if (lines.length === 0) return "";
  return `/* Generated token references\n${lines.map((line) => ` * ${commentText(line)}`).join("\n")}\n */\n\n`;
}
