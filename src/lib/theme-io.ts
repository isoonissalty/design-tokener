import { defaultDesignTokens } from "./token-defaults";
import type { DesignTokenSystem, SemanticColorValue } from "../types/token-system";
import { generationComments } from "./generation-provenance";

const MAX_IMPORT_SIZE = 1024 * 1024;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const keyPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
type TokenEntry = { path: string[]; name: string; value: string; dark?: string };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeValue(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || !value.trim() || value.length > 4096) {
    throw new Error(`${path} must be a nonempty string (up to 4,096 characters).`);
  }
  const literal = value.replace(/\{[a-zA-Z0-9_.-]+\}/g, "");
  if (/[;{}<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(literal) || /(?:url|expression)\s*\(|@import|javascript:/i.test(literal)) {
    throw new Error(`${path} contains an unsupported CSS value.`);
  }
}

const dynamicGroups = new Set([
  "foundation.colors", "foundation.spacing", "foundation.sizing", "foundation.radius", "foundation.borderWidth",
  "semantic.motion.duration", "semantic.motion.easing", "semantic.zIndex",
]);

function validateTree(value: unknown, example: unknown, path: string): void {
  if (typeof example === "string") {
    safeValue(value, path);
    return;
  }
  if (!record(value) || !record(example)) throw new Error(`${path || "Theme"} must be an object.`);
  if (Object.keys(value).length > 500) throw new Error(`${path} has too many entries.`);
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key) || !keyPattern.test(key)) throw new Error(`Unsupported token name: ${key}. Use letters, numbers, hyphens, or underscores.`);
  }
  if (path === "foundation.colors") {
    if (!Object.keys(value).length) throw new Error("The theme needs at least one color palette.");
    for (const [palette, shades] of Object.entries(value)) {
      if (!record(shades) || !Object.keys(shades).length) throw new Error(`Color palette ${palette} must contain shades.`);
      validateTree(shades, {}, `${path}.${palette}`);
    }
    return;
  }
  if (!dynamicGroups.has(path) && !path.startsWith("foundation.colors.")) {
    for (const key of Object.keys(example)) {
      if (!(key in value)) throw new Error(`Missing required token: ${path ? `${path}.` : ""}${key}.`);
    }
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (key in example) validateTree(child, example[key], childPath);
    else if (typeof child === "string") safeValue(child, childPath);
    else if (record(child)) validateTree(child, {}, childPath);
    else throw new Error(`${childPath} must be a string or token object.`);
  }
}

function metadataText(value: unknown, path: string, limit = 4096): asserts value is string {
  if (typeof value !== "string" || !value.trim() || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new Error(`${path} must be nonempty text (up to ${limit.toLocaleString("en-US")} characters).`);
  }
}

