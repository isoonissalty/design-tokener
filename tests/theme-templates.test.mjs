import test from 'node:test';
import assert from 'node:assert/strict';
import { themeTemplates, tokensFromTemplate } from '../src/lib/theme-templates.ts';
import { generateTokenCss, themeColorMappings } from '../src/lib/css-generator.ts';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';

function colorRegistry(tokens) {
  const registry = new Map();
  function visit(value, path) {
    registry.set(path, value);
    if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) visit(child, `${path}.${key}`);
    }
  }
  visit(tokens.foundation.colors, 'color');
  visit(tokens.semantic.colors, 'color');
  return registry;
}

function resolveColor(value, mode, registry, seen = new Set()) {
  if (value && typeof value === 'object') return resolveColor(value[mode], mode, registry, seen);
  const match = /^\{([^}]+)\}$/.exec(value);
  if (!match) return value;
  assert.ok(!seen.has(match[1]), `Cyclic color reference: ${match[1]}`);
  assert.ok(registry.has(match[1]), `Missing color reference: ${match[1]}`);
  seen.add(match[1]);
  return resolveColor(registry.get(match[1]), mode, registry, seen);
}

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i);
  return hex.slice(1).match(/../g)
    .map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(first, second) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('the library contains at least eight distinct complete theme templates', () => {
  assert.ok(themeTemplates.length >= 8);
  assert.equal(new Set(themeTemplates.map(template => template.id)).size, themeTemplates.length);
  assert.equal(new Set(themeTemplates.map(template => template.name)).size, themeTemplates.length);
  assert.equal(new Set(themeTemplates.map(template => JSON.stringify(template.tokens))).size, themeTemplates.length);
  for (const template of themeTemplates) {
    assert.ok(template.description);
    assert.ok(template.swatches.length >= 3);
    for (const color of template.swatches) assert.match(color, /^#[0-9a-f]{6}$/i);
    for (const section of ['settings', 'foundation', 'semantic', 'components']) assert.ok(template.tokens[section]);
  }
});

test('every template exports CSS with all token references declared', () => {
  for (const template of themeTemplates) {
    const css = generateTokenCss(template.tokens);
    const text = [...css.root, ...css.dark, themeColorMappings].join('\n');
    const declarations = new Set([...text.matchAll(/(--[\w-]+):/g)].map(match => match[1]));
    for (const match of text.matchAll(/var\((--[\w-]+)\)/g)) {
      assert.ok(declarations.has(match[1]), `${template.name}: missing ${match[1]}`);
    }
    assert.ok(css.dark.length > 0, `${template.name} must provide dark mode values`);
    assert.doesNotMatch(text, /\{color\.|\{font\.|\{space\.|\{radius\./);
  }
});

test('template copies can be edited without mutating the library or defaults', () => {
  const originalDefaults = JSON.stringify(defaultDesignTokens);
  for (const template of themeTemplates) {
    const originalTemplate = JSON.stringify(template.tokens);
    const first = tokensFromTemplate(template.id);
    const second = tokensFromTemplate(template.id);
    assert.deepEqual(first, template.tokens);
    first.foundation.radius.md = '500px';
    first.foundation.colors.blue['500'] = '#123456';
    first.semantic.colors.text.primary.light = '#654321';
    first.components.button.padding.x = '100px';
    assert.equal(JSON.stringify(template.tokens), originalTemplate);
    assert.deepEqual(second, template.tokens);
  }
  assert.equal(JSON.stringify(defaultDesignTokens), originalDefaults);
  assert.throws(() => tokensFromTemplate('does-not-exist'), /Unknown theme template/);
});

test('template body and enabled button states meet WCAG AA contrast in both modes', () => {
  for (const template of themeTemplates) {
    const registry = colorRegistry(template.tokens);
    for (const mode of ['light', 'dark']) {
      const buttonForeground = resolveColor(template.tokens.components.button.text.default, mode, registry);
      for (const state of ['default', 'hover', 'active']) {
        const buttonBackground = resolveColor(template.tokens.components.button.bg[state], mode, registry);
        assert.ok(contrast(buttonBackground, buttonForeground) >= 4.5, `${template.name} ${mode} ${state} button contrast`);
      }
      const canvas = resolveColor(template.tokens.semantic.colors.bg.canvas, mode, registry);
      for (const role of ['primary', 'secondary']) {
        const foreground = resolveColor(template.tokens.semantic.colors.text[role], mode, registry);
        assert.ok(contrast(canvas, foreground) >= 4.5, `${template.name} ${mode} ${role} text contrast`);
      }
    }
  }
});
