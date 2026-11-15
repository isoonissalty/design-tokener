import assert from "node:assert/strict";
import test from "node:test";
import yaml from "js-yaml";
import { generateDesignMarkdown } from "../src/lib/design-md-generator.ts";
import { defaultDesignTokens } from "../src/lib/token-defaults.ts";
import { exportFile } from "../src/lib/theme-export.ts";
import { applyGeneratedPalette, generatePalette } from "../src/lib/palette-generator.ts";

function generate(tokens = structuredClone(defaultDesignTokens)) {
  const markdown = generateDesignMarkdown(tokens);
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(frontmatter, "export begins with a complete YAML frontmatter");
  return { markdown, data: yaml.load(frontmatter[1]) };
}

test("exports a parseable design contract with the standard section order", () => {
  const { markdown, data } = generate();
  const allowedKeys = new Set([
    "version", "name", "description", "omitted", "colors", "typography",
    "spacing", "rounded", "components",
  ]);

  assert.equal(data.version, "alpha");
  assert.equal(typeof data.name, "string");
  assert.ok(data.name.length > 0);
  assert.ok(Object.keys(data).every((key) => allowedKeys.has(key)));
  assert.equal(markdown.match(/^---$/gm).length, 2);
  assert.deepEqual(
    [...markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
    ["Overview", "Colors", "Typography", "Layout", "Elevation & Depth",
      "Shapes", "Components", "Do's and Don'ts"],
  );
});

test("exports current primitive, semantic, typography, and button values", () => {
  const { data } = generate();

  assert.equal(data.colors["blue-600"], "#2563eb");
  assert.equal(data.colors.primary, "#2563eb");
  assert.equal(data.colors["intent-primary-light"], "#2563eb");
  assert.equal(data.colors["intent-primary-dark"], "#3b82f6");
  assert.equal(data.colors["text-primary-light"], "#111827");
  assert.equal(data.colors["text-primary-dark"], "#f9fafb");
  assert.equal(data.typography["heading-h1"].fontFamily, defaultDesignTokens.foundation.typography.family.sans);
  assert.equal(data.typography["heading-h1"].fontSize, defaultDesignTokens.semantic.typography.heading.h1.fontSize);
  assert.equal(String(data.typography["heading-h1"].fontWeight), "700");
  assert.equal(String(data.typography["heading-h1"].lineHeight), "1.25");
  assert.equal(data.typography["heading-h1"].letterSpacing, "-0.025em");
  assert.equal(data.spacing["4"], "1rem");
  assert.equal(data.rounded.md, "0.375rem");
  assert.equal(data.components["button-default-light"].backgroundColor, "#2563eb");
  assert.equal(data.components["button-default-dark"].backgroundColor, "#3b82f6");
  assert.equal(data.components["button-default-light"].textColor, "#ffffff");
  assert.equal(data.components["button-default-light"].rounded, "0.375rem");
  assert.ok(!("padding" in data.components["button-default-light"]), "unequal x/y padding is not serialized as a scalar");
  assert.deepEqual(Object.keys(data.typography), [
    "heading-h1", "heading-h2", "heading-h3", "body-base", "body-sm", "caption", "label",
  ]);
  assert.deepEqual(Object.keys(data.components).sort(), [
    "button-active-dark", "button-active-light", "button-default-dark", "button-default-light",
    "button-disabled-dark", "button-disabled-light", "button-hover-dark", "button-hover-light",
  ]);
});

test("upstream edits and chained references propagate into exported values", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.foundation.colors.blue["600"] = "#123abc";
  tokens.foundation.colors.blue["500"] = "#987def";
  tokens.foundation.typography.size.xl = "1.75rem";
  tokens.semantic.typography.heading.h1.fontSize = "{font.size.xl}";
  tokens.foundation.typography.weight.bold = "800";
  tokens.foundation.spacing["4"] = "1.125rem";
  tokens.foundation.radius.md = "0.75rem";
  tokens.settings.baseFontSize = "20px";

  const { markdown, data } = generate(tokens);

  assert.equal(data.colors["blue-600"], "#123abc");
  assert.equal(data.colors.primary, "#123abc");
  assert.equal(data.colors["intent-primary-light"], "#123abc");
  assert.equal(data.colors["intent-primary-dark"], "#987def");
  assert.equal(data.components["button-default-light"].backgroundColor, "#123abc");
  assert.equal(data.components["button-default-dark"].backgroundColor, "#987def");
  assert.equal(data.typography["heading-h1"].fontSize, "1.75rem");
  assert.equal(String(data.typography["heading-h1"].fontWeight), "800");
  assert.equal(data.spacing["4"], "1.125rem");
  assert.equal(data.components["button-default-light"].rounded, "0.75rem");
  assert.match(markdown, /20px/);
  assert.match(markdown, /1\.125rem/, "resolved button padding is documented");
});

