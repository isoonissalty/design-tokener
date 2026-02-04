"use client";

import { ThemeWrapper } from "@/components/ThemeWrapper";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { togglePreviewTheme } from "@/store/features/uiSlice";

export function LivePreview() {
    const dispatch = useAppDispatch();
    const tokens = useAppSelector(state => state.theme.present);
    const isDark = useAppSelector(state => state.ui.isPreviewDark);

    return (
        <section className="h-full bg-muted/20 relative overflow-hidden flex flex-col w-full">
            <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
                    <ThemeWrapper tokens={tokens} className="w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden border bg-background ring-1 ring-slate-900/5 origin-top scale-90 preview-root">
                    <LandingPage isDark={isDark} toggleTheme={() => dispatch(togglePreviewTheme())} />
                    </ThemeWrapper>
            </div>
        </section>
    );
}
