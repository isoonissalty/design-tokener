import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { DesignTokenSystem } from '@/types/token-system';
import { defaultDesignTokens } from '@/lib/token-defaults';

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

        let currentDraft: any = state.present;
        for (let i = 0; i < path.length - 1; i++) {
            currentDraft = currentDraft[path[i]];
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
        (state.present.settings as any)[action.payload.key] = action.payload.value;
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

export const { setTokens, updateToken, updateSettings, undo, redo, reset, load } = themeSlice.actions;

export default themeSlice.reducer;
