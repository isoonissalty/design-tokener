"use client";

import { useId } from "react";
import { ArrowUpRight, Check, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fontOptions, fontPairings, getFontOption, type FontLanguage } from "@/lib/font-options";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyFontSetup } from "@/store/features/themeSlice";
import { setActiveEditorTab, setActiveMainTab, setPreviewTemplate, setSelectedEditorCategory } from "@/store/features/uiSlice";
import { cn } from "@/lib/utils";

export function FontSetupShortcut() {
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      onClick={() => { dispatch(setActiveMainTab("fonts")); dispatch(setPreviewTemplate("fonts")); }}
      className="flex w-full items-center gap-3 rounded-lg border bg-muted/30 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Type className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Set up English &amp; Thai fonts</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">Choose a pairing and preview both languages.</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );
}

export function FontSetup() {
  const id = useId();
  const dispatch = useAppDispatch();
  const family = useAppSelector(state => state.theme.present.foundation.typography.family);
  const connected = family.sans === "{font.family.en}, {font.family.th}, sans-serif";
  const configured = Boolean(family.en && family.th && connected);

  function apply(en: string, th: string) {
    dispatch(applyFontSetup({ en, th }));
    dispatch(setPreviewTemplate("fonts"));
  }

  function changeFont(language: FontLanguage, optionId: string) {
    const selected = fontOptions[language].find(option => option.id === optionId);
    if (!selected) return;
    apply(
      language === "en" ? selected.family : family.en || fontOptions.en[0].family,
      language === "th" ? selected.family : family.th || fontOptions.th[0].family,
    );
  }

  const names = {
    en: family.en ? getFontOption("en", family.en)?.label || family.en : "Not set",
    th: family.th ? getFontOption("th", family.th)?.label || family.th : "Not set",
  };

  return (
    <section aria-label="Font setup" className="h-full min-h-0 space-y-4 overflow-y-auto pb-3 pr-1">
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Type className="h-4 w-4" aria-hidden="true" />Fonts for English &amp; Thai</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">Start with a pairing or choose each font. Changes apply immediately to your theme and preview.</p>
      </div>
      <div className="space-y-5">
        <div className="space-y-3" aria-label="Recommended font pairings">
          <h3 className="text-xs font-semibold">One-click pairings</h3>
          {fontPairings.map(pairing => {
            const en = fontOptions.en.find(option => option.id === pairing.en)!;
            const th = fontOptions.th.find(option => option.id === pairing.th)!;
            const selected = configured && family.en === en.family && family.th === th.family;
            return (
              <button
                key={pairing.id}
                type="button"
                aria-label={`Apply ${pairing.label} font pairing`}
                aria-pressed={selected}
                onClick={() => apply(en.family, th.family)}
                className={cn("w-full rounded-lg border bg-background p-3 text-left transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", selected && "border-slate-900 ring-1 ring-slate-900")}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {pairing.label}
                  {selected && <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium"><Check className="h-3 w-3" aria-hidden="true" />Applied</span>}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{pairing.description}</span>
              </button>
            );
          })}
        </div>

        <fieldset className="space-y-4 rounded-lg border p-4">
          <legend className="px-1 text-xs font-semibold">Choose each language</legend>
          {(["en", "th"] as const).map(language => {
            const current = family[language];
            const selected = current ? getFontOption(language, current) : undefined;
            const label = language === "en" ? "English font" : "Thai font";
            return (
              <div key={language} className="space-y-2">
                <Label htmlFor={`${id}-${language}`} className="text-xs">{label} <span className="text-muted-foreground">{language === "en" ? "EN" : "TH · ภาษาไทย"}</span></Label>
                <select
                  id={`${id}-${language}`}
                  value={selected?.id || (current ? "custom" : "")}
                  onChange={event => changeFont(language, event.target.value)}
                  aria-describedby={`${id}-${language}-hint`}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>Choose {language === "en" ? "an English" : "a Thai"} font…</option>
                  {current && !selected && <option value="custom">Custom: {current}</option>}
                  {fontOptions[language].map(option => <option key={option.id} value={option.id}>{option.label}{option.source === "system" ? " · system font" : ""}</option>)}
                </select>
                <p id={`${id}-${language}-hint`} className="text-xs leading-relaxed text-muted-foreground">{language === "en" ? "Used for Latin letters, numbers, and punctuation." : "Used for Thai characters, including mixed-language text."}</p>
              </div>
            );
          })}
          <p className="text-xs leading-relaxed text-muted-foreground">Choosing your first font sets the other language to its recommended font. You can change either at any time.</p>
        </fieldset>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed" role="status" aria-live="polite">
          {configured ? <><span className="font-semibold">Applied:</span> {names.en} (EN) + {names.th} (TH). Undo is available.</>
            : family.en && family.th ? <>Your language fonts are saved, but the sans-serif stack was edited. <button type="button" className="font-medium underline underline-offset-2" onClick={() => apply(family.en!, family.th!)}>Use these fonts for the theme</button>.</>
            : <>Your theme uses its current font stack. Choose a pairing to set up both languages in one step.</>}
        </div>

        <div className="space-y-3">
          <Button variant="outline" size="sm" className="w-full" onClick={() => dispatch(setPreviewTemplate("fonts"))}>Preview English, Thai &amp; mixed text<ArrowUpRight className="h-3.5 w-3.5" /></Button>
          <p className="text-xs leading-relaxed text-muted-foreground">Pairings style sans-serif text. Custom heading fonts follow their typography tokens. Google Fonts load automatically in previews and CSS exports, with browser fallbacks while loading.</p>
          <p className="text-xs leading-relaxed text-muted-foreground">Save your theme or a template to reuse these choices.</p>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => { dispatch(setActiveMainTab("tokens")); dispatch(setActiveEditorTab("foundation")); dispatch(setSelectedEditorCategory("typography")); }}>Advanced typography tokens<ArrowUpRight className="h-3 w-3" /></Button>
        </div>
      </div>
    </section>
  );
}
