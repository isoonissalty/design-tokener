import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { updateToken, updateSettings, undo, redo, setTokens, reset, HISTORY_LIMIT } from '../src/store/features/themeSlice.ts';

const initialize = () => reducer(undefined, { type: '@@init' });
const edit = value => updateToken({ path: ['foundation', 'colors', 'blue', '500'], value });

test('unchanged fields and an already-default reset preserve the current history', () => {
  const state = initialize();
  assert.equal(state.past.length, 0);
  assert.equal(reducer(state, edit(state.present.foundation.colors.blue['500'])), state);
  assert.equal(reducer(state, reset()), state);
});

test('invalid, non-leaf, and prototype token paths cannot mutate the system', () => {
  const state = initialize();
  for (const unsafePath of [[], ['foundation', 'missing', 'value'], ['__proto__', 'polluted'], ['constructor', 'prototype', 'polluted'], ['foundation', 'colors']]) {
    assert.equal(reducer(state, updateToken({ path: unsafePath, value: 'bad' })), state, `Ignored ${unsafePath.join('.')}`);
  }
  assert.equal({}.polluted, undefined);
});

test('undo and redo restore immutable snapshots, and a new edit clears redo', () => {
  const initial = initialize();
  const originalColor = initial.present.foundation.colors.blue['500'];
  let state = reducer(initial, edit('#123456'));
  assert.equal(initial.present.foundation.colors.blue['500'], originalColor);
  assert.equal(state.past.length, 1);
  state = reducer(state, undo());
  assert.equal(state.present.foundation.colors.blue['500'], originalColor);
  state = reducer(state, redo());
  assert.equal(state.present.foundation.colors.blue['500'], '#123456');
  state = reducer(state, undo());
  state = reducer(state, edit('#654321'));
  assert.equal(state.future.length, 0);
});

test('template and imported system replacement uses one undo step', () => {
  const initial = initialize();
  const replaced = structuredClone(initial.present);
  replaced.foundation.colors.blue['500'] = '#abcdef';
  replaced.foundation.radius.md = '1rem';
  let state = reducer(initial, setTokens(replaced));
  assert.equal(state.present.foundation.colors.blue['500'], '#abcdef');
  assert.equal(state.present.foundation.radius.md, '1rem');
  assert.equal(state.past.length, 1);
  state = reducer(state, undo());
  assert.deepEqual(state.present, initial.present);
});

test('root settings participate in undo without creating no-op history', () => {
  const initial = initialize();
  let state = reducer(initial, updateSettings({ key: 'baseFontSize', value: '20px' }));
  assert.equal(state.present.settings.baseFontSize, '20px');
  assert.equal(reducer(state, updateSettings({ key: 'baseFontSize', value: '20px' })), state);
  state = reducer(state, undo());
  assert.equal(state.present.settings.baseFontSize, initial.present.settings.baseFontSize);
});

test('history stays bounded while reset remains undoable', () => {
  let state = initialize();
  const initial = state.present;
  for (let index = 0; index < 150; index++) state = reducer(state, edit(`#${index.toString(16).padStart(6, '0')}`));
  assert.equal(state.past.length, HISTORY_LIMIT);
  const beforeReset = state.present;
  state = reducer(state, reset());
  assert.deepEqual(state.present, initial);
  assert.equal(state.past.length, HISTORY_LIMIT);
  state = reducer(state, undo());
  assert.deepEqual(state.present, beforeReset);
});
