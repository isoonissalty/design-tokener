import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import type { GenerationCategory, GenerationResult } from '@/types/generation';
import { applyGeneration, load, redo, reset, setTokens, undo } from './themeSlice';

interface UiState {
  activeMainTab: 'tokens' | 'components' | 'templates' | 'generate';
  generatorCategory: GenerationCategory;
  isPreviewOpen: boolean;
  isPreviewDark: boolean;
  previewTemplate: 'landing' | 'dashboard' | 'pricing';

  // Editor State
  activeEditorTab: string; // 'settings' | 'foundation' | 'semantic'
  selectedEditorCategory: string | null;
  focusedPalette: string | null;

  // Component Manager State
  selectedComponentId: string | null;
}

const initialState: UiState = {
  activeMainTab: 'tokens',
  generatorCategory: 'colors',
  isPreviewOpen: false,
  isPreviewDark: false,
  previewTemplate: 'landing',
  activeEditorTab: 'foundation',
  selectedEditorCategory: null,
  focusedPalette: null,
  selectedComponentId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMainTab: (state, action: PayloadAction<UiState['activeMainTab'] | 'palette'>) => {
      state.activeMainTab = action.payload === 'palette' ? 'generate' : action.payload;
    },
    setGeneratorCategory: (state, action: PayloadAction<GenerationCategory>) => {
      state.generatorCategory = action.payload;
    },
    setPreviewOpen: (state, action: PayloadAction<boolean>) => {
      state.isPreviewOpen = action.payload;
    },
    togglePreviewTheme: (state) => {
      state.isPreviewDark = !state.isPreviewDark;
    },
    setPreviewTheme: (state, action: PayloadAction<boolean>) => {
      state.isPreviewDark = action.payload;
    },
    setPreviewTemplate: (state, action: PayloadAction<UiState['previewTemplate']>) => {
      state.previewTemplate = action.payload;
    },
    setActiveEditorTab: (state, action: PayloadAction<string>) => {
      state.activeEditorTab = action.payload;
      // Reset category when switching major tabs if desired,
      // but keeping it null is safer to avoid confusion
      state.selectedEditorCategory = null;
    },
    setSelectedEditorCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedEditorCategory = action.payload;
    },
    revealGeneratedTokens: (state, action: PayloadAction<GenerationResult>) => {
      state.activeEditorTab = 'foundation';
      state.selectedEditorCategory = action.payload.category;
      state.focusedPalette = action.payload.category === 'colors' ? action.payload.parameters.primaryName || 'primary' : null;
    },
    setFocusedPalette: (state, action: PayloadAction<string | null>) => {
      state.focusedPalette = action.payload;
    },
    setSelectedComponentId: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAnyOf(applyGeneration, setTokens, load, reset, undo, redo), (state) => {
      state.focusedPalette = null;
    });
  },
});

export const {
  setActiveMainTab,
  setGeneratorCategory,
  setPreviewOpen,
  togglePreviewTheme,
  setPreviewTheme,
  setPreviewTemplate,
  setActiveEditorTab,
  setSelectedEditorCategory,
  revealGeneratedTokens,
  setFocusedPalette,
  setSelectedComponentId
} = uiSlice.actions;

export default uiSlice.reducer;
