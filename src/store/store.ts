import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './features/themeSlice';
import uiReducer from './features/uiSlice';
import templatesReducer from './features/templatesSlice';

export const makeStore = () => configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    templates: templatesReducer,
  },
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
