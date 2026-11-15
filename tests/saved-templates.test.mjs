import test from 'node:test';
import assert from 'node:assert/strict';
import { createSavedTemplate, getTemplateSwatches, parseSavedTemplates, SAVED_TEMPLATES_STORAGE_KEY } from '../src/lib/saved-templates.ts';
import { applyGeneratedPalette, generatePalette } from '../src/lib/palette-generator.ts';
import { generateRadius, generateSizing, generateSpacing } from '../src/lib/scale-generators.ts';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';
import { getFontStylesheetUrl } from '../src/lib/font-options.ts';
import { makeStore } from '../src/store/store.ts';
import { applyFontSetup, applyGeneration, redo, setTokens, undo } from '../src/store/features/themeSlice.ts';
import { hydrateSavedTemplates, saveThemeTemplate } from '../src/store/features/templatesSlice.ts';

function storageFor(t, initial = null) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const data = new Map(initial === null ? [] : [[SAVED_TEMPLATES_STORAGE_KEY, initial]]);
  const storage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  });
  return { storage, data };
}

const generatedTheme = () => applyGeneratedPalette(defaultDesignTokens, 'brand', generatePalette('#ef4872'), true);

test('saved templates are independent, named full snapshots with resolved generated swatches', () => {
  const theme = generatedTheme();
  const snapshot = structuredClone(theme);
  const first = createSavedTemplate('  Coral system  ', theme);
  const second = createSavedTemplate('Coral system', theme);
  assert.equal(first.name, 'Coral system');
  assert.equal(first.description, 'Saved in this browser.');
  assert.notEqual(first.id, second.id);
  assert.deepEqual(first.tokens, snapshot);
  assert.deepEqual(first.swatches, getTemplateSwatches(theme));
  for (const mode of ['light', 'dark']) {
    const shade = theme.semantic.colors.intent.primary[mode].match(/\.(\d+)\}/)[1];
    assert.ok(first.swatches.includes(theme.foundation.colors.brand[shade]));
  }
  assert.ok(first.swatches.every(color => !color.includes('{')));
  theme.foundation.colors.brand['500'] = '#000000';
  theme.semantic.colors.intent.primary.light = '#000000';
  theme.components.button.padding.x = '99px';
  assert.deepEqual(first.tokens, snapshot);
  first.tokens.foundation.colors.brand['500'] = '#123456';
  assert.deepEqual(second.tokens, snapshot);
});

test('saving, reloading, and applying restore both generated modes and retain undo', t => {
  storageFor(t);
  const store = makeStore();
  const generated = generatedTheme();
  store.dispatch(setTokens(generated));
  const historyBeforeSave = store.getState().theme.past.length;
  const result = store.dispatch(saveThemeTemplate({ name: 'Coral', tokens: store.getState().theme.present }));
  assert.equal(result.ok, true);
  assert.equal(store.getState().theme.past.length, historyBeforeSave);
  const reloaded = makeStore();
  reloaded.dispatch(hydrateSavedTemplates());
  assert.equal(reloaded.getState().templates.ready, true);
  assert.equal(reloaded.getState().templates.error, '');
  assert.equal(reloaded.getState().templates.items[0].id, result.template.id);
  assert.deepEqual(reloaded.getState().templates.items[0].tokens, generated);
  reloaded.dispatch(setTokens(structuredClone(reloaded.getState().templates.items[0].tokens)));
  assert.deepEqual(reloaded.getState().theme.present, generated);
  reloaded.dispatch(undo());
  assert.deepEqual(reloaded.getState().theme.present, defaultDesignTokens);
});

