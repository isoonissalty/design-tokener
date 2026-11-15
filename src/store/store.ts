import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './features/themeSlice';
import uiReducer from './features/uiSlice';

export const makeStore = () => configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
  },
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
