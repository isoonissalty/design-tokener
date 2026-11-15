import type { GeneratedToken, GenerationResult } from "@/types/generation";
import type { DesignTokenSystem } from "@/types/token-system";

export const PALETTE_SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] as const;
export type PaletteShade = typeof PALETTE_SHADES[number];
export type GeneratedPalette = Record<PaletteShade, string>;

export type PaletteMethod = "oklch" | "hsl" | "rgb";
export type SecondaryRelationship = "custom" | "complementary" | "analogous" | "triadic";

interface PaletteOptions {
  primary: string;
  secondary: string;
  method: PaletteMethod;
  relationship?: SecondaryRelationship;
}

type RGB = [number, number, number];
type HSL = [number, number, number];
type OKLCH = [number, number, number];

/** White/black mixing weights are this app's ramp recipe, not a CSS standard. */
const RAMP = [
  { shade: "50", toward: "white", amount: 0.95 },
  { shade: "100", toward: "white", amount: 0.9 },
  { shade: "200", toward: "white", amount: 0.75 },
  { shade: "300", toward: "white", amount: 0.55 },
  { shade: "400", toward: "white", amount: 0.3 },
  { shade: "500", toward: "seed", amount: 0 },
  { shade: "600", toward: "black", amount: 0.15 },
  { shade: "700", toward: "black", amount: 0.3 },
  { shade: "800", toward: "black", amount: 0.5 },
  { shade: "900", toward: "black", amount: 0.7 },
  { shade: "950", toward: "black", amount: 0.85 },
] as const;

const METHOD_NAMES: Record<PaletteMethod, string> = {
  oklch: "OKLCH",
  hsl: "HSL lightness",
  rgb: "sRGB tint & shade",
};

const HUE_OFFSETS: Record<Exclude<SecondaryRelationship, "custom">, number> = {
  complementary: 180,
  analogous: 30,
  triadic: 120,
};

export function isValidHex(value: string): boolean {
  return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value.trim());
}

export function normalizeHex(value: string): string {
  if (!isValidHex(value)) {
    throw new Error("Enter a valid hex color, such as #2563eb or #36c.");
  }
  const hex = value.trim().toLowerCase();
  return hex.length === 4
    ? `#${hex.slice(1).split("").map((channel) => channel + channel).join("")}`
    : hex;
}

function hexToRgb(value: string): RGB {
  const hex = normalizeHex(value);
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255) as RGB;
}

function rgbToHex(rgb: RGB): string {
  return `#${rgb.map((channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16).padStart(2, "0")).join("")}`;
}

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function rgbToHsl([r, g, b]: RGB): HSL {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  if (delta === 0) return [0, 0, lightness];

  let hue = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = ((hue * 60) % 360 + 360) % 360;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  return [hue, saturation, lightness];
}

function hslToRgb([hue, saturation, lightness]: HSL): RGB {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = ((hue % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs(segment % 2 - 1));
  const m = lightness - chroma / 2;
  const channels: RGB = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
    : segment < 3 ? [0, chroma, x]
    : segment < 4 ? [0, x, chroma]
    : segment < 5 ? [x, 0, chroma]
    : [chroma, 0, x];
  return channels.map((channel) => channel + m) as RGB;
}

/** Oklab matrices from CSS Color 4's sample conversions. */
function rgbToOklch(rgb: RGB): OKLCH {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, labB);
  // Numerical noise must not give gray seeds an arbitrary hue or color cast.
  if (chroma < 0.000001) return [lightness, 0, 0];
  return [lightness, chroma, (Math.atan2(labB, a) * 180 / Math.PI + 360) % 360];
}

