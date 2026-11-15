import { createSlice, type Dispatch, type PayloadAction } from "@reduxjs/toolkit";
import { createSavedTemplate, parseSavedTemplates, SAVED_TEMPLATES_STORAGE_KEY } from "@/lib/saved-templates";
import type { ThemeTemplate } from "@/lib/theme-templates";
import type { DesignTokenSystem } from "@/types/token-system";

export interface TemplatesState {
  items: ThemeTemplate[];
  ready: boolean;
  error: string;
}

export type SaveTemplateResult = { ok: true; template: ThemeTemplate } | { ok: false; error: string };

const initialState: TemplatesState = { items: [], ready: false, error: "" };
const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    templatesLoaded: (state, action: PayloadAction<ThemeTemplate[]>) => {
      state.items = action.payload;
      state.ready = true;
      state.error = "";
    },
    templatesFailed: (state, action: PayloadAction<string>) => {
      state.ready = true;
      state.error = action.payload;
    },
  },
});

const { templatesLoaded, templatesFailed } = templatesSlice.actions;

export const hydrateSavedTemplates = () => (dispatch: Dispatch) => {
  try {
    const stored = globalThis.localStorage.getItem(SAVED_TEMPLATES_STORAGE_KEY);
    let templates: ThemeTemplate[];
    try {
      templates = parseSavedTemplates(stored);
    } catch {
      dispatch(templatesFailed("Saved templates are damaged or incompatible. Existing data was kept. Export JSON to keep a copy of your current theme."));
      return;
    }
    dispatch(templatesLoaded(templates));
  } catch {
    dispatch(templatesFailed("Unable to read saved templates in this browser. Export JSON to keep a copy of your current theme."));
  }
};

export const saveThemeTemplate = ({ name, tokens, paletteName }: { name: string; tokens: DesignTokenSystem; paletteName?: string }) =>
  (dispatch: Dispatch): SaveTemplateResult => {
    let template: ThemeTemplate;
    try {
      template = createSavedTemplate(name, tokens, paletteName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The theme could not be saved as a template.";
      dispatch(templatesFailed(message));
      return { ok: false, error: message };
    }

    try {
      // Read again before saving to preserve templates added by another tab.
      const stored = globalThis.localStorage.getItem(SAVED_TEMPLATES_STORAGE_KEY);
      let previous: ThemeTemplate[];
      try {
        previous = parseSavedTemplates(stored);
      } catch {
        const error = "Saved templates are damaged or incompatible. Existing data was kept. Export JSON to keep a copy of your current theme.";
        dispatch(templatesFailed(error));
        return { ok: false, error };
      }
      const templates = [...previous, template];
      globalThis.localStorage.setItem(SAVED_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
      dispatch(templatesLoaded(templates));
      return { ok: true, template };
    } catch {
      const error = "Unable to save a template in this browser. Storage may be unavailable or full. Export JSON to keep a copy.";
      dispatch(templatesFailed(error));
      return { ok: false, error };
    }
  };

export default templatesSlice.reducer;
