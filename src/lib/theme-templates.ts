import { defaultDesignTokens } from "@/lib/token-defaults";
import type { DesignTokenSystem, SemanticColorValue } from "@/types/token-system";

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  swatches: string[];
  tokens: DesignTokenSystem;
}

interface TemplateOptions {
  id: string;
  name: string;
  description: string;
  accent: string;
  neutral: string;
  radius: [string, string, string];
  headingFamily?: "sans" | "serif" | "mono";
  sansFamily?: string;
  compact?: boolean;
  tintedCanvas?: boolean;
}

const ref = (family: string, shade: string | number) => `{color.${family}.${shade}}`;
const colorPair = (family: string, light: string | number, dark: string | number): SemanticColorValue => ({
  light: ref(family, light),
  dark: ref(family, dark),
});

function createTemplate(options: TemplateOptions): ThemeTemplate {
  const tokens: DesignTokenSystem = structuredClone(defaultDesignTokens);
  const { accent, neutral } = options;
  const colors = tokens.semantic.colors;

  colors.text.primary = colorPair(neutral, 900, 50);
  colors.text.secondary = colorPair(neutral, 600, 400);
  colors.text.disabled = colorPair(neutral, 400, 600);
  colors.text.inverse = colorPair(neutral, 50, 900);
  colors.bg.canvas = { light: options.tintedCanvas ? ref(neutral, 50) : ref("white", "DEFAULT"), dark: ref(neutral, 950) };
  colors.bg.surface = { light: ref("white", "DEFAULT"), dark: ref(neutral, 900) };
  colors.bg.subtle = colorPair(neutral, 100, 800);
  colors.bg.inverse = colorPair(neutral, 900, 50);
  colors.border.default = colorPair(neutral, 200, 800);
  colors.border.muted = colorPair(neutral, 100, 800);
  colors.border.focus = colorPair(accent, 500, 400);
  colors.intent.primary = colorPair(accent, 700, 400);

  tokens.components.button.bg.default = { light: "{color.intent.primary}", dark: "{color.intent.primary}" };
  tokens.components.button.bg.hover = colorPair(accent, 800, 300);
  // Zinc and indigo 500 need a lighter stop to retain AA contrast with dark text.
  tokens.components.button.bg.active = colorPair(accent, 900, ["zinc", "indigo"].includes(accent) ? 400 : 500);
  tokens.components.button.bg.disabled = colorPair(neutral, 300, 700);
  tokens.components.button.text.default = { light: ref("white", "DEFAULT"), dark: ref(neutral, 950) };
  tokens.foundation.radius.sm = options.radius[0];
  tokens.foundation.radius.md = options.radius[1];
  tokens.foundation.radius.lg = options.radius[2];

  if (options.sansFamily) tokens.foundation.typography.family.sans = options.sansFamily;
  tokens.foundation.typography.size["2xl"] = "1.5rem";
  tokens.foundation.typography.size["3xl"] = "1.875rem";
  tokens.foundation.typography.size["4xl"] = "2.25rem";
  tokens.semantic.typography.heading.h1.fontSize = "{font.size.4xl}";
  tokens.semantic.typography.heading.h2.fontSize = "{font.size.3xl}";
  tokens.semantic.typography.heading.h3.fontSize = "{font.size.2xl}";
  for (const heading of Object.values(tokens.semantic.typography.heading)) {
    heading.fontFamily = `{font.family.${options.headingFamily ?? "sans"}}`;
  }

  if (options.headingFamily === "serif") {
    for (const heading of Object.values(tokens.semantic.typography.heading)) {
      heading.fontWeight = "{font.weight.regular}";
      heading.letterSpacing = "{letter.spacing.normal}";
    }
    tokens.foundation.typography.lineHeight.normal = "1.7";
  }
  if (options.compact) {
    tokens.foundation.spacing["3"] = "0.625rem";
    tokens.foundation.spacing["4"] = "0.875rem";
    tokens.foundation.spacing["6"] = "1.25rem";
    tokens.foundation.spacing["8"] = "1.75rem";
    tokens.foundation.typography.lineHeight.normal = "1.4";
    tokens.components.button.padding.x = "{space.3}";
  }

  return {
    id: options.id,
    name: options.name,
    description: options.description,
    swatches: [
      tokens.foundation.colors[accent]["700"],
      tokens.foundation.colors[accent]["400"],
      tokens.foundation.colors[accent]["100"],
      tokens.foundation.colors[neutral]["100"],
      tokens.foundation.colors[neutral]["900"],
    ],
    tokens,
  };
}

/** Complete, editable starting points; each includes light and dark modes. */
export const themeTemplates: ThemeTemplate[] = [
  createTemplate({
    id: "blueprint", name: "Blueprint", description: "Crisp blue, cool grays, and familiar proportions.",
    accent: "blue", neutral: "slate", radius: ["0.25rem", "0.5rem", "0.75rem"],
  }),
  createTemplate({
    id: "ocean", name: "Ocean", description: "Deep teal with soft edges and an airy canvas.",
    accent: "teal", neutral: "slate", radius: ["0.5rem", "0.875rem", "1.25rem"], tintedCanvas: true,
  }),
  createTemplate({
    id: "botanical", name: "Botanical", description: "Forest green, warm neutrals, and elegant serif headings.",
    accent: "emerald", neutral: "stone", radius: ["0.25rem", "0.375rem", "0.75rem"], headingFamily: "serif", tintedCanvas: true,
  }),
  createTemplate({
    id: "lavender", name: "Lavender", description: "Expressive violet and generous, rounded surfaces.",
    accent: "violet", neutral: "zinc", radius: ["0.5rem", "1rem", "1.5rem"],
    sansFamily: "'Trebuchet MS', ui-sans-serif, system-ui, sans-serif",
  }),
  createTemplate({
    id: "terracotta", name: "Terracotta", description: "Earthy orange and editorial type on warm stone.",
    accent: "orange", neutral: "stone", radius: ["0.125rem", "0.25rem", "0.5rem"], headingFamily: "serif", tintedCanvas: true,
  }),
  createTemplate({
    id: "rose", name: "Rose", description: "Vivid rose with soft corners and a clean backdrop.",
    accent: "rose", neutral: "neutral", radius: ["0.5rem", "0.75rem", "1.25rem"],
  }),
  createTemplate({
    id: "graphite", name: "Graphite", description: "A monochrome system with compact spacing and precise type.",
    accent: "zinc", neutral: "zinc", radius: ["0.125rem", "0.25rem", "0.375rem"], headingFamily: "mono", compact: true,
  }),
  createTemplate({
    id: "editorial", name: "Editorial", description: "Ink blue, sharp corners, and a classic serif voice.",
    accent: "indigo", neutral: "stone", radius: ["0px", "0px", "0.125rem"], headingFamily: "serif", tintedCanvas: true,
  }),
];

/** Return an independent copy so editing a preset never changes the library. */
export function tokensFromTemplate(id: string): DesignTokenSystem {
  const template = themeTemplates.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown theme template: ${id}`);
  return structuredClone(template.tokens);
}
