"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setPreviewTemplate, togglePreviewTheme } from "@/store/features/uiSlice";
import { PreviewContent, PreviewTemplateId } from "./PreviewContent";

export function PreviewToolbar() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(state => state.ui.isPreviewDark);
  const template = useAppSelector(state => state.ui.previewTemplate);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-3 shrink-0">
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</span>
        <label className="sr-only" htmlFor="preview-template">Preview template</label>
        <select id="preview-template" value={template} onChange={event => dispatch(setPreviewTemplate(event.target.value as PreviewTemplateId))} className="h-8 max-w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="landing">Landing page</option>
          <option value="dashboard">Dashboard</option>
          <option value="pricing">Pricing page</option>
        </select>
      </div>
      <Button variant="outline" size="sm" onClick={() => dispatch(togglePreviewTheme())} aria-label={isDark ? "Switch preview to light mode" : "Switch preview to dark mode"}>
        {isDark ? <Sun /> : <Moon />}{isDark ? "Light" : "Dark"}
      </Button>
    </div>
  );
}

export function LivePreview() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(state => state.theme.present);
  const isDark = useAppSelector(state => state.ui.isPreviewDark);
  const template = useAppSelector(state => state.ui.previewTemplate);

  return (
    <section aria-label="Live theme preview" className="h-full min-h-0 bg-muted/30 relative overflow-hidden flex flex-col w-full">
      <PreviewToolbar />
      <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-6">
        <ThemeWrapper tokens={tokens} className="w-full max-w-6xl mx-auto shadow-lg rounded-xl overflow-hidden border bg-background">
          <PreviewContent template={template} isDark={isDark} toggleTheme={() => dispatch(togglePreviewTheme())} />
        </ThemeWrapper>
      </div>
    </section>
  );
}
