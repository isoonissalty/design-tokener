import type { DesignTokenSystem } from "@/types/token-system";

/** Use exactly the same spelling for declarations and token references. */
export const toCssVar = (path: string[]): string => "--" + path.map(part =>
  part === "DEFAULT" ? "default" : part.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\./g, "-").toLowerCase()
).join("-");

/** Values remain complete CSS colors, preserving alpha and modern color spaces. */
export function processTokenValue(value: string): string {
  const resolved = value.replace(/\{([^}]+)\}/g, (_, path: string) => `var(${toCssVar(path.split("."))})`);
  // Editor values must never be able to escape a declaration or a style element.
  return /[;{}<>]/.test(resolved) ? "initial" : resolved;
}

export const themeColorMappings = `
  --background: var(--color-bg-canvas);
  --foreground: var(--color-text-primary);
  --card: var(--color-bg-surface);
  --card-foreground: var(--color-text-primary);
  --popover: var(--color-bg-surface);
  --popover-foreground: var(--color-text-primary);
  --primary: var(--color-intent-primary);
  --primary-foreground: var(--button-text-default);
  --secondary: var(--color-bg-subtle);
  --secondary-foreground: var(--color-text-primary);
  --muted: var(--color-bg-subtle);
  --muted-foreground: var(--color-text-secondary);
  --accent: var(--color-bg-subtle);
  --accent-foreground: var(--color-text-primary);
  --destructive: var(--color-intent-error);
  --destructive-foreground: var(--button-text-default);
  --border: var(--color-border-default);
  --input: var(--color-border-default);
  --ring: var(--color-border-focus);
  --radius: var(--radius-md);
`;

interface GeneratorOptions {
  /** CSS rem is rooted at html, so previews resolve token rem values locally. */
  preview?: boolean;
}

export function generateTokenCss(tokens: DesignTokenSystem, options: GeneratorOptions = {}) {
  const root: string[] = [];
  const dark: string[] = [];
  const baseFontSize = tokens.settings?.baseFontSize || "16px";
  const scaleRem = options.preview && /^\d+(?:\.\d+)?px$/.test(baseFontSize)
    ? (value: string) => value.replace(/(-?(?:\d+\.?\d*|\.\d+))rem\b/g, (_, amount: string) => `${Number(amount) * parseFloat(baseFontSize)}px`)
    : (value: string) => value;
  const value = (input: string) => scaleRem(processTokenValue(input));

  const traverse = (node: unknown, path: string[]) => {
    if (typeof node === "string") {
      root.push(`${toCssVar(path)}: ${value(node)};`);
      return;
    }
    if (!node || typeof node !== "object") return;
    const entries = node as Record<string, unknown>;
    if (typeof entries.light === "string" && typeof entries.dark === "string") {
      const name = toCssVar(path);
      root.push(`${name}: ${value(entries.light)};`);
      // Keep explicit mode references valid for older saved token systems.
      root.push(`${name}-light: ${value(entries.light)};`, `${name}-dark: ${value(entries.dark)};`);
      dark.push(`${name}: ${value(entries.dark)};`);
      return;
    }
    for (const [key, item] of Object.entries(entries)) traverse(item, [...path, key]);
  };

  const { foundation, semantic, components } = tokens;
  traverse(foundation.colors, ["color"]);
  traverse(foundation.typography.family, ["font", "family"]);
  traverse(foundation.typography.size, ["font", "size"]);
  traverse(foundation.typography.weight, ["font", "weight"]);
  traverse(foundation.typography.lineHeight, ["line", "height"]);
  traverse(foundation.typography.letterSpacing, ["letter", "spacing"]);
  traverse(foundation.spacing, ["space"]);
  traverse(foundation.sizing, ["size"]);
  traverse(foundation.radius, ["radius"]);
  traverse(foundation.borderWidth, ["border", "width"]);
  traverse(semantic.colors, ["color"]);
  traverse(semantic.typography, ["text"]);
  traverse(semantic.shadow, ["shadow"]);
  traverse(semantic.motion, ["motion"]);
  traverse(semantic.opacity, ["opacity"]);
  traverse(semantic.zIndex, ["z"]);
  traverse(components.button, ["button"]);

  // A composite shadow is consumable by Tailwind utilities and export clients.
  for (const name of Object.keys(semantic.shadow)) {
    root.push(`--shadow-${name}: var(--shadow-${name}-x) var(--shadow-${name}-y) var(--shadow-${name}-blur) var(--shadow-${name}-spread) var(--shadow-${name}-color);`);
  }
  return { root, dark };
}
