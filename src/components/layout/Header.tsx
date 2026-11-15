"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, RotateCcw, Save, FolderOpen, Eye, Blocks } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { undo, redo, reset, load } from "@/store/features/themeSlice";
import { setPreviewOpen } from "@/store/features/uiSlice";
import { ExportButton } from "@/components/ExportButton";
import { validateTheme } from "@/lib/theme-io";

export function Header() {
  const dispatch = useAppDispatch();
  const { present: tokens, past, future } = useAppSelector((state) => state.theme);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.closest('input, textarea, select, [contenteditable="true"], [role="combobox"]'))) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        dispatch(event.shiftKey ? redo() : undo());
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        dispatch(redo());
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [dispatch]);

  const handleSave = () => {
    try {
      localStorage.setItem("design-token-builder-state", JSON.stringify({ tokens }));
      setNotice("Theme saved in this browser.");
    } catch {
      setNotice("Unable to save in this browser. Export JSON to keep a copy.");
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem("design-token-builder-state");
      if (!saved) { setNotice("No saved theme in this browser yet."); return; }
      dispatch(load(validateTheme(JSON.parse(saved))));
      setNotice("Saved theme restored. Undo is available.");
    } catch {
      setNotice("The saved theme could not be restored. Your current theme was kept.");
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b bg-background px-4 py-3 shrink-0 z-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Blocks className="h-4 w-4" /></div>
          <h1 className="text-sm sm:text-base font-semibold tracking-tight"><span className="hidden sm:inline">Design </span>Token Builder</h1>
        </div>
        <div className="flex items-center gap-0.5 sm:border-l sm:pl-3" role="group" aria-label="Theme history and storage">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch(undo())} disabled={!past.length} title="Undo (Ctrl/⌘ Z)" aria-label="Undo"><Undo2 /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => dispatch(redo())} disabled={!future.length} title="Redo (Ctrl/⌘ Shift Z)" aria-label="Redo"><Redo2 /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { dispatch(reset()); setNotice("Default theme restored. Undo is available."); }} title="Reset to default" aria-label="Reset to Default"><RotateCcw /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave} title="Save theme in this browser" aria-label="Save to Local Storage"><Save /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLoad} title="Restore saved theme" aria-label="Load from Local Storage"><FolderOpen /></Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => dispatch(setPreviewOpen(true))} aria-label="Full screen preview"><Eye /><span className="hidden xl:inline">Full Screen Preview</span><span className="xl:hidden">Preview</span></Button>
        <ExportButton tokens={tokens} />
      </div>
      {notice && <p role="status" className="w-full text-xs text-muted-foreground">{notice}</p>}
    </header>
  );
}
