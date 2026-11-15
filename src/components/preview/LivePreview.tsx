"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setPreviewTemplate, togglePreviewTheme } from "@/store/features/uiSlice";
import { PreviewContent } from "./PreviewContent";
import { isPreviewTemplateId, previewTemplateIds, previewTemplates } from "@/lib/preview-templates";

export function PreviewToolbar() {
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(state => state.ui.isPreviewDark);
  const template = useAppSelector(state => state.ui.previewTemplate);

  return (
    <div className="preview-toolbar flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-3 shrink-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="preview-toolbar-label shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live preview</span>
        <label className="sr-only" htmlFor="preview-template">Preview template</label>
        <select id="preview-template" value={template} onChange={event => {
          if (isPreviewTemplateId(event.target.value)) dispatch(setPreviewTemplate(event.target.value));
        }} className="h-8 min-w-0 max-w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {previewTemplateIds.map(id => <option key={id} value={id}>{previewTemplates[id].label}</option>)}
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
