"use client";

import { Button } from "@/components/ui/button";
import { Undo2, Redo2, RotateCcw, Save, FolderOpen, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { undo, redo, reset, load } from "@/store/features/themeSlice";
import { setPreviewOpen } from "@/store/features/uiSlice";
import { ExportButton } from "@/components/ExportButton";

export function Header() {
  const dispatch = useAppDispatch();
  const { present: tokens, past, future } = useAppSelector((state) => state.theme);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const handleSave = () => {
    try {
      localStorage.setItem('design-token-builder-state', JSON.stringify({ tokens }));
      alert('Configuration saved to local storage!');
    } catch (e) {
      console.error("Failed to save", e);
      alert('Failed to save configuration.');
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem('design-token-builder-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tokens) {
             dispatch(load(parsed.tokens));
             alert('Configuration loaded!');
        } else {
             alert('Invalid configuration found.');
        }
      } else {
        alert('No saved configuration found.');
      }
    } catch (e) {
       console.error("Failed to load", e);
       alert('Failed to load configuration.');
    }
  };

  return (
    <header className="flex justify-between items-center p-4 border-b shrink-0 bg-background z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Design Token Builder</h1>
        <div className="flex items-center gap-1 border-l pl-4 ml-2 h-6">
          <Button variant="ghost" size="icon" onClick={() => dispatch(undo())} disabled={!canUndo} title="Undo">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => dispatch(redo())} disabled={!canRedo} title="Redo">
            <Redo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => dispatch(reset())} title="Reset to Default">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSave} title="Save to Local Storage">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLoad} title="Load from Local Storage">
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => dispatch(setPreviewOpen(true))}>
          <Eye className="w-4 h-4 mr-2" />
          Full Screen Preview
        </Button>
        {/* Pass tokens to ExportButton, or we could refactor ExportButton to select them itself.
            Passing as prop is fine for now as we have them here. */}
        <ExportButton tokens={tokens} />
      </div>
    </header>
  );
}
