import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';
import { themeTemplates } from '../src/lib/theme-templates.ts';
import { importTheme, exportThemeJson, exportThemeCss, exportTailwindConfig, validateTheme } from '../src/lib/theme-io.ts';
const copy = () => structuredClone(defaultDesignTokens);

test('JSON restores all tokens exactly, accepts legacy saved wrapper', () => {
  const theme = copy(); theme.foundation.colors.brand = { 500: '#ff3366' };
  assert.deepEqual(importTheme(exportThemeJson(theme), copy()).tokens, theme);
  assert.deepEqual(validateTheme({tokens: theme}), theme);
});
test('own Tailwind v4 CSS roundtrips the default theme', () => {
  assert.deepEqual(importTheme(exportThemeCss(copy()), copy()).tokens, copy());
});
test('v3 colors use complete values rather than wrapping hex in hsl', () => {
  const css = exportThemeCss(copy(), 3); const config = exportTailwindConfig(copy());
  assert.match(css, /--dt-color-blue-500: #3b82f6;/);
  assert.match(config, /var\(--primary\)/);
  assert.doesNotMatch(config, /hsl\(var/);
  assert.doesNotMatch(css, /@theme/);
});
test('common shadcn HSL values and dark mode update semantic tokens', () => {
  const result = importTheme(':root { --primary: 262 83% 58%; --radius: .75rem; } .dark { --primary: #a78bfa; }', copy());
  assert.deepEqual(result.tokens.semantic.colors.intent.primary, {light:'hsl(262 83% 58%)', dark:'#a78bfa'});
  assert.equal(result.tokens.foundation.radius.md, '.75rem');
});
test('Tailwind @theme imports color palettes and font variables', () => {
  const result = importTheme('@theme { --color-brand-500: #f036a9; --font-sans: Georgia, serif; --spacing-4: 1.25rem; }', copy());
  assert.equal(result.tokens.foundation.colors.brand[500], '#f036a9');
  assert.equal(result.tokens.foundation.typography.family.sans, 'Georgia, serif');
  assert.equal(result.tokens.foundation.spacing[4], '1.25rem');
});
test('invalid JSON and shapes leave the input theme untouched', () => {
  const initial = copy(); const before = copy();
  assert.throws(() => importTheme('{"foundation":{}}', initial), /Missing required/);
  assert.throws(() => importTheme('{', initial), /Invalid JSON/);
  assert.deepEqual(initial, before);
});
test('rejects unsafe object keys and CSS injection', () => {
  const initial = copy();
  const unsafe = JSON.stringify(initial).replace('"16px"', '"16px; color: red"');
  assert.throws(() => importTheme(unsafe, initial), /unsupported CSS/);
  assert.throws(() => importTheme('{"__proto__":{}}', initial), /Unsupported token/);
  assert.throws(() => importTheme(':root { --primary: url(https://example.com/x); }', initial), /unsupported CSS/);
});
test('unknown CSS does not import a default or empty theme', () => {
  assert.throws(() => importTheme('body { color: red; }', copy()), /No supported/);
  assert.throws(() => importTheme(':root { --unrelated: red; }', copy()), /No supported/);
  assert.throws(() => importTheme(':root { --primary: red;', copy()), /incomplete/);
});
test('rejects unresolved and circular CSS custom properties', () => {
  assert.throws(() => importTheme(':root { --primary: var(--missing); }', copy()), /missing/);
  assert.throws(() => importTheme(':root { --primary: var(--x); --x: var(--y); --y: var(--x); }', copy()), /Circular/);
});
test('Tailwind export includes white utility without DEFAULT suffix', () => {
  assert.match(exportThemeCss(copy()), /--color-white: var\(--dt-color-white-default\)/);
});

test('every preset CSS roundtrips into a fresh default theme', () => {
  for (const preset of themeTemplates) {
    assert.deepEqual(importTheme(exportThemeCss(preset.tokens), copy()).tokens, preset.tokens, preset.name);
  }
});
test('custom palette refs and explicit light/dark aliases roundtrip into defaults', () => {
  const theme = copy();
  theme.foundation.colors.brand = { 50: '#fff7fc', 500: '#f036a9', 600: '#d42692' };
  theme.semantic.colors.intent.primary = { light: '{color.brand.600}', dark: '{color.brand.500}' };
  theme.components.button.bg.hover = { light: '{color.intent.primary.light}', dark: '{color.intent.primary.dark}' };
  assert.deepEqual(importTheme(exportThemeCss(theme), copy()).tokens, theme);
});
test('dark export rebinds backing aliases and accessible button foreground', () => {
  const css = exportThemeCss(copy());
  const dark = css.slice(css.indexOf('.dark {'), css.indexOf('html {'));
  assert.match(dark, /--dt-button-bg-default: var\(--dt-color-intent-primary\)/);
  assert.match(dark, /--primary: var\(--dt-color-intent-primary\)/);
  assert.match(dark, /--primary-foreground: var\(--dt-button-text-default\)/);
});
test('rejects cycles even when the referenced variable maps to an existing token', () => {
  assert.throws(() => importTheme(':root { --color-blue-500: var(--color-blue-500); }', copy()), /Circular/);
  const theme = copy();
  theme.semantic.colors.intent.primary.light = '{color.intent.primary}';
  assert.throws(() => importTheme(exportThemeJson(theme), copy()), /Circular/);
});

test('exported Tailwind v3 config compiles opacity utilities', async () => {
  const config = JSON.parse(exportTailwindConfig(copy()).split('module.exports = ')[1].replace(/;\s*$/, ''));
  config.content = [{raw: '<div class="bg-primary/50 text-blue-500/25 rounded-md font-sans"></div>'}];
  const compiled = spawnSync(process.execPath, ['-e', `const config = JSON.parse(require('fs').readFileSync(0, 'utf8')); require('postcss')([require('tailwindcss')(config)]).process('@tailwind utilities;', {from: undefined}).then(result => process.stdout.write(result.css)).catch(error => { console.error(error); process.exitCode = 1; });`], { input: JSON.stringify(config), encoding: 'utf8' });
  assert.equal(compiled.status, 0, compiled.stderr);
  assert.match(compiled.stdout, /calc\(0\.5 \* 100%\)/);
  assert.match(compiled.stdout, /calc\(0\.25 \* 100%\)/);
  assert.match(compiled.stdout, /--dt-font-family-sans/);
});

test('wrapped HSL channel variables are normalized once', () => {
  const theme = importTheme(':root { --brand-channels: 262 83% 58%; --primary: hsl(var(--brand-channels)); }', copy()).tokens;
  assert.equal(theme.semantic.colors.intent.primary.light, 'hsl(262 83% 58%)');
});