test('saved font setup restores both languages and their webfont loading after hydration', t => {
  storageFor(t);
  const store = makeStore();
  store.dispatch(applyFontSetup({ en: '"Lato"', th: '"Prompt"' }));
  const configured = store.getState().theme.present;
  const configuredUrl = getFontStylesheetUrl(configured);
  assert.match(configuredUrl, /family=Lato:wght@400;500;700/);
  assert.match(configuredUrl, /family=Prompt:wght@400;500;700/);
  const result = store.dispatch(saveThemeTemplate({ name: 'Bilingual type', tokens: configured }));
  assert.equal(result.ok, true);

  const reloaded = makeStore();
  reloaded.dispatch(hydrateSavedTemplates());
  const saved = reloaded.getState().templates.items[0];
  assert.equal(saved.name, 'Bilingual type');
  assert.deepEqual(saved.tokens, configured);
  assert.equal(getFontStylesheetUrl(saved.tokens), configuredUrl);
  reloaded.dispatch(setTokens(structuredClone(saved.tokens)));
  assert.deepEqual(reloaded.getState().theme.present.foundation.typography.family, {
    ...defaultDesignTokens.foundation.typography.family,
    en: '"Lato"',
    th: '"Prompt"',
    sans: '{font.family.en}, {font.family.th}, sans-serif',
  });
  assert.equal(getFontStylesheetUrl(reloaded.getState().theme.present), configuredUrl);
  reloaded.dispatch(undo());
  assert.equal(getFontStylesheetUrl(reloaded.getState().theme.present), undefined);
  reloaded.dispatch(redo());
  assert.equal(getFontStylesheetUrl(reloaded.getState().theme.present), configuredUrl);
  assert.deepEqual(reloaded.getState().templates.items[0], saved);
});

test('foundation-only palettes stay visible in saved-template swatches after reload', t => {
  storageFor(t);
  const theme = applyGeneratedPalette(defaultDesignTokens, 'brand', generatePalette('#ba34d8'), false);
  assert.deepEqual(theme.semantic, defaultDesignTokens.semantic);
  assert.notDeepEqual(getTemplateSwatches(theme, 'brand'), getTemplateSwatches(defaultDesignTokens));
  const store = makeStore();
  const result = store.dispatch(saveThemeTemplate({ name: 'Extra purple', tokens: theme, paletteName: 'brand' }));
  assert.equal(result.ok, true);
  assert.equal(result.template.paletteName, 'brand');
  assert.ok(result.template.swatches.includes(theme.foundation.colors.brand['500']));
  const reloaded = makeStore();
  reloaded.dispatch(hydrateSavedTemplates());
  const restored = reloaded.getState().templates.items[0];
  assert.equal(restored.paletteName, 'brand');
  assert.deepEqual(restored.swatches, result.template.swatches);
  assert.deepEqual(restored.tokens, theme);
  // Undo or applying a built-in can remove the focused family; fall back safely.
  assert.deepEqual(getTemplateSwatches(defaultDesignTokens, 'brand'), getTemplateSwatches(defaultDesignTokens));
  const withoutFamily = createSavedTemplate('Reset theme', defaultDesignTokens, 'brand');
  assert.equal(withoutFamily.paletteName, undefined);
  assert.deepEqual(parseSavedTemplates(JSON.stringify([withoutFamily])), [withoutFamily]);
});

