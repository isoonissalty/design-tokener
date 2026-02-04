import { useState, useCallback } from 'react';
import { ThemeConfig, ButtonConfig, defaultThemeConfig, defaultButtonConfig } from '@/types/theme';

interface HistoryState {
  themeConfig: ThemeConfig;
  buttonConfig: ButtonConfig;
}

export function useThemeManager() {
  const [history, setHistory] = useState<HistoryState[]>([
    { themeConfig: defaultThemeConfig, buttonConfig: defaultButtonConfig }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const updateState = useCallback((newState: Partial<HistoryState>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      const current = newHistory[newHistory.length - 1];
      const nextState = { ...current, ...newState };

      // Simple equality check to avoid duplicate entries could be added here
      // But for deep objects it's expensive.
      // We will just push.

      return [...newHistory, nextState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const setThemeConfig = useCallback((config: ThemeConfig) => {
    // We can optimize by checking if it's different
    updateState({ themeConfig: config });
  }, [updateState]);

  const setButtonConfig = useCallback((config: ButtonConfig) => {
    updateState({ buttonConfig: config });
  }, [updateState]);

  const undo = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback(() => {
    updateState({ themeConfig: defaultThemeConfig, buttonConfig: defaultButtonConfig });
  }, [updateState]);

  const save = useCallback(() => {
    try {
      localStorage.setItem('design-token-builder-state', JSON.stringify(currentState));
      alert('Configuration saved to local storage!');
    } catch (e) {
      console.error("Failed to save", e);
      alert('Failed to save configuration.');
    }
  }, [currentState]);

  const load = useCallback(() => {
    try {
      const saved = localStorage.getItem('design-token-builder-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate or just cast
        if (parsed.themeConfig && parsed.buttonConfig) {
             updateState({ themeConfig: parsed.themeConfig, buttonConfig: parsed.buttonConfig });
             alert('Configuration loaded!');
        }
      } else {
        alert('No saved configuration found.');
      }
    } catch (e) {
       console.error("Failed to load", e);
       alert('Failed to load configuration.');
    }
  }, [updateState]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    themeConfig: currentState.themeConfig,
    buttonConfig: currentState.buttonConfig,
    setThemeConfig,
    setButtonConfig,
    undo,
    redo,
    reset,
    save,
    load,
    canUndo,
    canRedo
  };
}
