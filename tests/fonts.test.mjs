import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { applyFontSetup, undo, redo } from '../src/store/features/themeSlice.ts';
import { defaultDesignTokens } from '../src/lib/token-defaults.ts';
import { fontOptions, fontPairings, getFontOption, getFontStylesheetUrl, isSafeFontFamily } from '../src/lib/font-options.ts';

const initialize = () => reducer(undefined, { type: '@@init' });
const choices = { en: '"Inter"', th: '"Noto Sans Thai"' };

test('font setup is one undoable transaction and preserves unrelated typography', () => {
  const initial = initialize();
  const applied = reducer(initial, applyFontSetup(choices));
  assert.equal(applied.past.length, 1);
  assert.deepEqual(applied.present.foundation.typography.family, {
    ...initial.present.foundation.typography.family,
    ...choices,
    sans: '{font.family.en}, {font.family.th}, sans-serif',
  });
  assert.deepEqual(applied.present.semantic, initial.present.semantic);
  assert.deepEqual(applied.present.foundation.typography.size, initial.present.foundation.typography.size);
  assert.deepEqual(applied.present.components, initial.present.components);
  assert.equal(initial.present.foundation.typography.family.en, undefined);
  const undone = reducer(applied, undo());
  assert.deepEqual(undone.present, initial.present);
  assert.deepEqual(reducer(undone, redo()).present, applied.present);
  assert.equal(reducer(applied, applyFontSetup(choices)), applied);
});

test('fonts can be changed independently without replacing a custom heading family', () => {
  const original = structuredClone(defaultDesignTokens);
  original.semantic.typography.heading.h1.fontFamily = '{font.family.serif}';
  let state = { past: [], present: original, future: [] };
  state = reducer(state, applyFontSetup(choices));
  state = reducer(state, applyFontSetup({ en: '"Roboto"', th: choices.th }));
  assert.equal(state.present.foundation.typography.family.en, '"Roboto"');
  assert.equal(state.present.foundation.typography.family.th, choices.th);
  assert.equal(state.present.semantic.typography.heading.h1.fontFamily, '{font.family.serif}');
});

test('font setup preserves unrelated custom family expressions', () => {
  const original = structuredClone(defaultDesignTokens);
  original.foundation.typography.family.serif = 'var(--app-serif)';
  original.semantic.typography.heading.h1.fontFamily = '{font.family.serif}';
  const initial = { past: [], present: original, future: [] };
  const applied = reducer(initial, applyFontSetup(choices));
  assert.equal(applied.present.foundation.typography.family.en, choices.en);
  assert.equal(applied.present.foundation.typography.family.th, choices.th);
  assert.equal(applied.present.foundation.typography.family.serif, 'var(--app-serif)');
  assert.deepEqual(applied.present.semantic, original.semantic);
  assert.deepEqual(reducer(applied, undo()).present, original);
});

test('invalid or unsafe setup values do not change state or history', () => {
  const initial = initialize();
  for (const value of ['', '   ', 'Inter; color:red', '</style>', '{font.family.sans}', 'url(https://example.test)', 'expression(alert(1))', '"Inter', 'Inter,', 'Inter\\3b color:red', '\nInter', '""', undefined, null, 123]) {
    assert.equal(reducer(initial, applyFontSetup({ en: value, th: choices.th })), initial, String(value));
    assert.equal(reducer(initial, applyFontSetup({ en: choices.en, th: value })), initial, String(value));
  }
  for (const value of ['"Acme UI", Arial, sans-serif', '"Noto Sans ไทย"', 'Georgia', "'Acme, Inc.'", 'Font-Name']) assert.ok(isSafeFontFamily(value), value);
});

test('imported font aliases are preserved when changing the other language', () => {
  const original = structuredClone(defaultDesignTokens);
  original.foundation.typography.family.en = '{font.family.serif}';
  original.foundation.typography.family.th = choices.th;
  let state = { past: [], present: original, future: [] };
  state = reducer(state, applyFontSetup({ en: '{font.family.serif}', th: '"Prompt"' }));
  assert.equal(state.past.length, 1);
  assert.equal(state.present.foundation.typography.family.en, '{font.family.serif}');
  assert.equal(state.present.foundation.typography.family.th, '"Prompt"');
  assert.deepEqual(reducer(state, undo()).present, original);
});

test('font setup rejects missing aliases and cycles in the prospective family graph', () => {
  const initial = initialize();
  for (const en of ['{font.family.sans}', '{font.family.en}', '{font.family.missing}', '{font.size.base}', '{font.family.serif}; color:red']) {
    assert.equal(reducer(initial, applyFontSetup({ en, th: choices.th })), initial, en);
  }
  assert.equal(reducer(initial, applyFontSetup({ en: '{font.family.th}', th: '{font.family.en}' })), initial);
  const original = structuredClone(defaultDesignTokens);
  original.foundation.typography.family.serif = '{font.family.sans}';
  const indirect = { past: [], present: original, future: [] };
  assert.equal(reducer(indirect, applyFontSetup({ en: '{font.family.serif}', th: choices.th })), indirect);
  const unsafe = structuredClone(defaultDesignTokens);
  unsafe.foundation.typography.family.serif = 'Georgia; color:red';
  const unsafeState = { past: [], present: unsafe, future: [] };
  assert.equal(reducer(unsafeState, applyFontSetup({ en: '{font.family.serif}', th: choices.th })), unsafeState);
});

test('Google font loading includes only complete catalog family names, once each', () => {
  assert.equal(getFontStylesheetUrl(defaultDesignTokens), undefined);
  const tokens = structuredClone(defaultDesignTokens);
  Object.assign(tokens.foundation.typography.family, choices, { serif: 'Inter, "Noto Sans Thai", Georgia, serif' });
  const url = new URL(getFontStylesheetUrl(tokens));
  assert.equal(url.origin, 'https://fonts.googleapis.com');
  assert.deepEqual(url.searchParams.getAll('family'), ['Inter:wght@400;500;700', 'Noto Sans Thai:wght@400;500;700']);
  assert.equal(url.searchParams.get('display'), 'swap');
  for (const value of ['"Inter UI"', '"Acme, Inter"', 'CustomInter', '"Unknown Font"']) {
    const custom = structuredClone(defaultDesignTokens);
    custom.foundation.typography.family.sans = value;
    assert.equal(getFontStylesheetUrl(custom), undefined, value);
  }
});

test('pairings reference available independent language choices', () => {
  for (const pairing of fontPairings) {
    for (const language of ['en', 'th']) {
      const option = fontOptions[language].find(candidate => candidate.id === pairing[language]);
      assert.ok(option, `${pairing.id}: ${language}`);
      assert.equal(getFontOption(language, option.family)?.id, option.id);
    }
  }
  assert.equal(getFontOption('en', "'inter'")?.id, 'inter');
  assert.equal(getFontOption('en', 'Inter, sans-serif'), undefined);
  assert.equal(getFontOption('th', '"Inter"'), undefined);
});
