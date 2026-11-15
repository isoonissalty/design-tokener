"use client";

import React from "react";
import { DesignTokenSystem } from "@/types/token-system";
import { generateTokenCss } from "@/lib/css-generator";

interface ThemeWrapperProps {
  tokens: DesignTokenSystem;
  children: React.ReactNode;
  className?: string;
}

export function ThemeWrapper({ tokens, children, className }: ThemeWrapperProps) {

  const { root: cssVarsRoot, dark: cssVarsDark } = generateTokenCss(tokens);
  const baseFontSize = tokens.settings?.baseFontSize || "16px";
  const configuredRoot = /^(\d+(?:\.\d+)?)px$/.exec(baseFontSize.trim());
  const rootPx = configuredRoot && Number(configuredRoot[1]) > 0 ? Number(configuredRoot[1]) : 16;
  // A preview's font-size cannot change rem, which always uses the document
  // root. Resolve token rem lengths here so editor dimensions stay isolated.
  const previewValue = (value: string) => value.replace(/(-?(?:\d+\.?\d*|\.\d+))rem\b/g, (_, length: string) => `${Number(length) * rootPx}px`);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .preview-root {
          font-size: ${rootPx}px;
        }
        .preview-root {
          ${cssVarsRoot.map(previewValue).join("\n")}
        }
        .preview-root .dark {
          ${cssVarsDark.map(previewValue).join("\n")}
        }

        /* Map V1 Tokens to Shadcn/Tailwind Theme Variables */
        .preview-root {
            --background: var(--color-bg-canvas);
            --foreground: var(--color-text-primary);

            --card: var(--color-bg-surface);
            --card-foreground: var(--color-text-primary);

            --popover: var(--color-bg-surface);
            --popover-foreground: var(--color-text-primary);

            --primary: var(--color-intent-primary);
            --primary-foreground: var(--color-intent-on-primary, var(--color-text-inverse));

            --secondary: var(--color-intent-secondary, var(--color-bg-subtle));
            --secondary-foreground: var(--color-intent-on-secondary, var(--color-text-primary));

            --muted: var(--color-bg-subtle);
            --muted-foreground: var(--color-text-secondary);

            --accent: var(--color-bg-subtle);
            --accent-foreground: var(--color-text-primary);

            --destructive: var(--color-intent-error);
            --destructive-foreground: var(--color-text-inverse);

            --border: var(--color-border-default);
            --input: var(--color-border-default);
            --ring: var(--color-border-focus);

            --radius: var(--radius-md);
        }

        /* Override shadcn's default .dark values - use the same token mappings */
        .preview-root .dark {
            --background: var(--color-bg-canvas);
            --foreground: var(--color-text-primary);

            --card: var(--color-bg-surface);
            --card-foreground: var(--color-text-primary);

            --popover: var(--color-bg-surface);
            --popover-foreground: var(--color-text-primary);

            --primary: var(--color-intent-primary);
            --primary-foreground: var(--color-intent-on-primary, var(--color-text-inverse));

            --secondary: var(--color-intent-secondary, var(--color-bg-subtle));
            --secondary-foreground: var(--color-intent-on-secondary, var(--color-text-primary));

            --muted: var(--color-bg-subtle);
            --muted-foreground: var(--color-text-secondary);

            --accent: var(--color-bg-subtle);
            --accent-foreground: var(--color-text-primary);

            --destructive: var(--color-intent-error);
            --destructive-foreground: var(--color-text-inverse);

            --border: var(--color-border-default);
            --input: var(--color-border-default);
            --ring: var(--color-border-focus);

            --radius: var(--radius-md);
        }
      `}} />
      <div className={`${className} preview-root preview-area`}>
        {children}
      </div>
    </>
  );
}
