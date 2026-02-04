import { useState, useCallback } from 'react';
import { DesignTokenSystem } from '@/types/token-system';
import { defaultDesignTokens } from '@/lib/token-defaults';

interface HistoryState {
  tokens: DesignTokenSystem;
}

export function useThemeManager() {
  const [history, setHistory] = useState<HistoryState[]>([
    { tokens: defaultDesignTokens }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const updateState = useCallback((newState: Partial<HistoryState>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      const current = newHistory[newHistory.length - 1];
      const nextState = { ...current, ...newState };
      return [...newHistory, nextState];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const setTokens = useCallback((tokens: DesignTokenSystem) => {
    updateState({ tokens });
  }, [updateState]);

  const undo = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback(() => {
    updateState({ tokens: defaultDesignTokens });
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
        if (parsed.tokens) {
             updateState({ tokens: parsed.tokens });
             alert('Configuration loaded!');
        } else if (parsed.themeConfig) {
             // Legacy fallback - simplistic
             alert('Legacy configuration found but migration is not implemented. Resetting to defaults.');
             // In a real app we'd map legacy to new here
             updateState({ tokens: defaultDesignTokens });
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
    tokens: currentState.tokens,
    setTokens,
    undo,
    redo,
    reset,
    save,
    load,
    canUndo,
    canRedo
  };
}
