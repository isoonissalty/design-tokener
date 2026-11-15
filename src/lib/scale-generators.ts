import type { GeneratedToken, GenerationResult } from "@/types/generation";

export type ScaleUnit = "rem" | "px";
export type SpacingMethod = "grid-4" | "grid-8" | "carbon";
export type RadiusMethod = "tailwind" | "material";

interface ScaleOptions {
  unit?: ScaleUnit;
  rootFontSize?: number;
}

function positive(value: number, name: string, max = 4096) {
  if (!Number.isFinite(value) || value <= 0 || value > max) {
    throw new Error(`${name} must be greater than 0 and no more than ${max}.`);
  }
  return value;
}

const format = (value: number) => Number(value.toFixed(5)).toString();

function options({ unit = "rem", rootFontSize = 16 }: ScaleOptions) {
  if (unit !== "rem" && unit !== "px") throw new Error("Choose rem or px as the output unit.");
  positive(rootFontSize, "Root font size", 128);
  return { unit, rootFontSize };
}

function dimension(px: number, unit: ScaleUnit, rootFontSize: number) {
  return px === 0 ? "0px" : unit === "rem" ? `${format(px / rootFontSize)}rem` : `${format(px)}px`;
}

function conversion(px: number, unit: ScaleUnit, rootFontSize: number) {
  return unit === "rem"
    ? `${format(px)}px ÷ ${format(rootFontSize)}px root = ${dimension(px, unit, rootFontSize)}`
    : `${format(px)}px`;
}

export function generateSpacing({ method = "grid-4", scale = 1, ...config }: ScaleOptions & {
  method?: SpacingMethod;
  scale?: number;
} = {}): GenerationResult {
  const { unit, rootFontSize } = options(config);
  positive(scale, "Scale factor", 4);
  if (!["grid-4", "grid-8", "carbon"].includes(method)) throw new Error("Choose a spacing method.");
  const step = method === "grid-8" ? 8 : 4;
  const keys = method === "carbon" ? [0, 0.5, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 40] : [0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24];
  const tokens = keys.map((key): GeneratedToken => {
    const px = key * step * scale;
    return {
      key: key === 0.5 ? "half" : String(key),
      value: dimension(px, unit, rootFontSize),
      reason: key === 0 ? "Zero is the explicit no-spacing value."
        : method === "carbon"
          ? `Carbon reference: ${format(key * step)}px; × ${format(scale)} scale = ${conversion(px, unit, rootFontSize)}. ${key === 0.5 ? "Half names a half-unit (2px) gap." : "The token name is this app's 4px-based index."}`
          : `${format(key)} × ${step}px grid unit × ${format(scale)} scale = ${conversion(px, unit, rootFontSize)}. This app selects denser steps for small gaps and larger steps for layout.`,
    };
  });
  return {
    category: "spacing",
    title: method === "carbon" ? "Carbon spacing scale" : `${step}px spacing grid`,
    summary: method === "carbon"
      ? "Uses Carbon's published 2–160px spacing values plus zero. A scale factor of 1 reproduces the reference pixel sizes; other factors are custom adaptations."
      : `Each token is its numeric index × ${step}px × the scale factor. The grid follows a shared spacing unit; the selected indices and adjustable factor are this app's choices, informed by Carbon's spacing and 8px mini-unit.`,
    parameters: { method, scale: String(scale), unit, rootFontSize: `${rootFontSize}px` },
    sources: [
      { title: "Carbon · spacing values and usage", url: "https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview" },
      ...(method === "grid-8" ? [{ title: "Carbon · 2x Grid and the 8px mini-unit", url: "https://www.carbondesignsystem.com/building-blocks/foundations/2x-grid/overview" }] : []),
    ],
    tokens,
  };
}

