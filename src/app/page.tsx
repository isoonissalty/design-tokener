"use client";

import { useState } from "react";
import { TokenEditor } from "@/components/TokenEditor";
import { Preview } from "@/components/Preview";
import { ExportButton } from "@/components/ExportButton";

export type PaddingTokens = {
  small: number;
  medium: number;
  large: number;
};

export default function Home() {
  const [padding, setPadding] = useState<PaddingTokens>({
    small: 4,
    medium: 16,
    large: 32,
  });

  const handlePaddingChange = (key: keyof PaddingTokens, value: number) => {
    setPadding((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <main className="min-h-screen p-8 bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design Token Builder</h1>
            <p className="text-muted-foreground">Customize your Tailwind theme tokens.</p>
          </div>
          <ExportButton padding={padding} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Editor</h2>
            <TokenEditor padding={padding} onChange={handlePaddingChange} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <Preview padding={padding} />
          </section>
        </div>
      </div>
    </main>
  );
}
