"use client";

import React from "react";
import { ThemeConfig, ButtonConfig } from "@/types/theme";
import { hexToHsl } from "@/lib/colors";

interface ThemeWrapperProps {
  themeConfig: ThemeConfig;
  buttonConfig: ButtonConfig;
  children: React.ReactNode;
  className?: string;
}

export function ThemeWrapper({ themeConfig, buttonConfig, children, className }: ThemeWrapperProps) {
  const lightVars = Object.entries(themeConfig.light).map(([key, value]) => {
     const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
     return `${cssVar}: ${hexToHsl(value)};`;
  }).join("\n");

  const darkVars = Object.entries(themeConfig.dark).map(([key, value]) => {
     const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
     return `${cssVar}: ${hexToHsl(value)};`;
  }).join("\n");

  const radiusVar = `--radius: ${themeConfig.radius}rem;`;

  const btnVars = `
    --btn-px: ${buttonConfig.paddingX}px;
    --btn-py: ${buttonConfig.paddingY}px;
    --btn-radius: ${buttonConfig.borderRadius}rem;
    --btn-font-size: ${buttonConfig.fontSize}px;
    --btn-font-weight: ${buttonConfig.fontWeight};
    --btn-text-transform: ${buttonConfig.textTransform};
    --btn-shadow: ${buttonConfig.boxShadow === 'none' ? 'none' :
                    buttonConfig.boxShadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
                    buttonConfig.boxShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
                    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'};
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          ${lightVars}
          ${radiusVar}
          ${btnVars}
        }
        .preview-root .dark {
          ${darkVars}
        }

        .preview-area button {
            padding-left: var(--btn-px) !important;
            padding-right: var(--btn-px) !important;
            padding-top: var(--btn-py) !important;
            padding-bottom: var(--btn-py) !important;
            border-radius: var(--btn-radius) !important;
            font-size: var(--btn-font-size) !important;
            font-weight: var(--btn-font-weight) !important;
            text-transform: var(--btn-text-transform) !important;
            box-shadow: var(--btn-shadow) !important;
            height: auto !important;
            min-height: 2.25rem; /* Ensure it's not too small */
        }
      `}} />
      <div className={`${className} preview-area`}>
        {children}
      </div>
    </>
  );
}
