import type { DesignTokenSystem } from "@/types/token-system";

export const PALETTE_SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
export type PaletteShade = typeof PALETTE_SHADES[number];
export type GeneratedPalette = Record<PaletteShade, string>;

type RGB = [number, number, number];

export function normalizeHexColor(value: string): string | null {
  const hex = value.trim();
  if (/^#[\da-f]{3}$/i.test(hex)) {
    return `#${hex.slice(1).split("").map((channel) => channel.repeat(2)).join("")}`.toLowerCase();
  }
  return /^#[\da-f]{6}$/i.test(hex) ? hex.toLowerCase() : null;
}

export function isValidPaletteName(name: string): boolean {
  return /^[a-z][a-z0-9-]{0,39}$/.test(name) && !["constructor", "prototype", "__proto__"].includes(name);
}

function hexToRgb(hex: string): RGB {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255) as RGB;
}

function toLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function toOklab(rgb: RGB): RGB {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}

function fromOklab([lightness, a, b]: RGB): RGB {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(fromLinear) as RGB;
}

function toHex(rgb: RGB): string {
  return `#${rgb.map((channel) => Math.round(Math.max(0, Math.min(1, channel)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** Mix in perceptual OKLab space; the supplied seed remains exactly at shade 500. */
export function generatePalette(seed: string): GeneratedPalette {
  const normalized = normalizeHexColor(seed);
  if (!normalized) throw new Error("Enter a valid hex color, such as #6366f1 or #63f.");
  const lab = toOklab(hexToRgb(normalized));
  const weights: Record<PaletteShade, number> = {
    "50": 0.95, "100": 0.88, "200": 0.72, "300": 0.52, "400": 0.28,
    "500": 0, "600": -0.16, "700": -0.32, "800": -0.5, "900": -0.68, "950": -0.8,
  };
  return Object.fromEntries(PALETTE_SHADES.map((shade) => {
    if (shade === "500") return [shade, normalized];
    const amount = Math.abs(weights[shade]);
    const targetLightness = weights[shade] > 0 ? 1 : 0;
    return [shade, toHex(fromOklab([
      lab[0] + (targetLightness - lab[0]) * amount,
      lab[1] * (1 - amount),
      lab[2] * (1 - amount),
    ]))];
  })) as GeneratedPalette;
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const normalized = normalizeHexColor(hex);
    if (!normalized) throw new Error("Contrast calculation requires hex colors.");
    const [r, g, b] = hexToRgb(normalized).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function accessibleShade(palette: GeneratedPalette, target: PaletteShade, foreground: string): PaletteShade {
  return [...PALETTE_SHADES]
    .sort((a, b) => Math.abs(Number(a) - Number(target)) - Math.abs(Number(b) - Number(target)))
    .find((shade) => contrastRatio(palette[shade], foreground) >= 4.5) ?? target;
}

/** Preserve existing custom shades and make the whole application one undoable update. */
export function applyGeneratedPalette(
  tokens: DesignTokenSystem,
  name: string,
  palette: GeneratedPalette,
  makePrimary = true,
): DesignTokenSystem {
  if (!isValidPaletteName(name)) throw new Error("Use a palette name starting with a letter, followed by lowercase letters, numbers, or hyphens (up to 40 characters).");
  for (const shade of PALETTE_SHADES) {
    if (!normalizeHexColor(palette[shade])) throw new Error(`Shade ${shade} must be a valid hex color.`);
  }
  const next = structuredClone(tokens);
  next.foundation.colors[name] = { ...next.foundation.colors[name], ...palette };
  if (makePrimary) {
    const ref = (shade: PaletteShade) => `{color.${name}.${shade}}`;
    const light = accessibleShade(palette, "600", "#ffffff");
    const dark = accessibleShade(palette, "400", "#000000");
    next.semantic.colors.intent.primary = { light: ref(light), dark: ref(dark) };
    next.semantic.colors.border.focus = { light: ref(light), dark: ref(dark) };
    next.components.button.bg.default = { light: "{color.intent.primary.light}", dark: "{color.intent.primary.dark}" };
    next.components.button.bg.hover = {
      light: ref(accessibleShade(palette, "700", "#ffffff")),
      dark: ref(accessibleShade(palette, "300", "#000000")),
    };
    next.components.button.bg.active = {
      light: ref(accessibleShade(palette, "800", "#ffffff")),
      dark: ref(accessibleShade(palette, "500", "#000000")),
    };
    next.components.button.text.default = { light: "#ffffff", dark: "#000000" };
  }
  return next;
}

export function randomPaletteSeed(): string {
  // A moderate saturation and lightness keep the seed useful as a starting point.
  const hue = Math.random() * 360;
  const saturation = 0.55 + Math.random() * 0.3;
  const lightness = 0.42 + Math.random() * 0.18;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = lightness - chroma / 2;
  const rgb: RGB = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return toHex(rgb.map((channel) => channel + m) as RGB);
}
