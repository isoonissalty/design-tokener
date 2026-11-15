import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GenerationCategory } from '@/types/generation';

interface UiState {
  activeMainTab: 'tokens' | 'components' | 'generate';
  generatorCategory: GenerationCategory;
  isPreviewOpen: boolean;
  isPreviewDark: boolean;

  // Editor State
  activeEditorTab: string; // 'settings' | 'foundation' | 'semantic'
  selectedEditorCategory: string | null;

  // Component Manager State
  selectedComponentId: string | null;
}

const initialState: UiState = {
  activeMainTab: 'tokens',
  generatorCategory: 'colors',
  isPreviewOpen: false,
  isPreviewDark: false,
  activeEditorTab: 'foundation',
  selectedEditorCategory: null,
  selectedComponentId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMainTab: (state, action: PayloadAction<'tokens' | 'components' | 'generate'>) => {
      state.activeMainTab = action.payload;
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
    setActiveEditorTab: (state, action: PayloadAction<string>) => {
      state.activeEditorTab = action.payload;
      // Reset category when switching major tabs if desired,
      // but keeping it null is safer to avoid confusion
      state.selectedEditorCategory = null;
    },
    setSelectedEditorCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedEditorCategory = action.payload;
    },
    setSelectedComponentId: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    }
  },
});

export const {
  setActiveMainTab,
  setGeneratorCategory,
  setPreviewOpen,
  togglePreviewTheme,
  setPreviewTheme,
  setActiveEditorTab,
  setSelectedEditorCategory,
  setSelectedComponentId
} = uiSlice.actions;

export default uiSlice.reducer;
