"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Header } from "@/components/layout/Header";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { LivePreview } from "@/components/preview/LivePreview";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setPreviewOpen, togglePreviewTheme } from "@/store/features/uiSlice";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { PreviewContent } from "@/components/preview/PreviewContent";
import { previewTemplates } from "@/lib/preview-templates";

function subscribeToViewport(callback: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getWideViewport = () => window.matchMedia("(min-width: 1024px)").matches;

function FullScreenPreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(state => state.theme.present);
  const isDark = useAppSelector(state => state.ui.isPreviewDark);
  const template = useAppSelector(state => state.ui.previewTemplate);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="fullscreen-preview-title" onCancel={() => dispatch(setPreviewOpen(false))} className="fixed inset-0 m-auto h-[calc(100dvh-2rem)] max-h-none w-[calc(100%-2rem)] max-w-none overflow-hidden rounded-xl border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-background px-4 py-3">
          <h2 id="fullscreen-preview-title" className="text-sm font-semibold">{previewTemplates[template].label} preview</h2>
          <Button variant="ghost" size="icon" onClick={() => dispatch(setPreviewOpen(false))} aria-label="Close preview"><X /></Button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <ThemeWrapper tokens={tokens} className="min-h-full">
            <PreviewContent template={template} isDark={isDark} toggleTheme={() => dispatch(togglePreviewTheme())} />
          </ThemeWrapper>
        </div>
      </div>
    </dialog>
  );
}

export default function Home() {
  const isPreviewOpen = useAppSelector(state => state.ui.isPreviewOpen);
  const isWide = useSyncExternalStore(subscribeToViewport, getWideViewport, () => true);

  return (
    <main className="h-dvh flex flex-col bg-background text-foreground font-sans overflow-hidden">
      <Header />
      <div className="flex-1 min-h-0 overflow-hidden">
        <Group key={isWide ? "wide" : "narrow"} orientation={isWide ? "horizontal" : "vertical"} className="h-full">
          <Panel defaultSize={isWide ? "38%" : "55%"} minSize={isWide ? "360px" : "25%"} maxSize={isWide ? "65%" : "75%"}>
            <EditorSidebar />
          </Panel>
          <Separator className={isWide ? "w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" : "h-1 bg-border hover:bg-primary transition-colors cursor-row-resize"} />
          <Panel minSize="25%">
            <LivePreview />
          </Panel>
        </Group>
      </div>
      {isPreviewOpen && <FullScreenPreview />}
    </main>
  );
}
