"use client";

import React, { createContext, useContext, useEffect, useId, useMemo, useState } from "react";
import type { DesignTokenSystem } from "@/types/token-system";
import { generateTokenCss, processTokenValue, themeColorMappings } from "@/lib/css-generator";
import { getFontStylesheetUrl } from "@/lib/font-options";

export type ThemeFontStatus = "system" | "loading" | "ready" | "fallback";
const ThemeFontContext = createContext<ThemeFontStatus>("system");
export const useThemeFontStatus = () => useContext(ThemeFontContext);

interface ThemeWrapperProps {
  tokens: DesignTokenSystem;
  children: React.ReactNode;
  className?: string;
}

const typographyRules = (selector: string, token: string) => `${selector} {
  font-family: var(--text-${token}-font-family);
  font-size: var(--text-${token}-font-size);
  font-weight: var(--text-${token}-font-weight);
  line-height: var(--text-${token}-line-height);
  letter-spacing: var(--text-${token}-letter-spacing);
}`;

export function ThemeWrapper({ tokens, children, className = "" }: ThemeWrapperProps) {
  const scope = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const stylesheetUrl = getFontStylesheetUrl(tokens);
  const [fontLoads, setFontLoads] = useState<Record<string, ThemeFontStatus>>({});
  const fontStatus = !stylesheetUrl ? "system" : fontLoads[stylesheetUrl] ?? "loading";

  useEffect(() => {
    if (!stylesheetUrl || fontStatus !== "loading") return;
    const timeout = window.setTimeout(() => setFontLoads(previous => ({ ...previous, [stylesheetUrl]: "fallback" })), 15000);
    return () => window.clearTimeout(timeout);
  }, [stylesheetUrl, fontStatus]);

  const loadFontFaces = async (url: string) => {
    try {
      // A stylesheet response alone does not mean the font files have loaded.
      // Ask the browser for both scripts before reporting the specimen ready.
      const families = new URL(url).searchParams.getAll("family").map(family => family.split(":")[0]);
      const loaded = await Promise.all(families.flatMap(family => [400, 500, 700].map(weight => document.fonts.load(`${weight} 16px ${JSON.stringify(family)}`, "Hello ภาษาไทย 0123456789"))));
      setFontLoads(previous => ({ ...previous, [url]: loaded.every(faces => faces.length > 0) ? "ready" : "fallback" }));
    } catch {
      setFontLoads(previous => ({ ...previous, [url]: "fallback" }));
    }
  };

  const css = useMemo(() => {
    const { root, dark } = generateTokenCss(tokens, { preview: true });
    const selector = `.preview-root[data-theme-scope="${scope}"]`;
    const baseFontSize = processTokenValue(tokens.settings?.baseFontSize || "16px");
    return `
      ${selector} {
        ${root.join("\n")}
        ${themeColorMappings}
        font-size: ${baseFontSize};
        font-family: var(--text-body-base-font-family);
        line-height: var(--text-body-base-line-height);
        color: var(--foreground);
      }
      ${selector}.dark, ${selector} .dark {
        ${root.join("\n")}
        ${dark.join("\n")}
        ${themeColorMappings}
        color: var(--foreground);
      }
      ${typographyRules(`${selector} h1`, "heading-h1")}
      ${typographyRules(`${selector} h2`, "heading-h2")}
      ${typographyRules(`${selector} h3`, "heading-h3")}
      ${typographyRules(`${selector} p`, "body-base")}
      ${typographyRules(`${selector} label`, "label")}
      ${selector} [data-variant] {
        border-radius: var(--button-radius);
        transition-duration: var(--motion-duration-fast);
        transition-timing-function: var(--motion-easing-standard);
      }
      ${selector} [data-variant]:not([data-size="icon"]) {
        height: auto;
        min-height: 2.25rem;
        padding: var(--button-padding-y) var(--button-padding-x);
      }
      ${selector} [data-variant="default"] {
        background: var(--button-bg-default);
        color: var(--button-text-default);
      }
      ${selector} [data-variant="default"]:hover {
        background: var(--button-bg-hover);
      }
      ${selector} [data-variant="default"]:active {
        background: var(--button-bg-active);
      }
      ${selector} [data-variant="default"]:disabled {
        background: var(--button-bg-disabled);
        opacity: var(--opacity-disabled);
      }
    `;
  }, [tokens, scope]);

  return (
    <>
      {stylesheetUrl && <link key={stylesheetUrl} rel="stylesheet" href={stylesheetUrl} onLoad={() => { void loadFontFaces(stylesheetUrl); }} onError={() => setFontLoads(previous => ({ ...previous, [stylesheetUrl]: "fallback" }))} />}
      <style>{css}</style>
      <div data-theme-scope={scope} className={`${className} preview-root preview-area`}>
        <ThemeFontContext.Provider value={fontStatus}>{children}</ThemeFontContext.Provider>
      </div>
    </>
  );
}