test('Generate palette application saves both named ramps, color modes, provenance, and template undo/redo', t => {
  storageFor(t);
  const store = makeStore();
  const generated = generatePalette({ primary: '#e84371', secondary: '#12a6bd', method: 'oklch', relationship: 'custom' });
  const recipe = {
    ...generated,
    parameters: { ...generated.parameters, primaryName: 'brand', secondaryName: 'accent', makePrimary: 'true' },
    tokens: generated.tokens.map(token => ({
      ...token,
      key: token.key.replace(/^primary\./, 'brand.').replace(/^secondary\./, 'accent.'),
    })),
  };
  store.dispatch(applyGeneration(recipe));
  const applied = structuredClone(store.getState().theme.present);
  assert.equal(store.getState().theme.past.length, 1);
  assert.equal(applied.foundation.colors.brand['500'], '#e84371');
  assert.equal(applied.foundation.colors.accent['500'], '#12a6bd');
  for (const token of recipe.tokens) {
    const [family, shade] = token.key.split('.');
    assert.equal(applied.foundation.colors[family][shade], token.value);
  }
  for (const mode of ['light', 'dark']) {
    assert.match(applied.semantic.colors.intent.primary[mode], /^\{color\.brand\./);
    assert.match(applied.semantic.colors.intent.secondary[mode], /^\{color\.accent\./);
  }
  assert.deepEqual(applied.generation.colors, recipe);
  const result = store.dispatch(saveThemeTemplate({ name: 'Generated duo', tokens: applied, paletteName: 'brand' }));
  assert.equal(result.ok, true);
  assert.equal(store.getState().theme.past.length, 1);
  const reloaded = makeStore();
  reloaded.dispatch(hydrateSavedTemplates());
  const saved = reloaded.getState().templates.items[0];
  assert.deepEqual(saved.tokens, applied);
  assert.deepEqual(saved.tokens.generation.colors.sources, recipe.sources);
  assert.ok(saved.swatches.includes('#e84371'));
  reloaded.dispatch(setTokens(structuredClone(saved.tokens)));
  assert.deepEqual(reloaded.getState().theme.present, applied);
  reloaded.dispatch(undo());
  assert.deepEqual(reloaded.getState().theme.present, defaultDesignTokens);
  reloaded.dispatch(redo());
  assert.deepEqual(reloaded.getState().theme.present, applied);
  assert.deepEqual(reloaded.getState().templates.items[0], saved);
});

test('generated spacing, radius, and sizing survive full-template reload and history with their recipes', t => {
  storageFor(t);
  const store = makeStore();
  const recipes = [
    generateSpacing({ method: 'carbon', scale: 1.5, unit: 'rem', rootFontSize: 16 }),
    generateRadius({ method: 'material', scale: 1.25, unit: 'px', rootFontSize: 16 }),
    generateSizing({ base: 18, step: 5, container: 92, unit: 'rem', rootFontSize: 16 }),
  ];
  for (const recipe of recipes) store.dispatch(applyGeneration(recipe));
  const applied = structuredClone(store.getState().theme.present);
  assert.equal(store.getState().theme.past.length, 3);
  for (const recipe of recipes) {
    assert.deepEqual(applied.generation[recipe.category], recipe);
    for (const token of recipe.tokens) {
      assert.equal(applied.foundation[recipe.category][token.key], token.value);
    }
  }
  const result = store.dispatch(saveThemeTemplate({ name: 'Generated dimensions', tokens: applied }));
  assert.equal(result.ok, true);
  assert.equal(store.getState().theme.past.length, 3);
  store.dispatch(undo());
  assert.equal(store.getState().theme.present.generation.sizing, undefined);
  assert.deepEqual(store.getState().theme.present.generation.radius, recipes[1]);
  store.dispatch(redo());
  assert.deepEqual(store.getState().theme.present, applied);
  const reloaded = makeStore();
  reloaded.dispatch(hydrateSavedTemplates());
  const saved = reloaded.getState().templates.items[0];
  assert.deepEqual(saved.tokens, applied);
  reloaded.dispatch(setTokens(structuredClone(saved.tokens)));
  assert.deepEqual(reloaded.getState().theme.present, applied);
  reloaded.dispatch(undo());
  assert.deepEqual(reloaded.getState().theme.present, defaultDesignTokens);
  reloaded.dispatch(redo());
  assert.deepEqual(reloaded.getState().theme.present, applied);
  assert.deepEqual(reloaded.getState().templates.items[0], saved);
});

test('saving multiple names preserves the latest storage, including another tab’s templates', t => {
  const { data } = storageFor(t);
  const store = makeStore();
  store.dispatch(hydrateSavedTemplates());
  const first = store.dispatch(saveThemeTemplate({ name: 'First', tokens: defaultDesignTokens }));
  assert.equal(first.ok, true);
  const external = createSavedTemplate('Another tab', generatedTheme());
  data.set(SAVED_TEMPLATES_STORAGE_KEY, JSON.stringify([first.template, external]));
  const last = store.dispatch(saveThemeTemplate({ name: 'Second', tokens: generatedTheme() }));
  assert.equal(last.ok, true);
  assert.deepEqual(store.getState().templates.items.map(item => item.name), ['First', 'Another tab', 'Second']);
  assert.deepEqual(parseSavedTemplates(data.get(SAVED_TEMPLATES_STORAGE_KEY)), store.getState().templates.items);
});

test('invalid names and token systems fail without changing stored templates or the current theme', t => {
  const { data } = storageFor(t);
  const store = makeStore();
  const before = store.getState().theme;
  for (const name of ['', '   ', 'a'.repeat(81)]) {
    const result = store.dispatch(saveThemeTemplate({ name, tokens: defaultDesignTokens }));
    assert.equal(result.ok, false);
    assert.match(result.error, /name/);
  }
  const broken = generatedTheme();
  broken.semantic.colors.intent.primary.light = '{color.missing.500}';
  const result = store.dispatch(saveThemeTemplate({ name: 'Broken', tokens: broken }));
  assert.equal(result.ok, false);
  assert.equal(data.size, 0);
  assert.deepEqual(store.getState().templates.items, []);
  assert.equal(store.getState().theme, before);
});

test('storage write failure retains saved work and reports failure instead of adding an unsaved card', t => {
  const existing = createSavedTemplate('Existing', defaultDesignTokens);
  const serialized = JSON.stringify([existing]);
  const { storage, data } = storageFor(t, serialized);
  const store = makeStore();
  store.dispatch(hydrateSavedTemplates());
  storage.setItem = () => { throw new Error('QuotaExceededError'); };
  const result = store.dispatch(saveThemeTemplate({ name: 'Cannot persist', tokens: generatedTheme() }));
  assert.equal(result.ok, false);
  assert.match(result.error, /unavailable or full/);
  assert.equal(data.get(SAVED_TEMPLATES_STORAGE_KEY), serialized);
  assert.deepEqual(store.getState().templates.items, [existing]);
  assert.equal(store.getState().templates.error, result.error);
});

test('blocked storage reads finish hydration and do not break the theme editor', t => {
  storageFor(t);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get() { throw new Error('SecurityError'); },
  });
  const store = makeStore();
  store.dispatch(hydrateSavedTemplates());
  assert.equal(store.getState().templates.ready, true);
  assert.match(store.getState().templates.error, /Unable to read/);
  const result = store.dispatch(saveThemeTemplate({ name: 'Blocked', tokens: generatedTheme() }));
  assert.equal(result.ok, false);
  assert.deepEqual(store.getState().templates.items, []);
  assert.deepEqual(store.getState().theme.present, defaultDesignTokens);
});

