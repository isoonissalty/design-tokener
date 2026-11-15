import type { DesignTokenSystem } from "@/types/token-system";
import { generateTokenCss, toCssVar } from "@/lib/css-generator";

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

const variablesFor = (values: Record<string, string>, prefix: string) => Object.fromEntries(
  Object.keys(values).map((key) => [key, `var(${toCssVar([prefix, key])})`]),
);

const themeMappings = `    /* Theme mappings */
    --background: var(--color-bg-canvas);
    --foreground: var(--color-text-primary);
    --card: var(--color-bg-surface);
    --card-foreground: var(--color-text-primary);
    --popover: var(--color-bg-surface);
    --popover-foreground: var(--color-text-primary);
    --primary: var(--color-intent-primary);
    --primary-foreground: var(--color-intent-on-primary, var(--color-text-inverse));
    --secondary: var(--color-intent-secondary, var(--color-bg-subtle));
    --secondary-foreground: var(--color-intent-on-secondary, var(--color-text-primary));
    --muted: var(--color-bg-subtle);
    --muted-foreground: var(--color-text-secondary);
    --accent: var(--color-bg-subtle);
    --accent-foreground: var(--color-text-primary);
    --destructive: var(--color-intent-error);
    --destructive-foreground: var(--color-text-inverse);
    --border: var(--color-border-default);
    --input: var(--color-border-default);
    --ring: var(--color-border-focus);
    --radius: var(--radius-md);`;

export function generateThemeExport(tokens: DesignTokenSystem) {
  const { root, dark } = generateTokenCss(tokens);
  const cssContent = `${generationComments(tokens)}@layer base {
  :root {
    font-size: ${tokens.settings?.baseFontSize || "16px"};
    ${root.join("\n    ")}

    ${themeMappings}
  }

  .dark {
    ${dark.join("\n    ")}
    ${themeMappings}
  }
}
`;

  const paletteColors = Object.fromEntries(Object.entries(tokens.foundation.colors).map(([family, shades]) => [
    family,
    Object.fromEntries(Object.keys(shades).map((shade) => [shade, `hsl(var(${toCssVar(["color", family, shade])}))`])),
  ]));
  const themeColor = (name: string) => ({ DEFAULT: `hsl(var(--${name}))`, foreground: `hsl(var(--${name}-foreground))` });
  const { foundation } = tokens;
  const configuration = {
    darkMode: ["class"],
    content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
    theme: {
      container: { center: true, padding: "2rem" },
      extend: {
        colors: {
          ...paletteColors,
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: { ...paletteColors.primary, ...themeColor("primary") },
          secondary: { ...paletteColors.secondary, ...themeColor("secondary") },
          destructive: themeColor("destructive"),
          muted: themeColor("muted"),
          accent: themeColor("accent"),
          popover: themeColor("popover"),
          card: themeColor("card"),
        },
        spacing: variablesFor(foundation.spacing, "space"),
        borderRadius: { ...variablesFor(foundation.radius, "radius"), DEFAULT: `var(${toCssVar(["radius", foundation.radius.DEFAULT ? "DEFAULT" : "md"])})` },
        width: variablesFor(foundation.sizing, "size"),
        maxWidth: variablesFor(foundation.sizing, "size"),
        fontSize: variablesFor(foundation.typography.size, "font-size"),
        fontFamily: variablesFor(foundation.typography.family, "font-family"),
        fontWeight: variablesFor(foundation.typography.weight, "font-weight"),
        lineHeight: variablesFor(foundation.typography.lineHeight, "line-height"),
        letterSpacing: variablesFor(foundation.typography.letterSpacing, "letter-spacing"),
        borderWidth: variablesFor(foundation.borderWidth, "border-width"),
      },
    },
  };
  const configContent = `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(configuration, null, 2).slice(0, -1)},\n  plugins: [require("tailwindcss-animate")],\n};\n`;
  return { cssContent, configContent };
}
