import type { ComponentTokens, DesignTokenSystem, FoundationTokens, SemanticTokens } from "@/types/token-system";
import { hexToHsl } from "@/lib/colors";

// Helper to convert a dot-notation path or array path to kebab-case CSS variable
export const toCssVar = (path: string[]) => {
  return "--" + path.map(p =>
    p.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) // camelToKebab
     .replace(/\./g, "-") // dotToKebab just in case
  ).join("-");
};

const processValue = (value: string) => {
  // If it's a hex color, convert to HSL
  if (/^#[0-9A-Fa-f]{3,8}$/.test(value)) {
    return hexToHsl(value);
  }

  // If it's an alias, convert to var reference
  return value.replace(/\{([^}]+)\}/g, (_, path: string) => {
    // Semantic pairs become one CSS variable with a dark override. References
    // carrying a legacy mode suffix must point to that same variable.
    const normalized = /^(?:color\.(?:text|bg|border|intent)\.|button\.)/.test(path)
      ? path.replace(/\.(?:light|dark)$/, "")
      : path;
    return `var(${toCssVar(normalized.split("."))})`;
  });
};

export function generateTokenCss(tokens: DesignTokenSystem) {
  const cssVarsRoot: string[] = [];
  const cssVarsDark: string[] = [];

  const traverse = (node: unknown, path: string[]) => {
    if (typeof node === "string") {
      const varName = toCssVar(path);
      cssVarsRoot.push(`${varName}: ${processValue(node)};`);
      return;
    }

    if (typeof node === "object" && node !== null) {
      const record = node as Record<string, unknown>;
      if (typeof record.light === "string" && typeof record.dark === "string" && Object.keys(record).length === 2) {
        const varName = toCssVar(path);
        cssVarsRoot.push(`${varName}: ${processValue(record.light)};`);
        cssVarsDark.push(`${varName}: ${processValue(record.dark)};`);
        return;
      }

      for (const key of Object.keys(record)) {
         traverse(record[key], [...path, key]);
      }
    }
  };

  const traverseFoundation = (foundation: FoundationTokens) => {
      if (!foundation) return;
      traverse(foundation.colors, ["color"]);
      if (foundation.typography) {
          traverse(foundation.typography.family, ["font", "family"]);
          traverse(foundation.typography.size, ["font", "size"]);
          traverse(foundation.typography.weight, ["font", "weight"]);
          traverse(foundation.typography.lineHeight, ["line", "height"]);
          traverse(foundation.typography.letterSpacing, ["letter", "spacing"]);
      }
      traverse(foundation.spacing, ["space"]);
      traverse(foundation.sizing, ["size"]);
      traverse(foundation.radius, ["radius"]);
      traverse(foundation.borderWidth, ["border", "width"]);
  };

  const traverseSemantic = (semantic: SemanticTokens) => {
      if (!semantic) return;
      traverse(semantic.colors, ["color"]);
      traverse(semantic.typography, ["text"]);
      traverse(semantic.shadow, ["shadow"]);
      traverse(semantic.motion, ["motion"]);
      traverse(semantic.opacity, ["opacity"]);
      traverse(semantic.zIndex, ["z"]);
  };

  const traverseComponents = (components: ComponentTokens) => {
      if (!components) return;
      traverse(components.button, ["button"]);
  };

  if (tokens) {
      traverseFoundation(tokens.foundation);
      traverseSemantic(tokens.semantic);
      traverseComponents(tokens.components);
  }

  return {
    root: cssVarsRoot,
    dark: cssVarsDark
  };
}
