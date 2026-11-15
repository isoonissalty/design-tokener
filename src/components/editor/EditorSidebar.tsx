"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlobalTokenEditor } from "@/components/editor/GlobalTokenEditor";
import { ComponentManager } from "@/components/editor/ComponentManager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMainTab } from "@/store/features/uiSlice";
import { ThemeTemplates } from "./ThemeTemplates";
import { PaletteGenerator } from "./PaletteGenerator";

export function EditorSidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeMainTab);

  return (
    <aside aria-label="Theme editor" className="flex flex-col h-full min-h-0 min-w-0 border-r bg-background">
      <Tabs value={activeTab} onValueChange={(val) => dispatch(setActiveMainTab(val as typeof activeTab))} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b shrink-0">
            <TabsList aria-label="Editor tools" className="grid w-full grid-cols-4">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="palette">Palette</TabsTrigger>
            </TabsList>
        </div>

        <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="tokens" className="h-full mt-0">
                <GlobalTokenEditor />
            </TabsContent>
            <TabsContent value="components" className="h-full mt-0">
                <ComponentManager />
            </TabsContent>
            <TabsContent value="templates" className="h-full mt-0">
                <ThemeTemplates />
            </TabsContent>
            <TabsContent value="palette" className="h-full mt-0 overflow-y-auto">
                <PaletteGenerator />
            </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
