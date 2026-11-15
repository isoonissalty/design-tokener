"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DesignTokenSystem } from "@/types/token-system";
import { generateThemeExport } from "@/lib/generation-export";

interface ExportButtonProps {
  tokens: DesignTokenSystem;
}

export function ExportButton({ tokens }: ExportButtonProps) {
  const handleExport = () => {
    const { cssContent, configContent } = generateThemeExport(tokens);

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