export function generateRadius({ method = "tailwind", scale = 1, ...config }: ScaleOptions & {
  method?: RadiusMethod;
  scale?: number;
} = {}): GenerationResult {
  const { unit, rootFontSize } = options(config);
  positive(scale, "Scale factor", 4);
  if (!["tailwind", "material"].includes(method)) throw new Error("Choose a radius method.");
  const values: [string, number][] = method === "material"
    ? [["none", 0], ["xs", 4], ["sm", 8], ["md", 12], ["lg", 16], ["xl", 28], ["full", 9999]]
    : [["none", 0], ["sm", 2], ["DEFAULT", 4], ["md", 6], ["lg", 8], ["xl", 12], ["2xl", 16], ["3xl", 24], ["full", 9999]];
  return {
    category: "radius",
    title: method === "material" ? "Material 3 shape scale" : "Tailwind radius scale",
    summary: method === "material"
      ? "Uses the published Material Web v0_192 shape tokens, with descriptive keys shortened for this editor. Scale 1 matches the reference pixel sizes. The adjustable scale factor is an app customization."
      : "Uses Tailwind v3's radius scale, interpreted at its reference 16px root. Scale 1 matches those pixel sizes. The adjustable scale factor is an app customization. None and full stay fixed.",
    parameters: { method, scale: String(scale), unit, rootFontSize: `${rootFontSize}px` },
    sources: method === "material"
      ? [{ title: "Material Web · shape token reference v0_192", url: "https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-shape.scss" }]
      : [{ title: "Tailwind v3 · border radius scale", url: "https://v3.tailwindcss.com/docs/border-radius" }],
    tokens: values.map(([key, reference]): GeneratedToken => {
      const px = reference * scale;
      return {
        key,
        value: key === "full" ? "9999px" : dimension(px, unit, rootFontSize),
        reason: key === "full"
          ? "9999px is the reference's full-rounding sentinel; CSS caps the corner radius to fit the element. It stays fixed when scaling."
          : key === "none" ? "0px produces square corners and stays fixed when scaling."
          : `${method === "material" ? "Material 3" : "Tailwind v3 at 16px root"} reference: ${reference}px; × ${format(scale)} scale = ${conversion(px, unit, rootFontSize)}.`,
      };
    }),
  };
}

export function generateSizing({ base = 20, step = 4, container = 80, ...config }: ScaleOptions & {
  /** Sizing inputs use rem, independent of the chosen output unit. */
  base?: number;
  step?: number;
  container?: number;
} = {}): GenerationResult {
  const { unit, rootFontSize } = options(config);
  positive(base, "Smallest width", 256);
  positive(step, "Width increment", 64);
  positive(container, "Container width", 512);
  const largest = base + 4 * step;
  if (container < largest) throw new Error(`Container width must be at least ${format(largest)}rem (the xl width).`);
  const keys = ["xs", "sm", "md", "lg", "xl", "container"];
  return {
    category: "sizing",
    title: "Container width scale",
    summary: "The defaults match Tailwind v3's xs–xl max-widths and its 7xl (80rem) container. The formula is smallest width + index × increment. Container is an independent upper width, at least as large as xl. Custom inputs adapt this reference; these are content widths, not device breakpoints.",
    parameters: { base: `${base}rem`, step: `${step}rem`, container: `${container}rem`, unit, rootFontSize: `${rootFontSize}px` },
    sources: [{ title: "Tailwind v3 · max-width and container values", url: "https://v3.tailwindcss.com/docs/max-width" }],
    tokens: keys.map((key, index): GeneratedToken => {
      const rem = key === "container" ? container : base + index * step;
      const px = rem * rootFontSize;
      return {
        key,
        value: dimension(px, unit, rootFontSize),
        reason: key === "container"
          ? `Independent container width: ${format(container)}rem × ${format(rootFontSize)}px root = ${format(px)}px. The default 80rem corresponds to Tailwind's 7xl max-width.`
          : `${format(base)}rem + ${index} × ${format(step)}rem = ${format(rem)}rem; × ${format(rootFontSize)}px root = ${format(px)}px. Defaults match Tailwind's ${key} max-width.`,
      };
    }),
  };
}
