"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PaddingTokens } from "@/app/page";

interface ExportButtonProps {
  padding: PaddingTokens;
}

export function ExportButton({ padding }: ExportButtonProps) {
  const handleExport = () => {
    const configContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      padding: {
        'small': '${padding.small}px',
        'medium': '${padding.medium}px',
        'large': '${padding.large}px',
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
