import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyGeneratedPalette,
  contrastRatio,
  generatePalette,
  isValidPaletteName,
  normalizeHexColor,
  PALETTE_SHADES,
  randomPaletteSeed,
} from '../src/lib/palette-generator.ts';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';

const seeds = ['#6366f1', '#000000', '#ffffff', '#ffff00', '#ff0000', '#00ff00', '#0000ff', '#eee', '#123'];

test('seed validation accepts shorthand and rejects invalid or alpha colors', () => {
  assert.equal(normalizeHexColor(' #AbC '), '#aabbcc');
  assert.equal(normalizeHexColor('#ABCDEF'), '#abcdef');
  for (const invalid of ['', '#12', '#12345g', 'blue', '#12345678']) {
    assert.equal(normalizeHexColor(invalid), null);
    assert.throws(() => generatePalette(invalid), /valid hex color/);
  }
});

test('palette names remain usable in token references and reject unsafe object keys', () => {
  assert.ok(isValidPaletteName('brand-2'));
  for (const invalid of ['', '__proto__', 'constructor', 'prototype', 'brand.name', '-brand', 'Brand', 'a'.repeat(41)]) {
    assert.equal(isValidPaletteName(invalid), false);
    assert.throws(() => applyGeneratedPalette(defaultDesignTokens, invalid, generatePalette('#123456')), /palette name/);
  }
});

test('generated tones retain the seed at 500 and get darker from 50 to 950', () => {
  for (const seed of seeds) {
    const palette = generatePalette(seed);
    assert.deepEqual(Object.keys(palette), PALETTE_SHADES);
    assert.equal(palette['500'], normalizeHexColor(seed));
    let previous = Infinity;
    for (const color of Object.values(palette)) {
      assert.match(color, /^#[a-f0-9]{6}$/);
      const brightness = contrastRatio(color, '#000000');
      assert.ok(brightness <= previous, `${seed}: shades should get darker`);
      previous = brightness;
    }
  }
});

test('applying a palette preserves the original theme and unrelated tokens', () => {
  const original = structuredClone(defaultDesignTokens);
  original.foundation.colors.brand = { DEFAULT: '#abcdef', custom: '#112233' };
  const snapshot = structuredClone(original);
  const palette = generatePalette('#6366f1');
  const applied = applyGeneratedPalette(original, 'brand', palette, true);
  assert.deepEqual(original, snapshot);
  assert.deepEqual(applied.foundation.colors.brand, { DEFAULT: '#abcdef', custom: '#112233', ...palette });
  assert.deepEqual(applied.foundation.typography, original.foundation.typography);
  assert.deepEqual(applied.semantic.colors.intent.success, original.semantic.colors.intent.success);
  assert.deepEqual(applied.components.button.bg.disabled, original.components.button.bg.disabled);
  assert.equal(applied.components.button.bg.default.light, '{color.intent.primary.light}');
  assert.equal(applied.components.button.bg.default.dark, '{color.intent.primary.dark}');
});

test('adding foundation colors alone leaves semantic and component styles intact', () => {
  const applied = applyGeneratedPalette(defaultDesignTokens, 'white', generatePalette('#112233'), false);
  assert.equal(applied.foundation.colors.white.DEFAULT, '#ffffff');
  assert.deepEqual(applied.semantic, defaultDesignTokens.semantic);
  assert.deepEqual(applied.components, defaultDesignTokens.components);
});

test('generated primary button colors meet text contrast in both modes, including extreme seeds', () => {
  assert.equal(contrastRatio('#ffffff', '#000000'), 21);
  assert.equal(contrastRatio('#123456', '#123456'), 1);
  for (const seed of seeds) {
    const palette = generatePalette(seed);
    const applied = applyGeneratedPalette(defaultDesignTokens, 'brand', palette);
    for (const mode of ['light', 'dark']) {
      const foreground = applied.components.button.text.default[mode];
      const references = [
        applied.semantic.colors.intent.primary[mode],
        applied.components.button.bg.hover[mode],
        applied.components.button.bg.active[mode],
      ];
      for (const reference of references) {
        const shade = reference.match(/^\{color\.brand\.(\d+)\}$/)?.[1];
        assert.ok(shade, `${seed}: expected a reference to the generated palette`);
        assert.ok(contrastRatio(palette[shade], foreground) >= 4.5, `${seed}: insufficient ${mode} button contrast`);
      }
    }
  }
});

test('random seeds can always be used to generate complete palettes', () => {
  for (let i = 0; i < 30; i++) {
    const seed = randomPaletteSeed();
    assert.equal(normalizeHexColor(seed), seed);
    assert.equal(Object.keys(generatePalette(seed)).length, 11);
  }
});