function oklchToLinearRgb([lightness, chroma, hue]: OKLCH): RGB {
  const a = chroma * Math.cos(hue * Math.PI / 180);
  const b = chroma * Math.sin(hue * Math.PI / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function inSrgbGamut(rgb: RGB): boolean {
  return rgb.every((channel) => Number.isFinite(channel) && channel >= -0.0000001 && channel <= 1.0000001);
}

/** Reduce chroma at constant lightness/hue; do not clip individual RGB channels. */
function oklchToHex([lightness, chroma, hue]: OKLCH): string {
  if (lightness <= 0) return "#000000";
  if (lightness >= 1) return "#ffffff";
  let rgb = oklchToLinearRgb([lightness, chroma, hue]);
  if (!inSrgbGamut(rgb)) {
    let low = 0;
    let high = chroma;
    for (let iteration = 0; iteration < 24; iteration++) {
      const middle = (low + high) / 2;
      if (inSrgbGamut(oklchToLinearRgb([lightness, middle, hue]))) low = middle;
      else high = middle;
    }
    rgb = oklchToLinearRgb([lightness, low, hue]);
  }
  return rgbToHex(rgb.map(linearToSrgb) as RGB);
}

export function deriveSecondaryColor(
  primary: string,
  relationship: SecondaryRelationship,
  method: PaletteMethod,
): string {
  if (!Object.prototype.hasOwnProperty.call(METHOD_NAMES, method)) {
    throw new Error("Choose a supported color method.");
  }
  const seed = normalizeHex(primary);
  if (relationship === "custom") return seed;
  if (!Object.prototype.hasOwnProperty.call(HUE_OFFSETS, relationship)) {
    throw new Error("Choose a supported secondary relationship.");
  }
  const offset = HUE_OFFSETS[relationship];
  if (method === "oklch") {
    const [lightness, chroma, hue] = rgbToOklch(hexToRgb(seed));
    return oklchToHex([lightness, chroma, (hue + offset) % 360]);
  }
  const [hue, saturation, lightness] = rgbToHsl(hexToRgb(seed));
  return rgbToHex(hslToRgb([(hue + offset) % 360, saturation, lightness]));
}

function makeRamp(seed: string, family: string, method: PaletteMethod): GeneratedToken[] {
  const rgb = hexToRgb(seed);
  const [hue, saturation, lightness] = rgbToHsl(rgb);
  const [okLightness, chroma, okHue] = rgbToOklch(rgb);

  return RAMP.map(({ shade, toward, amount }) => {
    const key = `${family}.${shade}`;
    if (toward === "seed") {
      return { key, value: seed, reason: `Exact selected ${family} seed ${seed}; shade 500 is the unchanged anchor.` };
    }
    const target = toward === "white" ? 1 : 0;
    const percent = Math.round(amount * 100);
    if (method === "oklch") {
      const nextLightness = okLightness + (target - okLightness) * amount;
      return {
        key,
        value: oklchToHex([nextLightness, chroma * (1 - amount), okHue]),
        reason: `${percent}% toward ${toward} in OKLCH: L = ${okLightness.toFixed(4)} + (${target} − ${okLightness.toFixed(4)}) × ${amount}; C = ${chroma.toFixed(4)} × ${(1 - amount).toFixed(2)}; keep hue ${okHue.toFixed(1)}°. Reduce chroma if needed to fit sRGB, then round to hex.`,
      };
    }
    if (method === "hsl") {
      return {
        key,
        value: rgbToHex(hslToRgb([hue, saturation, lightness + (target - lightness) * amount])),
        reason: `${percent}% toward ${toward} in HSL: L = ${lightness.toFixed(4)} + (${target} − ${lightness.toFixed(4)}) × ${amount}; keep hue ${hue.toFixed(1)}° and saturation ${(saturation * 100).toFixed(1)}%. Round to hex. HSL lightness is not perceptual lightness.`,
      };
    }
    return {
      key,
      value: rgbToHex(rgb.map((channel) => channel + (target - channel) * amount) as RGB),
      reason: `${percent}% ${toward} + ${100 - percent}% seed. For each encoded sRGB channel: output = seed × ${(1 - amount).toFixed(2)} + ${target} × ${amount}, then round to hex. This is not linear-light mixing.`,
    };
  });
}

/** The seed-only overload keeps existing theme templates and palette callers compatible. */
export function generatePalette(seed: string): GeneratedPalette;
export function generatePalette(options: PaletteOptions): GenerationResult;
export function generatePalette(input: string | PaletteOptions): GeneratedPalette | GenerationResult {
  if (typeof input === "string") {
    const seed = normalizeHex(input);
    const generated = generatePalette({ primary: seed, secondary: seed, method: "oklch" });
    return Object.fromEntries(generated.tokens
      .filter((token) => token.key.startsWith("primary."))
      .map((token) => [token.key.slice("primary.".length), token.value])) as GeneratedPalette;
  }
  const { primary, secondary, method, relationship = "custom" } = input;
  if (!Object.prototype.hasOwnProperty.call(METHOD_NAMES, method)) throw new Error("Choose a supported color method.");
  const normalizedPrimary = normalizeHex(primary);
  const normalizedSecondary = relationship === "custom"
    ? normalizeHex(secondary)
    : deriveSecondaryColor(normalizedPrimary, relationship, method);
  const secondarySpace = method === "oklch" ? "OKLCH" : "HSL";
  const relationshipDescription = relationship === "custom"
    ? "The secondary seed is independently selected."
    : `The secondary seed rotates the primary hue +${HUE_OFFSETS[relationship]}° in ${secondarySpace}; achromatic seeds stay gray. ${method === "oklch" ? "Chroma is reduced when the rotated color is outside sRGB." : "Saturation and lightness stay fixed."}`;

  return {
    category: "colors",
    title: `${METHOD_NAMES[method]} palette`,
    summary: `Each seed stays exact at 500. Lighter steps move 30–95% toward white; darker steps move 15–85% toward black. These shade weights and the 50–950 names are this app's design recipe, not a standardized ramp. ${relationshipDescription} The live theme uses shade 600 for light mode and 400 for dark mode as app defaults, with a higher-contrast black or white foreground. Check contrast for the actual use.`,
    parameters: {
      method,
      primary: normalizedPrimary,
      secondary: normalizedSecondary,
      relationship,
    },
    sources: [
      {
        title: method === "oklch" ? "W3C CSS Color 4 · Oklab and OKLCH"
          : method === "hsl" ? "W3C CSS Color 4 · HSL"
          : "W3C CSS Color 4 · sRGB",
        url: `https://www.w3.org/TR/css-color-4/#${method === "oklch" ? "ok-lab" : method === "hsl" ? "the-hsl-notation" : "srgb-color"}`,
      },
      ...(relationship !== "custom" ? [{
        title: "Adobe Color · Color harmony rules",
        url: "https://color.adobe.com/create/color-wheel",
      }] : []),
    ],
    tokens: [
      ...makeRamp(normalizedPrimary, "primary", method),
      ...makeRamp(normalizedSecondary, "secondary", method),
    ],
  };
}

/** WCAG contrast for opaque sRGB colors; result ranges from 1 to 21. */
export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

/** Whichever opaque foreground offers the greater WCAG contrast. */
export function readableForeground(background: string): "#000000" | "#ffffff" {
  return contrastRatio(background, "#000000") >= contrastRatio(background, "#ffffff") ? "#000000" : "#ffffff";
}


/** Nullable normalization retained for saved-theme validation and the original palette UI. */
export function normalizeHexColor(value: string): string | null {
  return isValidHex(value) ? normalizeHex(value) : null;
}

export function isValidPaletteName(name: string): boolean {
  return /^[a-z][a-z0-9-]{0,39}$/.test(name) && !["constructor", "prototype", "__proto__"].includes(name);
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
    // A previously generated theme can map its global foreground through onPrimary.
    next.semantic.colors.intent.onPrimary = { light: "#ffffff", dark: "#000000" };
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
  return rgbToHex(rgb.map((channel) => channel + m) as RGB);
}
