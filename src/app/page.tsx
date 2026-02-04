"use client";

import { useState } from "react";
import { defaultThemeConfig, defaultButtonConfig, ThemeConfig, ButtonConfig } from "@/types/theme";
import { GlobalTokenEditor } from "@/components/editor/GlobalTokenEditor";
import { ButtonComponentEditor } from "@/components/editor/ButtonComponentEditor";
import { LandingPage } from "@/components/landing-page/LandingPage";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

export default function Home() {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultThemeConfig);
  const [buttonConfig, setButtonConfig] = useState<ButtonConfig>(defaultButtonConfig);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tokens");

  return (
    <main className="h-screen flex flex-col bg-background text-foreground font-sans overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b shrink-0 bg-background z-10">
             <h1 className="text-xl font-bold">Design Token Builder</h1>
             <div className="flex gap-2">
                 <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Full Screen Preview
                 </Button>
                 <ExportButton themeConfig={themeConfig} buttonConfig={buttonConfig} />
             </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Editor */}
            <aside className="w-[400px] border-r flex flex-col bg-muted/10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="p-4 border-b shrink-0">
                         <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="tokens">Tokens</TabsTrigger>
                            <TabsTrigger value="components">Components</TabsTrigger>
                         </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden p-4">
                        <TabsContent value="tokens" className="h-full mt-0">
                            <GlobalTokenEditor config={themeConfig} onChange={setThemeConfig} />
                        </TabsContent>
                        <TabsContent value="components" className="h-full mt-0">
                             <ButtonComponentEditor
                                buttonConfig={buttonConfig}
                                themeConfig={themeConfig}
                                onChange={setButtonConfig}
                             />
                        </TabsContent>
                    </div>
                </Tabs>
            </aside>

            {/* Main Preview Area */}
            <section className="flex-1 bg-muted/20 relative overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
                     {/* We wrap the preview in ThemeWrapper */}
                     <ThemeWrapper themeConfig={themeConfig} buttonConfig={buttonConfig} className="w-full max-w-5xl shadow-2xl rounded-xl overflow-hidden border bg-background ring-1 ring-slate-900/5 origin-top scale-90">
                        <LandingPage />
                     </ThemeWrapper>
                </div>
            </section>
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
                        <ThemeWrapper themeConfig={themeConfig} buttonConfig={buttonConfig} className="min-h-full">
                           <LandingPage />
                        </ThemeWrapper>
                    </div>
                </div>
            </div>
        )}
    </main>
  )
}
