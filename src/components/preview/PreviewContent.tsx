"use client";

import type { ComponentType } from "react";
import { Layers3, Moon, Sun } from "lucide-react";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { Button } from "@/components/ui/button";
import { previewTemplates, type PreviewTemplateId } from "@/lib/preview-templates";
import { DashboardPreview } from "./DashboardPreview";
import { PricingPreview } from "./PricingPreview";
import { SettingsPreview } from "./SettingsPreview";
import { ComponentGalleryPreview } from "./ComponentGalleryPreview";
import { StorefrontPreview } from "./StorefrontPreview";
import { ArticlePreview } from "./ArticlePreview";

interface PreviewThemeProps {
  isDark: boolean;
  toggleTheme: () => void;
}

interface PreviewContentProps extends PreviewThemeProps {
  template: PreviewTemplateId;
}

// Every catalog entry must have a view; there is no fallback to another layout.
const previewViews: Record<PreviewTemplateId, ComponentType<PreviewThemeProps>> = {
  landing: LandingPage,
  dashboard: DashboardPreview,
  pricing: PricingPreview,
  settings: SettingsPreview,
  components: ComponentGalleryPreview,
  storefront: StorefrontPreview,
  article: ArticlePreview,
};

function PreviewHeader({ isDark, toggleTheme, title }: PreviewThemeProps & { title: string }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-4 py-4">
      <div className="flex min-w-0 items-center gap-2 font-semibold">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Layers3 className="h-4 w-4" /></span>
        <span className="break-words">{title}</span>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0" onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}

export function PreviewContent({ template, isDark, toggleTheme }: PreviewContentProps) {
  const View = previewViews[template];

  return (
    <div className={`preview-container min-h-full w-full bg-background font-sans text-foreground ${isDark ? "dark" : ""}`}>
      {template !== "landing" && <PreviewHeader title={previewTemplates[template].brand} isDark={isDark} toggleTheme={toggleTheme} />}
      <View key={template} isDark={isDark} toggleTheme={toggleTheme} />
    </div>
  );
}
