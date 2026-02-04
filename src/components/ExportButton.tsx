"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ThemeConfig, ButtonConfig } from "@/types/theme";
import { hexToHsl } from "@/lib/colors";

interface ExportButtonProps {
  themeConfig: ThemeConfig;
  buttonConfig: ButtonConfig;
}

export function ExportButton({ themeConfig, buttonConfig }: ExportButtonProps) {
  const handleExport = () => {
    // 1. Generate CSS Content
    const lightVars = Object.entries(themeConfig.light).map(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        return `    ${cssVar}: ${hexToHsl(value)};`;
    }).join("\n");

    const darkVars = Object.entries(themeConfig.dark).map(([key, value]) => {
        const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        return `    ${cssVar}: ${hexToHsl(value)};`;
    }).join("\n");

    const cssContent = `@layer base {
  :root {
${lightVars}
    --radius: ${themeConfig.radius}rem;
  }

  .dark {
${darkVars}
  }
}

@layer components {
  /* Add this class to your buttons or update your base button component */
  .btn-custom {
    padding: ${buttonConfig.paddingY}px ${buttonConfig.paddingX}px;
    border-radius: ${buttonConfig.borderRadius}rem;
    font-size: ${buttonConfig.fontSize}px;
    font-weight: ${buttonConfig.fontWeight};
    text-transform: ${buttonConfig.textTransform};
    box-shadow: ${buttonConfig.boxShadow === 'none' ? 'none' :
                    buttonConfig.boxShadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
                    buttonConfig.boxShadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
                    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'};
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
