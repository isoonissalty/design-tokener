"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DesignTokens } from "@/types/tokens";

interface ExportButtonProps {
  tokens: DesignTokens;
}

export function ExportButton({ tokens }: ExportButtonProps) {
  const handleExport = () => {
    const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '${tokens.colors.primary}',
        secondary: '${tokens.colors.secondary}',
        background: '${tokens.colors.background}',
        text: '${tokens.colors.text}',
      },
      spacing: {
        'small': '${tokens.spacing.small}px',
        'medium': '${tokens.spacing.medium}px',
        'large': '${tokens.spacing.large}px',
        'container': '${tokens.spacing.container}px',
      },
      fontSize: {
        'h1': '${tokens.typography.h1}px',
        'h2': '${tokens.typography.h2}px',
        'body': '${tokens.typography.body}px',
      },
      borderRadius: {
        'small': '${tokens.borderRadius.small}px',
        'medium': '${tokens.borderRadius.medium}px',
        'large': '${tokens.borderRadius.large}px',
      }
    },
  },
  plugins: [],
};
`;

    const blob = new Blob([configContent], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tailwind.custom.config.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Config
    </Button>
  );
}
