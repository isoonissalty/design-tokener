import type { DesignTokenSystem, SemanticColorValue } from "@/types/token-system";

type YamlTree = { [key: string]: string | YamlTree };
type Mode = "light" | "dark";

// JSON string quoting is also valid YAML and preserves user-entered punctuation.
function toYaml(tree: YamlTree, depth = 0): string {
  return Object.entries(tree)
    .map(([key, value]) => {
      const prefix = `${"  ".repeat(depth)}${JSON.stringify(key)}:`;
      if (typeof value === "string") return `${prefix} ${JSON.stringify(value)}`;
      return Object.keys(value).length
        ? `${prefix}\n${toYaml(value, depth + 1)}`
        : `${prefix} {}`;
    })
    .join("\n");
}

function code(value: string): string {
  const delimiter = "`".repeat(Math.max(0, ...Array.from(value.matchAll(/`+/g), (match) => match[0].length)) + 1);
  return `${delimiter} ${value.replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ")} ${delimiter}`;
}

function table(headings: string[], rows: string[][]): string {
  return [headings, headings.map(() => "---"), ...rows]
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
}

/** Extract the current editor state into the Google DESIGN.md alpha format. */
export function generateDesignMarkdown(tokens: DesignTokenSystem): string {
  const { foundation, semantic, components } = tokens;
  const gaps = new Set<string>();
  // These namespaces mirror the aliases accepted by the CSS exporter/editor.
  const sources: Record<string, unknown> = {
    "base-font-size": tokens.settings?.baseFontSize ?? "16px",
    font: { family: foundation.typography.family, size: foundation.typography.size, weight: foundation.typography.weight },
    line: { height: foundation.typography.lineHeight },
    letter: { spacing: foundation.typography.letterSpacing },
    space: foundation.spacing,
    size: foundation.sizing,
    radius: foundation.radius,
    border: { width: foundation.borderWidth },
    text: semantic.typography,
    shadow: semantic.shadow,
    motion: semantic.motion,
    opacity: semantic.opacity,
    z: semantic.zIndex,
    button: components.button,
  };

  // Match canonical import/export aliases, including DEFAULT and camelCase keys.
  const aliasName = (path: string[]) => path.map((part) => part === part.toUpperCase()
    ? part.toLowerCase()
    : part.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/\./g, "-")).join("-");
  const lookup = new Map<string, string | SemanticColorValue>();
  function collect(node: unknown, path: string[]) {
    if (typeof node === "string") {
      lookup.set(aliasName(path), node);
    } else if (node && typeof node === "object") {
      if ("light" in node && "dark" in node && typeof node.light === "string" && typeof node.dark === "string") {
        lookup.set(aliasName(path), { light: node.light, dark: node.dark });
      } else {
        for (const [key, value] of Object.entries(node)) collect(value, [...path, key]);
      }
    }
  }
  // Palette names can match semantic groups; merge leaves rather than groups.
  collect(foundation.colors, ["color"]);
  collect(semantic.colors, ["color"]);
  collect(sources, []);

  function resolve(value: string, mode: Mode = "light", visited = new Set<string>()): string | undefined {
    let failed = false;
    const result = value.replace(/\{([^{}]+)\}/g, (reference, path: string) => {
      const parts = path.split(".");
      const last = parts[parts.length - 1];
      const referenceMode = last === "light" || last === "dark" ? last : mode;
      if (last === "light" || last === "dark") parts.pop();
      const name = aliasName(parts);
      const visitKey = `${referenceMode}:${name}`;
      if (visited.has(visitKey)) {
        gaps.add(`Circular token reference ${code(reference)}; affected values are omitted from YAML.`);
        failed = true;
        return reference;
      }

      const token = lookup.get(name);
      const target = typeof token === "object" ? token[referenceMode] : token;
      if (typeof target !== "string") {
        gaps.add(`Unresolved token reference ${code(reference)}; affected values are omitted from YAML.`);
        failed = true;
        return reference;
      }

      const resolved = resolve(target, referenceMode, new Set([...visited, visitKey]));
      if (resolved === undefined) failed = true;
      return resolved ?? reference;
    });
    return failed ? undefined : result;
  }

  function resolvedMap(values: Record<string, string>, mode: Mode = "light"): YamlTree {
    const result: YamlTree = {};
    for (const [key, value] of Object.entries(values)) {
      const resolved = resolve(value, mode);
      if (resolved !== undefined) result[key] = resolved;
    }
    return result;
  }

  function display(value: string, mode: Mode = "light"): string {
    const resolved = resolve(value, mode);
    return resolved === undefined ? `${code(value)} (unresolved)` : code(resolved);
  }

  const colors: YamlTree = {};
  for (const [palette, shades] of Object.entries(foundation.colors)) {
    for (const [shade, value] of Object.entries(shades)) {
      const resolved = resolve(value);
      if (resolved !== undefined) colors[`${palette}-${shade}`] = resolved;
    }
  }
  for (const [group, roles] of Object.entries(semantic.colors)) {
    for (const [role, value] of Object.entries(roles) as [string, SemanticColorValue][]) {
      for (const mode of ["light", "dark"] as const) {
        const resolved = resolve(value[mode], mode);
        if (resolved !== undefined) colors[`${group}-${role}-${mode}`] = resolved;
      }
    }
  }
  // Official consumers look for a primary color rather than infer its role.
  if (typeof colors["intent-primary-light"] === "string") {
    colors.primary = colors["intent-primary-light"];
  }

  const typography: YamlTree = {};
  for (const [role, value] of Object.entries(semantic.typography.heading)) {
    typography[`heading-${role}`] = resolvedMap({ ...value });
  }
  for (const [role, value] of Object.entries(semantic.typography.body)) {
    typography[`body-${role}`] = resolvedMap({ ...value });
  }
  typography.caption = resolvedMap({ ...semantic.typography.caption });
  typography.label = resolvedMap({ ...semantic.typography.label });

  const button = components.button;
  const componentTokens: YamlTree = {};
  for (const state of ["default", "hover", "active", "disabled"] as const) {
    for (const mode of ["light", "dark"] as const) {
      const values: Record<string, string> = {
        backgroundColor: button.bg[state][mode],
        textColor: button.text.default[mode],
        rounded: button.radius,
      };
      // The alpha format has one padding dimension; preserve unequal axes in prose.
      const paddingX = resolve(button.padding.x, mode);
      const paddingY = resolve(button.padding.y, mode);
      if (paddingX !== undefined && paddingX === paddingY) values.padding = paddingX;
      componentTokens[`button-${state}-${mode}`] = resolvedMap(values, mode);
    }
  }

  const frontmatter: YamlTree = {
    version: "alpha",
    name: "Exported Design Token System",
    description: "Design contract extracted from the current Design Token Builder configuration.",
    colors,
    typography,
    spacing: resolvedMap(foundation.spacing),
    rounded: resolvedMap(foundation.radius),
    components: componentTokens,
  };

  const sizes = table(["Sizing token", "Value"], Object.entries(foundation.sizing).map(([key, value]) => [code(key), display(value)]));
  const borders = table(["Border width token", "Value"], Object.entries(foundation.borderWidth).map(([key, value]) => [code(key), display(value)]));
  const shadows = table(["Shadow", "CSS box-shadow"], Object.entries(semantic.shadow).map(([key, value]) => [
    code(key), display(`${value.x} ${value.y} ${value.blur} ${value.spread} ${value.color}`),
  ]));
  const layers = table(["Layer token", "z-index"], Object.entries(semantic.zIndex).map(([key, value]) => [code(key), display(value)]));
  const opacity = table(["Opacity token", "Value"], Object.entries(semantic.opacity).map(([key, value]) => [code(key), display(value)]));
  const motion = table(["Motion token", "Value"], Object.entries(semantic.motion).flatMap(([group, values]) =>
    Object.entries(values).map(([key, value]) => [code(`${group}.${key}`), display(value)]),
  ));
  const families = table(["Font family token", "Stack"], Object.entries(foundation.typography.family).map(([key, value]) => [code(key), display(value)]));
  const buttonPadding = `Horizontal padding: ${display(button.padding.x)}. Vertical padding: ${display(button.padding.y)}.`;
  const baseFontSize = display(tokens.settings?.baseFontSize ?? "16px");

  // Assemble prose after resolving every table so no reference gap is hidden.
  return `---
${toYaml(frontmatter)}
---

## Overview

### Source and scope

Workflow: EXTRACT from the current Design Token Builder state. Values in YAML are observed configuration, not evidence of brand approval. Token references have been resolved to their current values so this file is self-contained. Re-export after editing tokens to keep this contract current.

The YAML tokens are normative for supported colors, typography, spacing, corner radii, and button states. The alpha format has no fields for shadows, motion, sizing, borders, opacity, or layer order; their configured values are recorded in prose below.

Product purpose, audience, brand personality, supported locales, and approved assets are not captured by the editor. Confirm them before making product-specific design decisions.

### Proposed direction

Use semantic roles to maintain a clear hierarchy: canvas for the page, surfaces for grouped content, primary text for essential information, and intent colors for actions and feedback. This gives agents consistent roles while leaving page composition flexible. Avoid introducing new colors or spacing values for individual screens without an explicit design decision.

### Gaps and verification

${gaps.size ? [...gaps].map((gap) => `- ${gap}`).join("\n") : "All token references in this export resolved successfully."}

Exporting does not run a contrast audit, browser tests, screen-reader checks, or the official DESIGN.md linter. Accessibility recommendations below require validation in the consuming application; no WCAG conformance is asserted.

## Colors

Foundation palettes use ${code("<palette>-<shade>")} names. Semantic colors use ${code("<group>-<role>-light")} and ${code("<group>-<role>-dark")}. The conventional ${code("primary")} token mirrors ${code("intent-primary-light")} when that value resolves. Both modes are exported regardless of the current preview. Switch the complete set of mode-specific roles together; do not mix light surfaces with dark text roles.

### Proposed usage boundaries

- Use ${code("bg-canvas-*")} for page backgrounds, ${code("bg-surface-*")} for grouped content, and ${code("bg-subtle-*")} for low-emphasis regions.
- Use ${code("text-primary-*")} for essential content and ${code("text-secondary-*")} for supporting text. Disabled text must remain understandable in context.
- Use ${code("intent-primary-*")} for primary actions; reserve success, warning, and error roles for their corresponding feedback. Do not rely on color alone to communicate status.
- Use ${code("border-default-*")} for boundaries and ${code("border-focus-*")} for visible keyboard focus. Verify text/background and focus contrast for both modes before release, including inverse text on intent backgrounds.

## Typography

The YAML contains heading-h1, heading-h2, heading-h3, body-base, body-sm, caption, and label composites with resolved font family, size, weight, line height, and letter spacing. Preserve these roles when composing screens rather than assigning a new size to every element.

Configured base font size: ${baseFontSize} (the editor fallback is 16px when settings are absent). Values in rem depend on the consuming document's root font size; setting a nested preview font size does not redefine rem.

### Configured font stacks

${families}

### Proposed typography checks

Use logical heading order, allow text enlargement and wrapping, and verify glyph coverage for each supported language. Font availability, licensing, loading behavior, and multilingual coverage have not been verified. Avoid fixed-height text containers that clip translated or enlarged content.

## Layout

The YAML spacing scale is extracted without inventing additional steps. Use it for padding and gaps so related elements share a consistent rhythm.

### Configured sizing

${sizes}

These are sizing tokens, not verified breakpoints or mandatory widths. The editor does not define grids, safe areas, or responsive breakpoints.

### Proposed responsive behavior

Constrain content using the appropriate sizing token and available viewport width. Allow controls to wrap or stack, preserve reading and focus order, and test narrow viewports and zoom. Avoid fixed widths that force horizontal scrolling in ordinary content.

## Elevation & Depth

### Configured shadows

${shadows}

### Configured layer order

${layers}

### Configured opacity

${opacity}

Proposed usage: use depth to indicate containment and overlays, keeping foreground content legible. Use the configured layer order consistently; avoid increasing z-index ad hoc to resolve stacking problems. Overlay focus trapping, dismissal, and scroll behavior require implementation and testing.

## Shapes

The YAML rounded scale preserves configured corner radii. Button geometry uses its component radius; do not replace that value with a screen-specific radius without an explicit decision.

### Configured border widths

${borders}

Proposed usage: pair borders with semantic border colors to distinguish adjacent surfaces. Avoid using shape alone to indicate an error or selection.

## Components

### Configured button contract

The YAML defines default, hover, active (pressed), and disabled button variants for light and dark modes. Each includes the configured background, shared text color, and radius. ${buttonPadding} When padding differs by axis, it is documented here rather than forced into the alpha format's single padding field.

Button typography, focus geometry, loading, error, and empty states are not configured by the button token model. Do not infer their implementation from the presence of a token.

### Proposed interaction and accessibility rules

Use native button semantics, keyboard activation, a visible focus indicator, and an accessible name. Disabled controls must prevent activation. Loading feedback should preserve the control's purpose and announce progress where appropriate; errors and empty states need clear text and a recovery action. Verify adequate target size and spacing in the actual UI.

### Configured motion

${motion}

Proposed usage: apply motion to explain state changes using the configured durations and easing. Honor prefers-reduced-motion by removing nonessential transitions and decorative effects. Do not invent decorative animations from timing tokens alone.

## Do's and Don'ts

- Do use semantic roles and the complete matching light or dark theme.
- Do use the exported spacing, typography, and component geometry to keep decisions coherent across screens.
- Do re-export after token changes and validate representative states, contrast, keyboard navigation, reflow, reduced motion, and supported languages.
- Don't treat observed configuration or proposed guidance as an approved brand identity.
- Don't silently substitute missing references, invent unsupported tokens, or claim accessibility compliance without testing.
- Don't copy one layout everywhere; preserve hierarchy and interaction rules while adapting composition to the task.
`;
}
