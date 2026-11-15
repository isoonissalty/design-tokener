/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const { generatePalette, deriveSecondaryColor, normalizeHex, isValidHex, contrastRatio, readableForeground } = require("../src/lib/palette-generator.ts");
const { generateSpacing, generateRadius, generateSizing } = require("../src/lib/scale-generators.ts");
const { default: reducer, applyGeneration, undo, redo, load, setTokens, updateToken, updateSettings, HISTORY_LIMIT } = require("../src/store/features/themeSlice.ts");
const { generateTokenCss } = require("../src/lib/css-generator.ts");
const { generationComments } = require("../src/lib/generation-export.ts");
const { validateTheme, importTheme, exportThemeJson, exportThemeCss, exportTailwindConfig } = require("../src/lib/theme-io.ts");

const palette = (options = {}) => generatePalette({ primary: "#2468ac", secondary: "#d46a39", method: "oklch", ...options });
const values = (result) => Object.fromEntries(result.tokens.map(({ key, value }) => [key, value]));

test("all color methods produce valid distinct ramps anchored to both exact seeds", () => {
  const results = ["oklch", "hsl", "rgb"].map((method) => palette({ method }));
  for (const result of results) {
    assert.equal(result.tokens.length, 22);
    assert.equal(values(result)["primary.500"], "#2468ac");
    assert.equal(values(result)["secondary.500"], "#d46a39");
    assert.equal(new Set(result.tokens.map((token) => token.key)).size, 22);
    assert.ok(result.tokens.every((token) => /^#[0-9a-f]{6}$/.test(token.value) && token.reason.length > 15));
    assert.ok(result.sources.every((source) => source.url.startsWith("https://")));
  }
  assert.equal(new Set(results.map((result) => JSON.stringify(values(result)))).size, 3);
});

test("hex inputs expand, normalize, and reject malformed or alpha colors", () => {
  assert.equal(normalizeHex(" #AbC "), "#aabbcc");
  assert.equal(values(palette({ primary: "#abc" }))["primary.500"], "#aabbcc");
  for (const input of ["", "red", "#zzzzzz", "#1234", "#12345678", "123456"]) {
    assert.equal(isValidHex(input), false);
    assert.throws(() => palette({ primary: input }));
  }
  assert.throws(() => palette({ method: "unknown" }));
});

test("neutral and extreme OKLCH seeds remain neutral and saturated seeds stay valid", () => {
  for (const seed of ["#000000", "#ffffff", "#808080"]) {
    for (const token of palette({ primary: seed, secondary: seed }).tokens) {
      assert.equal(token.value.slice(1, 3), token.value.slice(3, 5));
      assert.equal(token.value.slice(3, 5), token.value.slice(5, 7));
    }
  }
  for (const seed of ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"]) {
    assert.ok(palette({ primary: seed }).tokens.every((token) => isValidHex(token.value)));
  }
});

test("all methods run from light to dark across saturated and reproducible random seeds", () => {
  const luminance = (hex) => {
    const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
    const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  let random = 1729;
  const seeds = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"];
  for (let index = 0; index < 128; index++) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    seeds.push(`#${(random & 0xffffff).toString(16).padStart(6, "0")}`);
  }
  for (const method of ["oklch", "hsl", "rgb"]) {
    for (const seed of seeds) {
      const ramp = palette({ primary: seed, method }).tokens.filter((token) => token.key.startsWith("primary."));
      for (let index = 1; index < ramp.length; index++) {
        assert.ok(luminance(ramp[index].value) <= luminance(ramp[index - 1].value) + 1e-10, `${method} ${seed}: ${ramp[index].key} should not be lighter than ${ramp[index - 1].key}`);
      }
    }
  }
});

test("secondary hue relationships derive from primary while custom remains independent", () => {
  assert.equal(deriveSecondaryColor("#ff0000", "complementary", "hsl"), "#00ffff");
  assert.equal(deriveSecondaryColor("#ff0000", "triadic", "hsl"), "#00ff00");
  assert.equal(deriveSecondaryColor("#ff0000", "analogous", "hsl"), "#ff8000");
  const generated = palette({ primary: "#ff0000", method: "hsl", relationship: "complementary" });
  assert.equal(values(generated)["secondary.500"], "#00ffff");
  assert.equal(generated.parameters.secondary, "#00ffff");
  assert.equal(values(palette())["secondary.500"], "#d46a39");
});

test("RGB and HSL recipes agree with known primary-color arithmetic", () => {
  const rgb = values(palette({ primary: "#ff0000", method: "rgb" }));
  assert.equal(rgb["primary.100"], "#ffe6e6");
  assert.equal(rgb["primary.800"], "#800000");
  const hsl = values(palette({ primary: "#ff0000", method: "hsl" }));
  assert.equal(hsl["primary.800"], "#800000");
});

test("contrast matches WCAG reference pairs and foreground chooses the stronger neutral", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#2468ac", "#2468ac"), 1);
  assert.equal(readableForeground("#ffff00"), "#000000");
  assert.equal(readableForeground("#0000ff"), "#ffffff");
  assert.ok(Math.abs(contrastRatio("#777777", "#ffffff") - 4.478) < 0.001);
});

test("dimension defaults reproduce documented spacing, radius and container references", () => {
  const carbon = Object.values(values(generateSpacing({ method: "carbon", unit: "px" }))).map(parseFloat).sort((a, b) => a - b);
  assert.deepEqual(carbon, [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160]);
  assert.deepEqual(values(generateRadius({ unit: "px" })), { none: "0px", sm: "2px", DEFAULT: "4px", md: "6px", lg: "8px", xl: "12px", "2xl": "16px", "3xl": "24px", full: "9999px" });
  assert.equal(values(generateRadius({ method: "material", unit: "px" })).xl, "28px");
  assert.deepEqual(values(generateSizing()), { xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", container: "80rem" });
});

test("dimension customization respects scale, units, root conversion and full rounding", () => {
  assert.equal(values(generateSpacing({ scale: 2, rootFontSize: 20 }))["3"], "1.2rem");
  assert.equal(values(generateSpacing({ method: "grid-8", unit: "px" }))["3"], "24px");
  assert.equal(values(generateRadius({ scale: 2, rootFontSize: 20 })).md, "0.6rem");
  assert.equal(values(generateRadius({ scale: 4 })).full, "9999px");
  assert.equal(values(generateSizing({ base: 10, step: 2, container: 50, unit: "px", rootFontSize: 20 })).xl, "360px");
  for (const generate of [generateSpacing, generateRadius, generateSizing]) {
    assert.throws(() => generate({ rootFontSize: NaN }));
    assert.throws(() => generate({ rootFontSize: 0 }));
    assert.throws(() => generate({ unit: "invalid" }));
    const result = generate();
    assert.ok(result.tokens.every((token) => token.reason && token.key && token.value));
    assert.ok(result.sources.length > 0);
  }
  assert.throws(() => generateSpacing({ scale: -1 }));
  assert.throws(() => generateRadius({ scale: Infinity }));
  assert.throws(() => generateSizing({ base: 40, step: 4, container: 20 }));
});

test("applying a palette preserves unrelated tokens and saves all provenance in one undo step", () => {
  const before = reducer(undefined, { type: "init" });
  const result = palette();
  const after = reducer(before, applyGeneration(result));
  assert.equal(after.past.length, before.past.length + 1);
  assert.deepEqual(after.present.foundation.colors.blue, before.present.foundation.colors.blue);
  assert.deepEqual(after.present.foundation.spacing, before.present.foundation.spacing);
  assert.equal(after.present.foundation.colors.primary[500], "#2468ac");
  assert.equal(after.present.foundation.colors.secondary[500], "#d46a39");
  assert.deepEqual(after.present.generation.colors, result);
  assert.deepEqual(after.present.semantic.colors.intent.primary, { light: "{color.primary.600}", dark: "{color.primary.400}" });
  assert.deepEqual(after.present.semantic.colors.intent.secondary, { light: "{color.secondary.600}", dark: "{color.secondary.400}" });
  const undone = reducer(after, undo());
  assert.deepEqual(undone.present, before.present);
  const redone = reducer(undone, redo());
  assert.deepEqual(redone.present, after.present);
  const restored = reducer(undefined, load(JSON.parse(JSON.stringify(after.present))));
  assert.deepEqual(restored.present, after.present);
});

test("applying scales preserves custom keys and each other category", () => {
  let state = reducer(undefined, { type: "init" });
  const customized = structuredClone(state.present);
  customized.foundation.spacing.custom = "37px";
  state = reducer(state, setTokens(customized));
  state = reducer(state, applyGeneration(generateSpacing()));
  const spacing = state.present.foundation.spacing;
  state = reducer(state, applyGeneration(generateRadius()));
  state = reducer(state, applyGeneration(generateSizing()));
  assert.equal(state.present.foundation.spacing.custom, "37px");
  assert.deepEqual(state.present.foundation.spacing, spacing);
  assert.deepEqual(Object.keys(state.present.generation).sort(), ["radius", "sizing", "spacing"]);
});

test("named foundation-only palettes preserve theme mappings and repeated applications are a no-op", () => {
  const initial = reducer(undefined, { type: "init" });
  const result = palette();
  result.parameters = { ...result.parameters, primaryName: "brand", secondaryName: "accent", makePrimary: "false" };
  result.tokens = result.tokens.map((token) => ({ ...token, key: token.key.replace(/^primary\./, "brand.").replace(/^secondary\./, "accent.") }));
  const applied = reducer(initial, applyGeneration(result));
  assert.equal(applied.present.foundation.colors.brand[500], "#2468ac");
  assert.equal(applied.present.foundation.colors.accent[500], "#d46a39");
  assert.deepEqual(applied.present.semantic, initial.present.semantic);
  assert.deepEqual(applied.present.components, initial.present.components);
  assert.equal(reducer(applied, applyGeneration(result)), applied);

  let fullHistory = initial;
  for (let index = 0; index < HISTORY_LIMIT + 5; index++) {
    fullHistory = reducer(fullHistory, updateToken({ path: ["foundation", "colors", "blue", "500"], value: `#${index.toString(16).padStart(6, "0")}` }));
  }
  assert.equal(reducer(fullHistory, applyGeneration(result)).past.length, HISTORY_LIMIT);
});

test("applied button defaults, hover and active states meet AA contrast across methods and extreme seeds", () => {
  for (const method of ["oklch", "hsl", "rgb"]) {
    for (const seed of ["#000000", "#ffffff", "#ffff00", "#00ff00", "#0000ff", "#888888", "#2468ac"]) {
      const { present } = reducer(undefined, applyGeneration(palette({ primary: seed, method })));
      for (const mode of ["light", "dark"]) {
        const foreground = present.semantic.colors.intent.onPrimary[mode];
        const backgrounds = [present.semantic.colors.intent.primary[mode], present.components.button.bg.hover[mode], present.components.button.bg.active[mode]];
        for (const alias of backgrounds) {
          const match = /^\{color\.primary\.(\d+)\}$/.exec(alias);
          assert.ok(match, `Expected generated primary shade: ${alias}`);
          const background = present.foundation.colors.primary[match[1]];
          assert.ok(contrastRatio(background, foreground) >= 4.5, `${method} ${seed} ${mode} ${alias}`);
        }
      }
    }
  }
});

test("generated CSS resolves camel-case and explicit light/dark aliases to declared variables", () => {
  const state = reducer(undefined, applyGeneration(palette()));
  const legacyTheme = structuredClone(state.present);
  legacyTheme.components.button.bg.hover = { light: "{color.intent.primary.light}", dark: "{color.intent.primary.dark}" };
  const { root, dark } = generateTokenCss(legacyTheme);
  const declarations = new Set([...root, ...dark].map((line) => line.split(":")[0]));
  for (const line of [...root, ...dark]) {
    for (const match of line.matchAll(/var\((--[^),]+)/g)) assert.ok(declarations.has(match[1]), `Unresolved alias ${match[1]} in ${line}`);
  }
  assert.ok(root.includes("--button-bg-default: var(--color-intent-primary);"));
  assert.ok(dark.includes("--button-bg-default: var(--color-intent-primary);"));
  assert.ok(root.includes("--button-bg-hover: var(--color-intent-primary-light);"));
  assert.ok(dark.includes("--button-bg-hover: var(--color-intent-primary-dark);"));
  assert.ok(root.includes("--color-primary-500: #2468ac;"));
});

test("both CSS export versions retain references, full colors, and generated values", () => {
  let state = reducer(undefined, applyGeneration(palette()));
  for (const result of [generateSpacing(), generateRadius(), generateSizing()]) state = reducer(state, applyGeneration(result));
  for (const version of [3, 4]) {
    const cssContent = exportThemeCss(state.present, version);
    assert.match(cssContent, /Generated token references/);
    assert.match(cssContent, /https:\/\/www.w3.org\/TR\/css-color-4/);
    assert.match(cssContent, /--dt-color-primary-500: #2468ac;/);
    assert.match(cssContent, /--dt-color-secondary-500: #d46a39;/);
    assert.match(cssContent, /--dt-radius-default: 0\.25rem;/);
    assert.match(cssContent, /--dt-space-24: 6rem;/);
    assert.match(cssContent, /--dt-size-container: 80rem;/);
    assert.match(cssContent, /--secondary: var\(--dt-color-intent-secondary/);
    assert.equal((cssContent.match(/--secondary: var\(--dt-color-intent-secondary/g) || []).length, 2);
    assert.doesNotMatch(cssContent, /hsl\(var/);
    assert.equal(cssContent.includes("@theme inline"), version === 4);
  }
});

test("Tailwind v3 export retains generated utilities and semantic defaults with valid JavaScript", () => {
  let state = reducer(undefined, applyGeneration(palette()));
  for (const result of [generateSpacing(), generateRadius(), generateSizing()]) state = reducer(state, applyGeneration(result));
  const configContent = exportTailwindConfig(state.present);
  const sandbox = { module: { exports: {} }, require: () => () => {} };
  vm.runInNewContext(configContent, sandbox);
  const extension = sandbox.module.exports.theme.extend;
  assert.equal(extension.spacing[24], "var(--dt-space-24)");
  assert.equal(extension.borderRadius.md, "var(--dt-radius-md)");
  assert.equal(extension.borderRadius.DEFAULT, "var(--dt-radius-default)");
  assert.equal(extension.width.container, "var(--dt-size-container)");
  assert.equal(extension.maxWidth.container, "var(--dt-size-container)");
  assert.match(extension.colors.secondary[500], /var\(--dt-color-secondary-500\)/);
  assert.match(extension.colors.secondary.DEFAULT, /var\(--secondary\)/);
  assert.match(extension.colors.white.DEFAULT, /var\(--dt-color-white-default\)/);
  assert.doesNotMatch(configContent, /hsl\(var/);
});

test("theme validation and JSON import preserve every generated token, source, and recipe", () => {
  const initial = reducer(undefined, { type: "init" });
  let state = reducer(initial, applyGeneration(palette()));
  for (const result of [generateSpacing(), generateRadius(), generateSizing()]) state = reducer(state, applyGeneration(result));
  const validated = validateTheme(state.present);
  assert.deepEqual(validated, state.present);
  assert.notEqual(validated.generation, state.present.generation);
  for (const record of Object.values(validated.generation)) {
    assert.ok(Array.isArray(record.sources) && record.sources.length > 0);
    assert.ok(Array.isArray(record.tokens) && record.tokens.length > 0);
    assert.ok(record.tokens.every((token) => token.reason));
  }
  const exported = exportThemeJson(state.present);
  const imported = importTheme(exported, initial.present).tokens;
  assert.deepEqual(imported, state.present);
  assert.deepEqual(validateTheme({ tokens: imported }), state.present);
});

test("theme import rejects malformed generation metadata and unsafe reference or token names", () => {
  const { present } = reducer(undefined, applyGeneration(palette()));
  const invalidRecipes = [
    (recipe) => { recipe.tokens = {}; },
    (recipe) => { recipe.sources[0].url = "javascript:alert(1)"; },
    (recipe) => { recipe.tokens[0].key = "__proto__.500"; },
    (recipe) => { recipe.tokens[1].key = recipe.tokens[0].key; },
    (recipe) => { recipe.category = "radius"; },
  ];
  for (const invalidate of invalidRecipes) {
    const theme = structuredClone(present);
    invalidate(theme.generation.colors);
    assert.throws(() => validateTheme(theme));
    assert.throws(() => importTheme(JSON.stringify({ tokens: theme }), present));
  }
});

test("manual edits are distinguished from source-backed generated values in exports", () => {
  const result = generateSpacing();
  let state = reducer(undefined, applyGeneration(result));
  state = reducer(state, updateToken({ path: ["foundation", "spacing", "4"], value: "17px" }));
  const comments = generationComments(state.present);
  assert.match(comments, /spacing\.4: manually edited after generation; current value 17px/);
  assert.match(comments, /spacing\.3 = 0\.75rem:/);
});

test("root font changes retain generated rem values and explain their original pixel conversion", () => {
  const result = generateRadius({ rootFontSize: 16 });
  let state = reducer(undefined, applyGeneration(result));
  const originalRadius = state.present.foundation.radius.md;
  state = reducer(state, updateSettings({ key: "baseFontSize", value: "20px" }));
  assert.equal(state.present.foundation.radius.md, originalRadius);
  assert.equal(state.present.generation.radius.parameters.rootFontSize, "16px");
  const comments = generationComments(state.present);
  assert.match(comments, /The root changed from 16px at generation to 20px/);
  assert.match(comments, /reference pixel sizes describe the original conversion/);
  assert.match(comments, /radius\.md = 0\.375rem:/);
  assert.doesNotMatch(comments, /radius\.md: manually edited/);
  const reverted = reducer(state, undo());
  assert.doesNotMatch(generationComments(reverted.present), /The root changed/);

  const pixelResult = generateRadius({ rootFontSize: 16, unit: "px" });
  let pixelState = reducer(undefined, applyGeneration(pixelResult));
  pixelState = reducer(pixelState, updateSettings({ key: "baseFontSize", value: "20px" }));
  assert.doesNotMatch(generationComments(pixelState.present), /The root changed/);
});
