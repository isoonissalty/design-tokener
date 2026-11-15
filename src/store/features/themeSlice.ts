import { createSlice, current, type PayloadAction } from '@reduxjs/toolkit';
import type { DesignTokenSettings, DesignTokenSystem } from '@/types/token-system';
import { defaultDesignTokens } from '@/lib/token-defaults';
import type { GenerationResult } from '@/types/generation';
import { contrastRatio, isValidHex, readableForeground } from '@/lib/palette-generator';
import { resolveFontFamily } from '@/lib/font-options';

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

function accessibleShade(palette: Record<string, string>, desired: number, foreground: string): string {
  return Object.keys(palette)
    .filter(shade => /^\d+$/.test(shade) && isValidHex(palette[shade]))
    .sort((first, second) => Math.abs(Number(first) - desired) - Math.abs(Number(second) - desired))
    .find(shade => contrastRatio(palette[shade], foreground) >= 4.5) ?? String(desired);
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    applyFontSetup: (state, action: PayloadAction<{ en: string; th: string }>) => {
      const { en, th } = action.payload;
      const family = state.present.foundation.typography.family;
      const sans = '{font.family.en}, {font.family.th}, sans-serif';
      // Imported choices can retain aliases. Check the prospective graph after
      // replacing sans, since a language alias back to sans would create a cycle.
      const proposed = { ...family, en, th, sans };
      if (resolveFontFamily(proposed, 'sans') === undefined) return;
      if (family.en === en && family.th === th && family.sans === sans) return;
      remember(state);
      family.en = en;
      family.th = th;
      family.sans = sans;
    },
    applyGeneration: (state, action: PayloadAction<GenerationResult>) => {
      const result = action.payload;
      if (!['colors', 'spacing', 'radius', 'sizing'].includes(result.category) || !result.tokens.length) return;
      const validKey = (key: string) => {
        const parts = key.split('.');
        return parts.length === (result.category === 'colors' ? 2 : 1)
          && parts.every(part => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(part) && !blockedKeys.has(part));
      };
      if (result.tokens.some(token => !validKey(token.key))) return;
      // Build the whole next system first so applying a recipe is one bounded,
      // undoable transaction, and reapplying an unchanged recipe is a no-op.
      const primaryName = result.parameters.primaryName || 'primary';
      const secondaryName = result.parameters.secondaryName || 'secondary';
      if (result.category === 'colors' && (!validKey(`${primaryName}.500`) || !validKey(`${secondaryName}.500`) || primaryName === secondaryName)) return;
      const next = JSON.parse(JSON.stringify(current(state.present))) as DesignTokenSystem;
      if (result.category === 'colors') {
        for (const token of result.tokens) {
          const [family, shade] = token.key.split('.');
          next.foundation.colors[family] ??= {};
          next.foundation.colors[family][shade] = token.value;
        }
        const { colors } = next.foundation;
        const intent = next.semantic.colors.intent;
        const button = next.components.button;
        const primary = colors[primaryName];
        const secondary = colors[secondaryName];
        if (result.parameters.makePrimary !== 'false' && primary?.['600'] && primary?.['400']) {
          intent.primary = { light: `{color.${primaryName}.600}`, dark: `{color.${primaryName}.400}` };
          intent.onPrimary = { light: readableForeground(primary['600']), dark: readableForeground(primary['400']) };
          next.semantic.colors.border.focus = { light: `{color.${primaryName}.500}`, dark: `{color.${primaryName}.400}` };
          button.bg.default = { light: '{color.intent.primary}', dark: '{color.intent.primary}' };
          button.bg.hover = { light: `{color.${primaryName}.${accessibleShade(primary, 700, intent.onPrimary.light)}}`, dark: `{color.${primaryName}.${accessibleShade(primary, 400, intent.onPrimary.dark)}}` };
          button.bg.active = { light: `{color.${primaryName}.${accessibleShade(primary, 800, intent.onPrimary.light)}}`, dark: `{color.${primaryName}.${accessibleShade(primary, 600, intent.onPrimary.dark)}}` };
          button.text.default = { light: '{color.intent.onPrimary}', dark: '{color.intent.onPrimary}' };
        }
        if (result.parameters.makePrimary !== 'false' && secondary?.['600'] && secondary?.['400']) {
          intent.secondary = { light: `{color.${secondaryName}.600}`, dark: `{color.${secondaryName}.400}` };
          intent.onSecondary = { light: readableForeground(secondary['600']), dark: readableForeground(secondary['400']) };
        }
      } else {
        const scale = next.foundation[result.category];
        for (const token of result.tokens) scale[token.key] = token.value;
      }
      next.generation ??= {};
      next.generation[result.category] = result;
      replaceTokens(state, next);
    },
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

export const { applyFontSetup, applyGeneration, setTokens, updateToken, updateSettings, undo, redo, reset, load } = themeSlice.actions;
export default themeSlice.reducer;