/** Provenance is descriptive data, not part of the CSS token tree. */
function validateGeneration(value: unknown): void {
  if (!record(value)) throw new Error("generation must be an object.");
  const categories = new Set(["colors", "spacing", "radius", "sizing"]);
  for (const [category, recipe] of Object.entries(value)) {
    if (!categories.has(category) || !record(recipe)) throw new Error(`Unsupported generation category: ${category}.`);
    const path = `generation.${category}`;
    const fields = new Set(["category", "title", "summary", "parameters", "sources", "tokens"]);
    if (Object.keys(recipe).some(key => !fields.has(key)) || recipe.category !== category) throw new Error(`${path} has unsupported fields or a mismatched category.`);
    metadataText(recipe.title, `${path}.title`, 256);
    metadataText(recipe.summary, `${path}.summary`);
    if (!record(recipe.parameters) || Object.keys(recipe.parameters).length > 64) throw new Error(`${path}.parameters must be an object with at most 64 entries.`);
    for (const [key, parameter] of Object.entries(recipe.parameters)) {
      if (FORBIDDEN_KEYS.has(key) || !keyPattern.test(key)) throw new Error(`Unsupported generation parameter: ${key}.`);
      metadataText(parameter, `${path}.parameters.${key}`);
    }
    if (!Array.isArray(recipe.sources) || recipe.sources.length > 20) throw new Error(`${path}.sources must be an array with at most 20 references.`);
    for (const source of recipe.sources) {
      if (!record(source) || Object.keys(source).some(key => key !== "title" && key !== "url")) throw new Error(`${path}.sources contains an invalid reference.`);
      metadataText(source.title, `${path}.sources.title`, 256);
      metadataText(source.url, `${path}.sources.url`, 2048);
      let url: URL;
      try { url = new URL(source.url); } catch { throw new Error(`${path}.sources must use valid HTTPS URLs.`); }
      if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${path}.sources must use HTTPS URLs without credentials.`);
    }
    if (!Array.isArray(recipe.tokens) || !recipe.tokens.length || recipe.tokens.length > 500) throw new Error(`${path}.tokens must be an array with 1–500 entries.`);
    const names = new Set<string>();
    for (const token of recipe.tokens) {
      if (!record(token) || Object.keys(token).some(key => key !== "key" && key !== "value" && key !== "reason")) throw new Error(`${path}.tokens contains an invalid generated token.`);
      metadataText(token.key, `${path}.tokens.key`, 256);
      const parts = token.key.split(".");
      if (parts.length !== (category === "colors" ? 2 : 1) || parts.some(key => FORBIDDEN_KEYS.has(key) || !keyPattern.test(key)) || names.has(token.key)) throw new Error(`${path}.tokens contains an unsafe or duplicate token key.`);
      names.add(token.key);
      safeValue(token.value, `${path}.tokens.${token.key}.value`);
      metadataText(token.reason, `${path}.tokens.${token.key}.reason`);
    }
  }
}

/** Validate before a theme reaches Redux or generates CSS. Returns an independent copy. */
export function validateTheme(input: unknown): DesignTokenSystem {
  const candidate = record(input) && "tokens" in input ? input.tokens : input;
  if (!record(candidate)) throw new Error("Theme must be an object.");
  const tokenTree = { ...candidate };
  delete tokenTree.generation;
  validateTree(tokenTree, defaultDesignTokens, "");
  if ("generation" in candidate) validateGeneration(candidate.generation);
  const result = JSON.parse(JSON.stringify(candidate)) as DesignTokenSystem;
  validateAliases(result);
  return result;
}

function kebab(value: string) {
  return value === value.toUpperCase() ? value.toLowerCase() : value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/\./g, "-");
}

function entries(tokens: DesignTokenSystem): TokenEntry[] {
  const result: TokenEntry[] = [];
  const walk = (node: unknown, path: string[], cssPath: string[]) => {
    const name = cssPath.map(kebab).join("-");
    if (typeof node === "string") result.push({ path, name, value: node });
    else if (record(node)) {
      if (typeof node.light === "string" && typeof node.dark === "string") {
        result.push({ path, name, value: node.light, dark: node.dark });
      } else Object.entries(node).forEach(([key, child]) => walk(child, [...path, key], [...cssPath, key]));
    }
  };
  walk(tokens.settings.baseFontSize, ["settings", "baseFontSize"], ["base-font-size"]);
  const f = tokens.foundation;
  walk(f.colors, ["foundation", "colors"], ["color"]);
  const typography: [keyof typeof f.typography, string[]][] = [
    ["family", ["font", "family"]], ["size", ["font", "size"]], ["weight", ["font", "weight"]],
    ["lineHeight", ["line", "height"]], ["letterSpacing", ["letter", "spacing"]],
  ];
  typography.forEach(([key, css]) => walk(f.typography[key], ["foundation", "typography", key], css));
  ([ ["spacing", "space"], ["sizing", "size"], ["radius", "radius"], ["borderWidth", "border-width"] ] as const)
    .forEach(([key, css]) => walk(f[key], ["foundation", key], [css]));
  ([ ["colors", "color"], ["typography", "text"], ["shadow", "shadow"], ["motion", "motion"], ["opacity", "opacity"], ["zIndex", "z"] ] as const)
    .forEach(([key, css]) => walk(tokens.semantic[key], ["semantic", key], [css]));
  walk(tokens.components.button, ["components", "button"], ["button"]);
  return result;
}

function validateAliases(tokens: DesignTokenSystem) {
  const lookup = new Map(entries(tokens).map((entry) => [entry.name, entry]));
  const completed = new Set<string>();
  const visit = (entry: TokenEntry, mode: "light" | "dark", chain: Set<string>) => {
    const identity = `${entry.name}.${mode}`;
    if (chain.has(identity)) throw new Error(`Circular token reference at ${entry.path.join(".")}.`);
    if (completed.has(identity)) return;
    if (chain.size > 100) throw new Error("Token references are nested too deeply.");
    const nextChain = new Set(chain).add(identity);
    const value = mode === "dark" ? entry.dark ?? entry.value : entry.value;
    for (const match of value.matchAll(/\{([^}]+)\}/g)) {
      const parts = match[1].split(".");
      const explicitMode = parts[parts.length - 1];
      if (explicitMode === "light" || explicitMode === "dark") parts.pop();
      const referenced = lookup.get(parts.map(kebab).join("-"));
      if (!referenced) throw new Error(`Missing token reference: ${match[1]}.`);
      visit(referenced, explicitMode === "light" || explicitMode === "dark" ? explicitMode : mode, nextChain);
    }
    completed.add(identity);
  };
  for (const entry of lookup.values()) {
    visit(entry, "light", new Set());
    visit(entry, "dark", new Set());
  }
}

const semanticAliases: Record<string, string[]> = {
  background: ["bg", "canvas"], foreground: ["text", "primary"], card: ["bg", "surface"], "card-foreground": ["text", "primary"],
  popover: ["bg", "surface"], "popover-foreground": ["text", "primary"], primary: ["intent", "primary"], "primary-foreground": ["text", "inverse"],
  secondary: ["bg", "subtle"], "secondary-foreground": ["text", "primary"], muted: ["bg", "subtle"], "muted-foreground": ["text", "secondary"],
  accent: ["bg", "subtle"], "accent-foreground": ["text", "primary"], destructive: ["intent", "error"], "destructive-foreground": ["text", "inverse"],
  border: ["border", "default"], input: ["border", "default"], ring: ["border", "focus"],
};

function aliasTokenPath(alias: string, tokens: DesignTokenSystem): string[] {
  if (alias === "primary-foreground") return ["components", "button", "text", "default"];
  if (alias === "secondary" && tokens.semantic.colors.intent.secondary) return ["semantic", "colors", "intent", "secondary"];
  if (alias === "secondary-foreground" && tokens.semantic.colors.intent.onSecondary) return ["semantic", "colors", "intent", "onSecondary"];
  return ["semantic", "colors", ...semanticAliases[alias]];
}

function aliasCssName(alias: string, tokens: DesignTokenSystem): string {
  if (alias === "primary-foreground") return "button-text-default";
  const path = aliasTokenPath(alias, tokens);
  return `color-${path.slice(2).map(kebab).join("-")}`;
}

function exportedValue(value: string): string {
  return value.replace(/\{([^}]+)\}/g, (_, alias: string) => `var(--dt-${alias.split(".").map(kebab).join("-")})`);
}

function utilityName(name: string): string | undefined {
  if (name.startsWith("color-")) return name.replace(/-default$/, "");
  if (name.startsWith("font-family-")) return name.replace("font-family-", "font-");
  if (name.startsWith("font-size-")) return name.replace("font-size-", "text-");
  if (name.startsWith("font-weight-")) return name;
  if (name.startsWith("line-height-")) return name.replace("line-height-", "leading-");
  if (name.startsWith("letter-spacing-")) return name.replace("letter-spacing-", "tracking-");
  if (name.startsWith("space-")) return name.replace("space-", "spacing-");
  if (name.startsWith("size-")) return name.replace("size-", "spacing-size-");
  if (name.startsWith("radius-")) return name;
  if (name.startsWith("motion-easing-")) return name.replace("motion-easing-", "ease-");
  return undefined;
}

/** Tailwind v4 CSS. Backing variables keep @theme aliases free of self references. */
export function exportThemeCss(tokens: DesignTokenSystem, tailwindVersion: 3 | 4 = 4): string {
  const list = entries(tokens);
  const declarations = (mode: "light" | "dark") => list.flatMap((token) => {
    const values = [`  --dt-${token.name}: ${exportedValue(mode === "dark" ? token.dark ?? token.value : token.value)};`];
    if (token.dark !== undefined) values.push(`  --dt-${token.name}-light: ${exportedValue(token.value)};`, `  --dt-${token.name}-dark: ${exportedValue(token.dark)};`);
    return values;
  });
  const root = declarations("light");
  const dark = declarations("dark");
  // Rebind aliases in each mode: inherited custom properties resolve in their defining scope.
  for (const target of [root, dark]) {
    Object.keys(semanticAliases).forEach((alias) => target.push(`  --${alias}: var(--dt-${aliasCssName(alias, tokens)});`));
    target.push("  --radius: var(--dt-radius-md);");
  }
  let css = `${tailwindVersion === 4 ? '@import "tailwindcss";\n\n@custom-variant dark (&:where(.dark, .dark *));\n\n' : ''}${generationComments(tokens)}/* Generated by Design Token Builder. Import this CSS to edit the theme again. */\n:root {\n${root.join("\n")}\n}\n\n.dark {\n${dark.join("\n")}\n}\n\nhtml { font-size: var(--dt-base-font-size); }\n`;
  if (tailwindVersion === 4) {
    const theme = list.flatMap((token) => {
      const name = utilityName(token.name);
      return name ? [`  --${name}: var(--dt-${token.name});`] : [];
    });
    Object.keys(semanticAliases).forEach((alias) => theme.push(`  --color-${alias}: var(--${alias});`));
    Object.keys(tokens.semantic.shadow).forEach((name) => theme.push(`  --shadow-${name}: var(--dt-shadow-${name}-x) var(--dt-shadow-${name}-y) var(--dt-shadow-${name}-blur) var(--dt-shadow-${name}-spread) var(--dt-shadow-${name}-color);`));
    css += `\n@theme inline {\n${theme.join("\n")}\n}\n`;
  }
  return css;
}

/** A Tailwind 3 config pairs with the CSS export; values are complete CSS colors. */
export function exportTailwindConfig(tokens: DesignTokenSystem): string {
  const extend: Record<string, unknown> = {};
  const colorValue = (variable: string) => `color-mix(in srgb, var(${variable}) calc(<alpha-value> * 100%), transparent)`;
  const variableMap = (values: Record<string, string>, prefix: string, color = false) => Object.fromEntries(Object.keys(values).map((key) => [key, color ? colorValue(`--dt-${prefix}-${kebab(key)}`) : `var(--dt-${prefix}-${kebab(key)})`]));
  extend.colors = Object.fromEntries(Object.entries(tokens.foundation.colors).map(([family, shades]) => [family, variableMap(shades, `color-${kebab(family)}`, true)]));
  Object.keys(semanticAliases).forEach((name) => {
    const colors = extend.colors as Record<string, unknown>;
    colors[name] = record(colors[name]) ? { ...colors[name], DEFAULT: colorValue(`--${name}`) } : colorValue(`--${name}`);
  });
  extend.fontFamily = variableMap(tokens.foundation.typography.family, "font-family");
  extend.fontSize = variableMap(tokens.foundation.typography.size, "font-size");
  extend.fontWeight = variableMap(tokens.foundation.typography.weight, "font-weight");
  extend.lineHeight = variableMap(tokens.foundation.typography.lineHeight, "line-height");
  extend.letterSpacing = variableMap(tokens.foundation.typography.letterSpacing, "letter-spacing");
  extend.spacing = variableMap(tokens.foundation.spacing, "space");
  extend.width = variableMap(tokens.foundation.sizing, "size");
  extend.maxWidth = variableMap(tokens.foundation.sizing, "size");
  extend.borderRadius = variableMap(tokens.foundation.radius, "radius");
  extend.borderWidth = variableMap(tokens.foundation.borderWidth, "border-width");
  extend.boxShadow = Object.fromEntries(Object.keys(tokens.semantic.shadow).map((name) => [name, `var(--dt-shadow-${name}-x) var(--dt-shadow-${name}-y) var(--dt-shadow-${name}-blur) var(--dt-shadow-${name}-spread) var(--dt-shadow-${name}-color)`]));
  return `/** @type {import('tailwindcss').Config} */\n/* Use with theme.css exported for Tailwind v3. */\nmodule.exports = ${JSON.stringify({ darkMode: "class", content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend }, plugins: [] }, null, 2)};\n`;
}

export function exportThemeJson(tokens: DesignTokenSystem): string {
  return JSON.stringify({ version: 1, tokens }, null, 2) + "\n";
}

function foundationPath(name: string): string[] | undefined {
  const groups: [string, string[]][] = [
    ["font-family-", ["typography", "family"]], ["font-size-", ["typography", "size"]], ["font-weight-", ["typography", "weight"]],
    ["line-height-", ["typography", "lineHeight"]], ["letter-spacing-", ["typography", "letterSpacing"]],
    ["space-", ["spacing"]], ["size-", ["sizing"]], ["radius-", ["radius"]], ["border-width-", ["borderWidth"]],
    ["font-", ["typography", "family"]], ["text-", ["typography", "size"]], ["leading-", ["typography", "lineHeight"]],
    ["tracking-", ["typography", "letterSpacing"]], ["spacing-size-", ["sizing"]], ["spacing-", ["spacing"]],
  ];
  for (const [prefix, path] of groups) {
    if (name.startsWith(prefix)) return ["foundation", ...path, name.slice(prefix.length)];
  }
  const palette = /^color-([a-zA-Z0-9_-]+)-(50|100|200|300|400|500|600|700|800|900|950|DEFAULT|default)$/.exec(name);
  if (palette && !FORBIDDEN_KEYS.has(palette[1])) return ["foundation", "colors", palette[1], palette[2].toLowerCase() === "default" ? "DEFAULT" : palette[2]];
  if (name.startsWith("color-")) return ["foundation", "colors", name.slice(6), "DEFAULT"];
  return undefined;
}

function foundationAlias(path: string[]): string | undefined {
  const prefixes: Record<string, string> = { colors: "color", spacing: "space", sizing: "size", radius: "radius", borderWidth: "border.width" };
  if (path[1] === "typography") {
    const typePrefixes: Record<string, string> = { family: "font.family", size: "font.size", weight: "font.weight", lineHeight: "line.height", letterSpacing: "letter.spacing" };
    return `{${typePrefixes[path[2]]}.${path.slice(3).join(".")}}`;
  }
  if (prefixes[path[1]]) return `{${prefixes[path[1]]}.${path.slice(2).join(".")}}`;
  return undefined;
}

function getAtPath(tokens: DesignTokenSystem, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => record(current) ? current[key] : undefined, tokens);
}

function setAtPath(tokens: DesignTokenSystem, path: string[], value: unknown): void {
  if (path.some((key) => FORBIDDEN_KEYS.has(key) || !keyPattern.test(key))) throw new Error("Unsupported token name.");
  let current = tokens as unknown as Record<string, unknown>;
  for (const key of path.slice(0, -1)) {
    if (FORBIDDEN_KEYS.has(key)) throw new Error("Unsupported token name.");
    if (!record(current[key])) current[key] = {};
    current = current[key] as Record<string, unknown>;
  }
  current[path[path.length - 1]] = value;
}

function cssBlocks(css: string): { selector: string; body: string }[] {
  const blocks: { selector: string; body: string }[] = [];
  const stack: { selector: string; start: number }[] = [];
  let head = 0;
  let quote = "";
  for (let index = 0; index < css.length; index++) {
    const char = css[index];
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === "{") { stack.push({ selector: css.slice(head, index).trim(), start: index + 1 }); head = index + 1; }
    else if (char === "}") {
      const block = stack.pop();
      if (!block) throw new Error("The CSS has an unmatched closing brace.");
      blocks.push({ selector: block.selector, body: css.slice(block.start, index) });
      head = index + 1;
    } else if (char === ";") head = index + 1;
  }
  if (stack.length || quote) throw new Error("The CSS is incomplete. Check braces and quotes.");
  return blocks;
}

function normalizeColor(value: string): string {
  // Older shadcn themes store HSL channels without the hsl() function.
  return /^[-+.\d]+(?:deg)?\s+[-+.\d]+%\s+[-+.\d]+%(?:\s*\/\s*[\d.%]+)?$/.test(value) ? `hsl(${value})` : value;
}

export interface ImportResult { tokens: DesignTokenSystem; message: string; }

/** Imports JSON as a complete theme; CSS changes only recognized tokens in the current theme. */
export function importTheme(source: string, current: DesignTokenSystem): ImportResult {
  if (source.length > MAX_IMPORT_SIZE) throw new Error("Choose a theme smaller than 1 MB.");
  const text = source.trim().replace(/^\uFEFF/, "");
  if (!text) throw new Error("Choose a JSON/CSS file or paste a theme first.");
  if (text.startsWith("{")) {
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new Error("Invalid JSON. Check commas, quotes, and braces."); }
    return { tokens: validateTheme(parsed), message: "JSON theme imported. Undo is available." };
  }
  if (/^(?:export\s+default|module\.exports|const\s|import\s)/.test(text)) throw new Error("JavaScript configs cannot be imported. Use theme JSON or CSS variables instead.");
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const root = new Map<string, string>();
  const dark = new Map<string, string>();
  for (const { selector, body } of cssBlocks(clean)) {
    const isDark = /\.dark\b|\[data-theme\s*=\s*["']?dark["']?\]/.test(selector);
    if (!isDark && !/:root\b|@theme\b|:host\b/.test(selector)) continue;
    const target = isDark ? dark : root;
    const regex = /(--[\w-]+)\s*:\s*([^;{}]+)(?:;|$)/g;
    for (const match of body.matchAll(regex)) {
      const value = match[2].replace(/\s*!important\s*$/, "").trim();
      safeValue(value, match[1]);
      target.set(match[1], value);
    }
  }
  const next = JSON.parse(JSON.stringify(current)) as DesignTokenSystem;
  // Generated themes can carry optional intent roles absent from older themes.
  // Register these before resolving imported aliases so they stay semantic roles.
  for (const name of ["secondary", "onPrimary", "onSecondary"] as const) {
    const cssName = `color-intent-${kebab(name)}`;
    if ([`--dt-${cssName}`, `--${cssName}`].some(variable => root.has(variable) || dark.has(variable))) {
      next.semantic.colors.intent[name] ??= { light: "#000000", dark: "#000000" };
    }
  }
  const known = new Map(entries(next).map((entry) => [entry.name, entry]));
  const namesByPath = new Map([...known.values()].map((entry) => [entry.path.join("."), entry.name]));
  const cssToAlias = new Map<string, string>();
  for (const entry of known.values()) {
    const alias = entry.path[0] === "foundation" ? ({ colors: "color", spacing: "space", sizing: "size", radius: "radius", borderWidth: "border.width" } as Record<string, string>)[entry.path[1]] : undefined;
    let aliasPath: string | undefined;
    if (alias) aliasPath = `${alias}.${entry.path.slice(2).join(".")}`;
    else if (entry.path[0] === "foundation" && entry.path[1] === "typography") {
      const prefix: Record<string, string> = { family: "font.family", size: "font.size", weight: "font.weight", lineHeight: "line.height", letterSpacing: "letter.spacing" };
      aliasPath = `${prefix[entry.path[2]]}.${entry.path.slice(3).join(".")}`;
    } else if (entry.path[0] === "semantic" && entry.path[1] === "colors") aliasPath = `color.${entry.path.slice(2).join(".")}`;
    if (aliasPath) { cssToAlias.set(`--dt-${entry.name}`, `{${aliasPath}}`); cssToAlias.set(`--${entry.name}`, `{${aliasPath}}`); }
  }
  for (const variable of new Set([...root.keys(), ...dark.keys()])) {
    if (cssToAlias.has(variable)) continue;
    const name = variable.replace(/^--(?:dt-)?/, "");
    if (semanticAliases[name.replace(/^color-/, "")]) continue;
    const path = foundationPath(name);
    const alias = path && foundationAlias(path);
    if (alias) cssToAlias.set(variable, alias);
  }
  for (const entry of known.values()) {
    if (entry.dark === undefined) continue;
    const base = cssToAlias.get(`--dt-${entry.name}`);
    if (!base) continue;
    for (const mode of ["light", "dark"]) {
      cssToAlias.set(`--dt-${entry.name}-${mode}`, `${base.slice(0, -1)}.${mode}}`);
      cssToAlias.set(`--${entry.name}-${mode}`, `${base.slice(0, -1)}.${mode}}`);
    }
  }
  const checkVariableCycle = (name: string, mode: "light" | "dark", chain: Set<string>) => {
    if (chain.has(name)) throw new Error(`Circular CSS variable reference: ${name}.`);
    if (chain.size > 100) throw new Error("CSS variable references are nested too deeply.");
    const value = (mode === "dark" ? dark.get(name) : undefined) ?? root.get(name);
    if (!value) return;
    const nextChain = new Set(chain).add(name);
    for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) checkVariableCycle(match[1], mode, nextChain);
  };
  const resolving = new Set<string>();
  const resolve = (value: string, mode: "light" | "dark", preserveAlias = true, wrapColor = true): string => {
    const fullReference = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
    if (preserveAlias && fullReference && cssToAlias.has(fullReference[1])) return cssToAlias.get(fullReference[1])!;
    const expanded = value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]+))?\)/g, (_, name: string, fallback?: string) => {
      if (resolving.has(name)) throw new Error(`Circular CSS variable reference: ${name}.`);
      const referenced = (mode === "dark" ? dark.get(name) : undefined) ?? root.get(name);
      if (referenced === undefined) {
        if (fallback) return fallback.trim();
        throw new Error(`CSS variable ${name} is missing. Include its definition in the imported theme.`);
      }
      resolving.add(name);
      const result = resolve(referenced, mode, false, false);
      resolving.delete(name);
      return result;
    });
    if (/var\(/.test(expanded)) throw new Error("Unsupported or unresolved CSS variable expression.");
    return wrapColor ? normalizeColor(expanded) : expanded;
  };
  let count = 0;
  for (const mode of ["light", "dark"] as const) {
    const declarations = mode === "light" ? root : dark;
    for (const [variable, sourceValue] of declarations) {
      const name = variable.replace(/^--(?:dt-)?/, "");
      let entry = known.get(name);
      if (!entry && /-(light|dark)$/.test(name) && known.get(name.replace(/-(light|dark)$/, ""))?.dark !== undefined) continue;
      let path = entry?.path;
      const aliasName = name.startsWith("color-") ? name.slice(6) : name;
      if (!path && semanticAliases[aliasName]) path = aliasTokenPath(aliasName, next);
      if (!path) {
        const standard = name.replace(/^font-/, "font-family-").replace(/^text-/, "font-size-").replace(/^leading-/, "line-height-").replace(/^tracking-/, "letter-spacing-").replace(/^spacing-/, "space-").replace(/^ease-/, "motion-easing-");
        entry = known.get(standard); path = entry?.path;
      }
      if (!path && name === "radius") path = ["foundation", "radius", "md"];
      if (!path) path = foundationPath(name);
      if (!path) continue;
      const currentValue = getAtPath(next, path);
      if (mode === "dark" && !(record(currentValue) && "light" in currentValue)) continue;
      // Own @theme mappings point at the backing variable already imported above.
      checkVariableCycle(variable, mode, new Set());
      const canonicalName = namesByPath.get(path.join(".")) ?? (path[0] === "foundation" ? foundationAlias(path)?.slice(1, -1).split(".").map(kebab).join("-") : undefined);
      if (sourceValue === `var(--dt-${canonicalName})` || sourceValue === `var(--${canonicalName})` || (semanticAliases[aliasName] && sourceValue === `var(--${aliasName})`)) continue;
      const value = resolve(sourceValue, mode);
      if (record(currentValue) && "light" in currentValue && "dark" in currentValue) {
        const updated = { ...currentValue } as unknown as SemanticColorValue;
        updated[mode] = value;
        setAtPath(next, path, updated);
      } else setAtPath(next, path, value);
      if (aliasName === "primary" && !variable.startsWith("--dt-")) {
        next.components.button.bg.default[mode] = "{color.intent.primary}";
      }
      count++;
    }
  }
  if (!count) throw new Error("No supported theme variables found. Use :root/.dark variables, Tailwind @theme, or an exported JSON theme.");
  return { tokens: validateTheme(next), message: `Imported ${count} CSS token ${count === 1 ? "value" : "values"}. Other tokens were kept; Undo is available.` };
}