test("mode-less aliases inherit the mode while explicit-mode aliases keep their target", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.components.button.bg.hover.light = "{color.intent.primary}";
  tokens.components.button.bg.hover.dark = "{color.intent.primary}";
  tokens.components.button.bg.active.light = "{color.intent.primary.dark}";
  tokens.components.button.bg.active.dark = "{color.intent.primary.light}";

  const { data } = generate(tokens);

  assert.equal(data.components["button-hover-light"].backgroundColor, "#2563eb");
  assert.equal(data.components["button-hover-dark"].backgroundColor, "#3b82f6");
  assert.equal(data.components["button-active-light"].backgroundColor, "#3b82f6");
  assert.equal(data.components["button-active-dark"].backgroundColor, "#2563eb");
});

test("explicit modes propagate through chains containing mode-less aliases", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.semantic.colors.intent.primary.light = "{color.bg.inverse}";
  tokens.components.button.bg.active.dark = "{color.intent.primary.light}";

  const { data } = generate(tokens);

  assert.equal(data.colors.primary, "#111827");
  assert.equal(data.colors["intent-primary-light"], "#111827");
  assert.equal(data.components["button-active-dark"].backgroundColor, "#111827");
});

test("aliases accept normalized DEFAULT and camelCase token names", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.semantic.colors.intent.primary.light = "{color.white.default}";
  tokens.semantic.typography.body.base.fontFamily = "{text.heading.h1.font-family}";

  const { data } = generate(tokens);

  assert.equal(data.colors["intent-primary-light"], defaultDesignTokens.foundation.colors.white.DEFAULT);
  assert.equal(data.components["button-default-light"].backgroundColor, defaultDesignTokens.foundation.colors.white.DEFAULT);
  assert.equal(data.typography["body-base"].fontFamily, defaultDesignTokens.foundation.typography.family.sans);
});

test("generated palettes remain resolvable when their names overlap semantic color groups", () => {
  const palette = generatePalette("#123abc");
  for (const name of ["intent", "text", "bg", "border"]) {
    const tokens = applyGeneratedPalette(defaultDesignTokens, name, palette);
    tokens.semantic.colors.intent.primary.light = `{color.${name}.500}`;

    const { markdown, data } = generate(tokens);

    assert.equal(data.colors[`${name}-500`], "#123abc", name);
    assert.equal(data.colors.primary, "#123abc", name);
    assert.equal(data.colors["intent-primary-light"], "#123abc", name);
    assert.equal(data.components["button-default-light"].backgroundColor, "#123abc", name);
    assert.doesNotMatch(markdown, /Unresolved token reference/i, name);
  }
});

test("base-font-size aliases resolve to the current root settings", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.settings.baseFontSize = "20px";
  tokens.semantic.typography.body.base.fontSize = "{base-font-size}";

  const { data } = generate(tokens);

  assert.equal(data.typography["body-base"].fontSize, "20px");
});

test("quotes custom YAML keys and preserves font text and literal color formats", () => {
  const tokens = structuredClone(defaultDesignTokens);
  const customKey = 'wide: "room" # 1';
  const fontFamily = '"Noto Sans ไทย", "Font: #1", sans-serif\nFallback';
  tokens.foundation.spacing[customKey] = "2.75rem";
  tokens.foundation.typography.family.sans = fontFamily;
  tokens.foundation.colors.brand = { "accent: #1": "oklch(60% 0.15 250)" };
  tokens.semantic.colors.intent.primary.light = "rgba(12, 34, 56, 0.8)";

  const { data } = generate(tokens);

  assert.equal(data.spacing[customKey], "2.75rem");
  assert.equal(data.typography["body-base"].fontFamily, fontFamily);
  assert.equal(data.colors["brand-accent: #1"], "oklch(60% 0.15 250)");
  assert.equal(data.colors["intent-primary-light"], "rgba(12, 34, 56, 0.8)");
});

