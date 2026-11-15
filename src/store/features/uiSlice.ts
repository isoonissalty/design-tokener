import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeMainTab: 'tokens' | 'components' | 'templates' | 'palette';
  isPreviewOpen: boolean;
  isPreviewDark: boolean;
  previewTemplate: 'landing' | 'dashboard' | 'pricing';

  // Editor State
  activeEditorTab: string; // 'settings' | 'foundation' | 'semantic'
  selectedEditorCategory: string | null;

  // Component Manager State
  selectedComponentId: string | null;
}

const initialState: UiState = {
  activeMainTab: 'tokens',
  isPreviewOpen: false,
  isPreviewDark: false,
  previewTemplate: 'landing',
  activeEditorTab: 'foundation',
  selectedEditorCategory: null,
  selectedComponentId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveMainTab: (state, action: PayloadAction<UiState['activeMainTab']>) => {
      state.activeMainTab = action.payload;
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
    setSelectedComponentId: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    }
  },
});

export const {
  setActiveMainTab,
  setPreviewOpen,
  togglePreviewTheme,
  setPreviewTheme,
  setPreviewTemplate,
  setActiveEditorTab,
  setSelectedEditorCategory,
  setSelectedComponentId
} = uiSlice.actions;

export default uiSlice.reducer;
