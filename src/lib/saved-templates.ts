import { validateTheme } from "@/lib/theme-io";
import type { ThemeTemplate } from "@/lib/theme-templates";
import type { DesignTokenSystem } from "@/types/token-system";

export const SAVED_TEMPLATES_STORAGE_KEY = "design-token-builder-templates";
const savedDescription = "Saved in this browser.";

function templateName(name: unknown): string {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    throw new Error("Enter a template name between 1 and 80 characters.");
  }
  return name.trim();
}

/** Resolve aliases against this snapshot, so its swatches follow generated colors. */
export function getTemplateSwatches(tokens: DesignTokenSystem, paletteName?: string): string[] {
  const registry = new Map<string, unknown>();
  function register(value: unknown, path: string) {
    registry.set(path, value);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) register(child, `${path}.${key}`);
    }
  }
  register(tokens.foundation.colors, "color");
  register(tokens.semantic.colors, "color");
  function resolve(value: unknown, mode: "light" | "dark", seen = new Set<string>()): string {
    if (value && typeof value === "object" && mode in value) {
      return resolve((value as Record<string, unknown>)[mode], mode, seen);
    }
    if (typeof value !== "string") return "transparent";
    return value.replace(/\{([^}]+)\}/g, (_, path: string) => {
      if (seen.has(path) || !registry.has(path)) return "transparent";
      return resolve(registry.get(path), mode, new Set(seen).add(path));
    });
  }
  const preferred = paletteName && Object.hasOwn(tokens.foundation.colors, paletteName)
    ? tokens.foundation.colors[paletteName] : undefined;
  if (preferred) {
    const shades = ["700", "500", "200"].filter((shade) => Object.hasOwn(preferred, shade));
    if (shades.length) {
      return [
        ...shades.map((shade) => resolve(preferred[shade], "light")),
        resolve(tokens.semantic.colors.bg.canvas, "light"),
        resolve(tokens.semantic.colors.text.primary, "light"),
      ];
    }
  }
  return [
    resolve(tokens.semantic.colors.intent.primary, "light"),
    resolve(tokens.semantic.colors.intent.primary, "dark"),
    resolve(tokens.semantic.colors.bg.canvas, "light"),
    resolve(tokens.semantic.colors.bg.canvas, "dark"),
    resolve(tokens.semantic.colors.text.primary, "light"),
  ];
}

/** Store a validated full-theme copy; later edits cannot change this template. */
export function createSavedTemplate(name: string, tokens: DesignTokenSystem, paletteName?: string): ThemeTemplate {
  const normalizedName = templateName(name);
  const snapshot = validateTheme(tokens);
  const preferredPalette = savedPaletteName(snapshot, paletteName);
  return {
    id: `saved-${globalThis.crypto.randomUUID()}`,
    name: normalizedName,
    description: savedDescription,
    swatches: getTemplateSwatches(snapshot, preferredPalette),
    tokens: snapshot,
    ...(preferredPalette ? { paletteName: preferredPalette } : {}),
  };
}

function savedPaletteName(tokens: DesignTokenSystem, paletteName: unknown): string | undefined {
  if (paletteName === undefined) return undefined;
  if (typeof paletteName !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(paletteName)) {
    throw new Error("The saved template palette name is invalid.");
  }
  return Object.hasOwn(tokens.foundation.colors, paletteName) ? paletteName : undefined;
}

/** Reject damaged storage as a whole rather than silently discarding saved work. */
export function parseSavedTemplates(serialized: string | null): ThemeTemplate[] {
  if (serialized === null) return [];
  const parsed: unknown = JSON.parse(serialized);
  if (!Array.isArray(parsed)) throw new Error("Saved templates must be a list.");
  const ids = new Set<string>();
  return parsed.map((entry: unknown) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("A saved template is invalid.");
    }
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== "string" || !/^saved-[a-zA-Z0-9-]{1,100}$/.test(item.id) || ids.has(item.id)) {
      throw new Error("Saved template IDs must be unique.");
    }
    ids.add(item.id);
    const name = templateName(item.name);
    if (typeof item.description !== "string" || item.description.length > 500 ||
        !Array.isArray(item.swatches) || !item.swatches.length || item.swatches.length > 10 ||
        item.swatches.some((swatch: unknown) => typeof swatch !== "string" || !swatch.trim() || swatch.length > 4096)) {
      throw new Error("Saved template details are invalid.");
    }
    const tokens = validateTheme(item.tokens);
    const paletteName = savedPaletteName(tokens, item.paletteName);
    return {
      id: item.id, name, description: savedDescription, swatches: getTemplateSwatches(tokens, paletteName), tokens,
      ...(paletteName ? { paletteName } : {}),
    };
  });
}
