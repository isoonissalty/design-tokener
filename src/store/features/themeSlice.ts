import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { DesignTokenSystem } from '@/types/token-system';
import { defaultDesignTokens } from '@/lib/token-defaults';
import type { GenerationResult } from '@/types/generation';
import { readableForeground } from '@/lib/palette-generator';

interface ThemeState {
  past: DesignTokenSystem[];
  present: DesignTokenSystem;
  future: DesignTokenSystem[];
}

const initialState: ThemeState = {
  past: [],
  present: defaultDesignTokens,
  future: [],
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    applyGeneration: (state, action: PayloadAction<GenerationResult>) => {
      const result = action.payload;
      state.past.push(current(state.present));
      state.future = [];

      if (result.category === 'colors') {
        for (const token of result.tokens) {
          const [family, shade] = token.key.split('.');
          if (!family || !shade || ['__proto__', 'constructor', 'prototype'].includes(family)) continue;
          state.present.foundation.colors[family] ??= {};
          state.present.foundation.colors[family][shade] = token.value;
        }

        const { colors } = state.present.foundation;
        const intent = state.present.semantic.colors.intent;
        const button = state.present.components.button;
        if (colors.primary?.['600'] && colors.primary?.['400']) {
          intent.primary = { light: '{color.primary.600}', dark: '{color.primary.400}' };
          intent.onPrimary = { light: readableForeground(colors.primary['600']), dark: readableForeground(colors.primary['400']) };
          state.present.semantic.colors.border.focus = { light: '{color.primary.500}', dark: '{color.primary.400}' };
          button.bg.default = { light: '{color.intent.primary}', dark: '{color.intent.primary}' };
          button.bg.hover = { light: '{color.primary.700}', dark: '{color.primary.400}' };
          button.bg.active = { light: '{color.primary.800}', dark: '{color.primary.600}' };
          button.text.default = { light: '{color.intent.onPrimary}', dark: '{color.intent.onPrimary}' };
        }
        if (colors.secondary?.['600'] && colors.secondary?.['400']) {
          intent.secondary = { light: '{color.secondary.600}', dark: '{color.secondary.400}' };
          intent.onSecondary = { light: readableForeground(colors.secondary['600']), dark: readableForeground(colors.secondary['400']) };
        }
      } else {
        const scale = state.present.foundation[result.category];
        for (const token of result.tokens) {
          if (['__proto__', 'constructor', 'prototype'].includes(token.key)) continue;
          scale[token.key] = token.value;
        }
      }

      state.present.generation ??= {};
      state.present.generation[result.category] = result;
    },
    setTokens: (state, action: PayloadAction<DesignTokenSystem>) => {
      state.past.push(state.present);
      state.present = action.payload;
      state.future = [];
    },
    updateToken: (state, action: PayloadAction<{ path: string[]; value: string }>) => {
        const { path, value } = action.payload;

        // Push current state snapshot to history before mutation
        // Using current() instead of JSON.parse(JSON.stringify()) for performance
        state.past.push(current(state.present));
        state.future = [];

        let currentDraft = state.present as unknown as Record<string, unknown>;
        for (let i = 0; i < path.length - 1; i++) {
            currentDraft = currentDraft[path[i]] as Record<string, unknown>;
        }
        currentDraft[path[path.length - 1]] = value;
    },
    updateSettings: (state, action: PayloadAction<{ key: string; value: string }>) => {
        // Push current state snapshot to history before mutation
        state.past.push(current(state.present));
        state.future = [];

        if (!state.present.settings) {
            state.present.settings = { baseFontSize: "16px" };
        }
        (state.present.settings as unknown as Record<string, string>)[action.payload.key] = action.payload.value;
    },
    undo: (state) => {
      if (state.past.length === 0) return;
      const previous = state.past.pop();
      if (previous) {
        state.future.unshift(state.present);
        state.present = previous;
      }
    },
    redo: (state) => {
      if (state.future.length === 0) return;
      const next = state.future.shift();
      if (next) {
        state.past.push(state.present);
        state.present = next;
      }
    },
    reset: (state) => {
      state.past.push(state.present);
      state.present = defaultDesignTokens;
      state.future = [];
    },
    load: (state, action: PayloadAction<DesignTokenSystem>) => {
      state.past.push(state.present);
      state.present = action.payload;
      state.future = [];
    }
  },
});

export const { applyGeneration, setTokens, updateToken, updateSettings, undo, redo, reset, load } = themeSlice.actions;

export default themeSlice.reducer;