test('damaged storage is reported and never overwritten when saving', t => {
  const serialized = '{damaged json';
  const { data } = storageFor(t, serialized);
  const store = makeStore();
  store.dispatch(hydrateSavedTemplates());
  assert.equal(store.getState().templates.ready, true);
  assert.match(store.getState().templates.error, /damaged or incompatible/);
  const result = store.dispatch(saveThemeTemplate({ name: 'New', tokens: generatedTheme() }));
  assert.equal(result.ok, false);
  assert.equal(data.get(SAVED_TEMPLATES_STORAGE_KEY), serialized);
  assert.deepEqual(store.getState().templates.items, []);
});

test('saved-template parser validates metadata, unique identities, and complete tokens', () => {
  assert.deepEqual(parseSavedTemplates(null), []);
  const valid = createSavedTemplate('Valid', generatedTheme());
  const brokenTheme = structuredClone(valid);
  delete brokenTheme.tokens.components;
  for (const value of [
    {}, [null], [{ ...valid, id: 'blueprint' }], [{ ...valid, name: ' ' }],
    [{ ...valid, description: null }], [{ ...valid, swatches: [] }],
    [{ ...valid, paletteName: {} }], [{ ...valid, paletteName: '__proto__' }],
    [valid, valid], [brokenTheme],
  ]) {
    assert.throws(() => parseSavedTemplates(JSON.stringify(value)));
  }
  const parsed = parseSavedTemplates(JSON.stringify([valid]));
  assert.deepEqual(parsed, [valid]);
  parsed[0].tokens.foundation.colors.brand['500'] = '#000000';
  assert.notEqual(valid.tokens.foundation.colors.brand['500'], '#000000');
});
