"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DesignTokenSystem } from "@/types/token-system";
import { generateTokenCss } from "@/lib/css-generator";

interface ExportButtonProps {
  tokens: DesignTokenSystem;
}

export function ExportButton({ tokens }: ExportButtonProps) {
  const handleExport = () => {
    // 1. Generate CSS Content
    const { root, dark } = generateTokenCss(tokens);

    const cssContent = `@layer base {
  :root {
    ${root.join("\n    ")}

    /* Mappings */
    --background: var(--color-bg-canvas);
    --foreground: var(--color-text-primary);
    --card: var(--color-bg-surface);
    --card-foreground: var(--color-text-primary);
    --popover: var(--color-bg-surface);
    --popover-foreground: var(--color-text-primary);
    --primary: var(--color-intent-primary);
    --primary-foreground: var(--color-text-inverse);
    --secondary: var(--color-bg-subtle);
    --secondary-foreground: var(--color-text-primary);
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

  .dark {
    ${dark.join("\n    ")}
  }
}
`;

    // 2. Generate Tailwind Config
    const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
`;

    // Helper to download file
    const download = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    download(cssContent, "theme.css", "text/css");
    download(configContent, "tailwind.config.js", "text/javascript");
  };

  return (
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Theme
    </Button>
  );
}
