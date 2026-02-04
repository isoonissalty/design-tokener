"use client";

import { Header } from "@/components/layout/Header";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { LivePreview } from "@/components/preview/LivePreview";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setPreviewOpen, togglePreviewTheme } from "@/store/features/uiSlice";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LandingPage } from "@/components/landing-page/LandingPage";

export default function Home() {
    const isPreviewOpen = useAppSelector(state => state.ui.isPreviewOpen);
    const isPreviewDark = useAppSelector(state => state.ui.isPreviewDark);
    const tokens = useAppSelector(state => state.theme.present);
    const dispatch = useAppDispatch();

    return (
        <main className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                 <Group orientation="horizontal">
                    <Panel defaultSize={25} minSize={20} className="min-w-[480px]">
                        <EditorSidebar />
                    </Panel>

                    <Separator className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" />

                    <Panel defaultSize={50}>
                        <LivePreview />
                    </Panel>
                </Group>
            </div>

             {/* Full Screen Overlay Preview */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
                    <div className="bg-white w-full h-full rounded-lg shadow-2xl overflow-hidden relative flex flex-col">
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                            <span className="font-semibold">Landing Page Preview</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(setPreviewOpen(false))}
                                className="hover:bg-white/10 text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-50">
                            <ThemeWrapper tokens={tokens} className="min-h-full preview-root">
                               <LandingPage isDark={isPreviewDark} toggleTheme={() => dispatch(togglePreviewTheme())} />
                            </ThemeWrapper>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
