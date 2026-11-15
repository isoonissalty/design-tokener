import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTokenCss, processTokenValue, themeColorMappings, toCssVar } from '../src/lib/css-generator.ts';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';

test('default theme and semantic mappings contain no unresolved token references', () => {
  const css = generateTokenCss(defaultDesignTokens);
  const text = [...css.root, ...css.dark, themeColorMappings].join('\n');
  const declarations = new Set([...text.matchAll(/(--[\w-]+):/g)].map(match => match[1]));
  for (const match of text.matchAll(/var\((--[\w-]+)\)/g)) {
    assert.ok(declarations.has(match[1]), `Missing declaration for ${match[1]}`);
  }
  assert.match(text, /--color-white-default: #ffffff;/);
  assert.match(text, /--color-bg-canvas: var\(--color-white-default\);/);
});

test('CSS variable naming matches camelCase, DEFAULT, and explicit mode references', () => {
  assert.equal(toCssVar(['color', 'white', 'DEFAULT']), '--color-white-default');
  assert.equal(processTokenValue('{text.heading.h1.fontSize}'), 'var(--text-heading-h1-font-size)');
  const tokens = structuredClone(defaultDesignTokens);
  tokens.components.button.bg.default.light = '{color.intent.primary.light}';
  tokens.components.button.bg.default.dark = '{color.intent.primary.dark}';
  const css = generateTokenCss(tokens);
  assert.ok(css.root.some(value => value.startsWith('--color-intent-primary-light:')));
  assert.ok(css.root.some(value => value.startsWith('--color-intent-primary-dark:')));
  assert.ok(css.dark.includes('--button-bg-default: var(--color-intent-primary-dark);'));
});

test('color formats and alpha are preserved and unsafe declarations cannot escape the preview', () => {
  for (const value of ['#abc', '#1234', '#12345678', 'oklch(0.7 0.1 200)', 'rgb(2 3 4 / 30%)', 'transparent']) {
    assert.equal(processTokenValue(value), value);
  }
  assert.equal(processTokenValue('red; } body { color: red'), 'initial');
  assert.equal(processTokenValue('</style><script>bad</script>'), 'initial');
});

test('preview root size scales token rems without changing exported values', () => {
  const tokens = structuredClone(defaultDesignTokens);
  tokens.settings.baseFontSize = '20px';
  const preview = generateTokenCss(tokens, { preview: true });
  const exported = generateTokenCss(tokens);
  assert.ok(preview.root.includes('--space-4: 20px;'));
  assert.ok(preview.root.includes('--font-size-sm: 17.5px;'));
  assert.ok(exported.root.includes('--space-4: 1rem;'));
});