test("documents unresolved aliases and omits invalid machine-readable values", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.semantic.colors.intent.primary.light = "{color.missing.500}";
  tokens.semantic.typography.heading.h1.fontSize = "{font.size.missing}";

  const { markdown, data } = generate(tokens);
  const overview = markdown.split("## Overview")[1].split("## Colors")[0];

  assert.equal(data.colors["intent-primary-light"], undefined);
  assert.equal(data.colors.primary, undefined);
  assert.equal(data.components["button-default-light"].backgroundColor, undefined);
  assert.equal(data.typography["heading-h1"].fontSize, undefined);
  assert.match(overview, /unresolved/i);
  assert.match(overview, /\{color\.missing\.500\}/);
  assert.match(overview, /\{font\.size\.missing\}/);
  assert.equal(data.colors["intent-primary-dark"], "#3b82f6", "a broken light alias does not remove valid dark values");
});

test("terminates circular references and reports them as evidence gaps", () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.foundation.colors.blue["600"] = "{color.blue.700}";
  tokens.foundation.colors.blue["700"] = "{color.blue.600}";

  const { markdown, data } = generate(tokens);
  const overview = markdown.split("## Overview")[1].split("## Colors")[0];

  assert.equal(data.colors["blue-600"], undefined);
  assert.equal(data.colors["blue-700"], undefined);
  assert.equal(data.components["button-default-light"].backgroundColor, undefined);
  assert.match(overview, /circular/i);
  assert.match(overview, /\{color\.blue\.(600|700)\}/);
});

test("supports legacy tokens without settings and does not mutate input", () => {
  const tokens = structuredClone(defaultDesignTokens);
  delete tokens.settings;
  const before = structuredClone(tokens);

  const first = generate(tokens);
  const second = generate(tokens);

  assert.match(first.markdown, /16px/);
  assert.equal(first.markdown, second.markdown);
  assert.deepEqual(tokens, before);
});

test("export format selection preserves existing formats and generates DESIGN.md from current tokens", () => {
  const tokens = structuredClone(defaultDesignTokens);
  // These edits are deliberately never saved to local storage.
  tokens.foundation.colors.blue["600"] = "#ff0000";
  tokens.foundation.colors.brand = { "600": "#ff00ff" };
  tokens.foundation.spacing["4"] = "1.375rem";
  tokens.foundation.spacing["10"] = "2.5rem";
  const before = structuredClone(tokens);
  const files = Object.fromEntries(
    ["css4", "css3", "config3", "json", "design-md"].map((format) => [format, exportFile(tokens, format)]),
  );

  assert.deepEqual(Object.values(files).map(({ name, type }) => ({ name, type })), [
    { name: "theme.css", type: "text/css" },
    { name: "theme.css", type: "text/css" },
    { name: "tailwind.config.cjs", type: "text/javascript" },
    { name: "design-tokens.json", type: "application/json" },
    { name: "DESIGN.md", type: "text/markdown;charset=utf-8" },
  ]);
  for (const format of ["css4", "css3"]) {
    assert.match(files[format].content, /--dt-color-blue-600: #ff0000;/);
    assert.match(files[format].content, /--dt-color-brand-600: #ff00ff;/);
    assert.match(files[format].content, /--dt-space-4: 1\.375rem;/);
  }
  assert.match(files.css4.content, /@import "tailwindcss"/);
  assert.match(files.css4.content, /@theme inline/);
  assert.doesNotMatch(files.css3.content, /@theme/);
  assert.match(files.config3.content, /module\.exports =/);
  assert.match(files.config3.content, /--dt-color-brand-600/);
  assert.match(files.config3.content, /--dt-space-10/);
  assert.deepEqual(JSON.parse(files.json.content).tokens, tokens);

  const frontmatter = files["design-md"].content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  assert.ok(frontmatter);
  const data = yaml.load(frontmatter[1]);
  assert.equal(data.colors["blue-600"], "#ff0000");
  assert.equal(data.colors["brand-600"], "#ff00ff");
  assert.equal(data.colors.primary, "#ff0000");
  assert.equal(data.components["button-default-light"].backgroundColor, "#ff0000");
  assert.equal(data.spacing["4"], "1.375rem");
  assert.equal(data.spacing["10"], "2.5rem");
  assert.deepEqual(tokens, before);
});
