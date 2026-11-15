import { createSlice, current, type PayloadAction } from '@reduxjs/toolkit';
import type { DesignTokenSettings, DesignTokenSystem } from '@/types/token-system';
import { defaultDesignTokens } from '@/lib/token-defaults';

export interface ThemeState {
  past: DesignTokenSystem[];
  present: DesignTokenSystem;
  future: DesignTokenSystem[];
}

export const HISTORY_LIMIT = 100;
const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);
const initialState: ThemeState = { past: [], present: defaultDesignTokens, future: [] };

function remember(state: ThemeState) {
  state.past.push(current(state.present));
  if (state.past.length > HISTORY_LIMIT) state.past.shift();
  state.future = [];
}

function replaceTokens(state: ThemeState, tokens: DesignTokenSystem) {
  if (JSON.stringify(state.present) === JSON.stringify(tokens)) return;
  remember(state);
  state.present = tokens;
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<DesignTokenSystem>) => replaceTokens(state, action.payload),
    updateToken: (state, action: PayloadAction<{ path: string[]; value: string }>) => {
      const { path, value } = action.payload;
      if (!path.length || path.some(key => blockedKeys.has(key))) return;
      let target: unknown = state.present;
      for (const key of path.slice(0, -1)) {
        if (!target || typeof target !== 'object' || !Object.hasOwn(target, key)) return;
        target = (target as Record<string, unknown>)[key];
      }
      const key = path[path.length - 1];
      if (!target || typeof target !== 'object' || !Object.hasOwn(target, key)) return;
      const record = target as Record<string, unknown>;
      // Individual field edits may change string leaves only; templates and imports
      // replace the full validated system through setTokens/load.
      if (typeof record[key] !== 'string' || record[key] === value) return;
      remember(state);
      record[key] = value;
    },
    updateSettings: (state, action: PayloadAction<{ key: keyof DesignTokenSettings; value: string }>) => {
      const { key, value } = action.payload;
      if (key !== 'baseFontSize' || state.present.settings.baseFontSize === value) return;
      remember(state);
      state.present.settings[key] = value;
    },
    undo: (state) => {
      const previous = state.past.pop();
      if (!previous) return;
      state.future.unshift(state.present);
      state.present = previous;
    },
    redo: (state) => {
      const next = state.future.shift();
      if (!next) return;
      state.past.push(state.present);
      if (state.past.length > HISTORY_LIMIT) state.past.shift();
      state.present = next;
    },
    reset: (state) => replaceTokens(state, defaultDesignTokens),
    load: (state, action: PayloadAction<DesignTokenSystem>) => replaceTokens(state, action.payload),
  },
});

export const { setTokens, updateToken, updateSettings, undo, redo, reset, load } = themeSlice.actions;
export default themeSlice.reducer;
