"use client";

import { useState } from "react";
import { TokenEditor } from "@/components/TokenEditor";
// import { Preview } from "@/components/Preview"; // We are replacing the old preview or keeping it?
// The prompt said "After click preview it should show the mock up page".
// I will keep the old preview as a "Elements Preview" and add the Landing Page as the "Full Page Preview".
import { ExportButton } from "@/components/ExportButton";
import { defaultTokens, DesignTokens } from "@/types/tokens";
import { useDebounce } from "@/hooks/use-debounce";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);

  // Debounce the tokens for the heavy preview rendering
  const debouncedTokens = useDebounce(tokens, 300); // 300ms delay

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <main className="min-h-screen p-8 bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design Token Builder</h1>
            <p className="text-muted-foreground">Customize your theme tokens and verify with a live landing page.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
            </Button>
            <ExportButton tokens={tokens} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Editor Column */}
          <section className="lg:col-span-4">
            <h2 className="text-xl font-semibold mb-4">Token Editor</h2>
            <TokenEditor tokens={tokens} onChange={setTokens} />
          </section>

          {/* Quick Preview Column (Mini elements) */}
          <section className="lg:col-span-8 space-y-8">
            <h2 className="text-xl font-semibold mb-4">Quick Element Preview</h2>
             {/* Using debounced tokens here too for consistency, though less critical than full page */}

             <div className="grid gap-6">
                <Card>
                    <CardHeader><CardTitle>Typography Scale</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground">Heading 1 ({debouncedTokens.typography.h1}px)</span>
                            <h1 style={{ fontSize: debouncedTokens.typography.h1, color: debouncedTokens.colors.text }} className="font-bold">
                                The quick brown fox
                            </h1>
                        </div>
                         <div>
                            <span className="text-xs text-muted-foreground">Heading 2 ({debouncedTokens.typography.h2}px)</span>
                            <h2 style={{ fontSize: debouncedTokens.typography.h2, color: debouncedTokens.colors.text }} className="font-bold">
                                Jumps over the lazy dog
                            </h2>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Colors & Buttons</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex gap-4 flex-wrap">
                            <button
                                style={{
                                    backgroundColor: debouncedTokens.colors.primary,
                                    color: "#fff",
                                    padding: `${debouncedTokens.spacing.medium}px ${debouncedTokens.spacing.large}px`,
                                    borderRadius: debouncedTokens.borderRadius.medium
                                }}
                            >
                                Primary Button
                            </button>
                             <button
                                style={{
                                    backgroundColor: debouncedTokens.colors.secondary,
                                    color: "#fff",
                                    padding: `${debouncedTokens.spacing.small}px ${debouncedTokens.spacing.medium}px`,
                                    borderRadius: debouncedTokens.borderRadius.small
                                }}
                            >
                                Secondary Small
                            </button>
                         </div>
                         <div className="flex gap-4 mt-4">
                            <div
                                className="w-24 h-24 rounded flex items-center justify-center border"
                                style={{ backgroundColor: debouncedTokens.colors.background, color: debouncedTokens.colors.text }}
                            >
                                Bg/Text
                            </div>
                         </div>
                    </CardContent>
                </Card>
             </div>
          </section>
        </div>
      </div>

      {/* Full Screen Overlay Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
             <div className="bg-white w-full h-full rounded-lg shadow-2xl overflow-hidden relative flex flex-col">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <span className="font-semibold">Landing Page Preview</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsPreviewOpen(false)}
                        className="hover:bg-white/10 text-white"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 overflow-auto bg-gray-50">
                    {/* Pass debounced tokens to the heavy landing page */}
                    <LandingPage tokens={debouncedTokens} />
                </div>
             </div>
        </div>
      )}
    </main>
  );
}
