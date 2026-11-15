"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlobalTokenEditor } from "./GlobalTokenEditor";
import { ComponentManager } from "./ComponentManager";
import { GeneratorPanel } from "./GeneratorPanel";
import { ThemeTemplates } from "./ThemeTemplates";
import { FontSetup } from "./FontSetup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMainTab, setPreviewTemplate } from "@/store/features/uiSlice";

export function EditorSidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeMainTab);

  return (
    <aside aria-label="Theme editor" className="flex flex-col h-full min-h-0 min-w-0 border-r bg-background">
      <Tabs value={activeTab} onValueChange={(value) => { dispatch(setActiveMainTab(value as typeof activeTab)); if (value === "fonts") dispatch(setPreviewTemplate("fonts")); }} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b shrink-0">
          <TabsList aria-label="Editor tools" className="flex h-auto min-h-9 w-full justify-start gap-0.5 overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="tokens" className="flex-1 shrink-0 px-2 text-xs">Tokens</TabsTrigger>
            <TabsTrigger value="fonts" className="flex-1 shrink-0 px-2 text-xs">Fonts</TabsTrigger>
            <TabsTrigger value="components" className="flex-1 shrink-0 px-2 text-xs">Components</TabsTrigger>
            <TabsTrigger value="templates" className="flex-1 shrink-0 px-2 text-xs">Templates</TabsTrigger>
            <TabsTrigger value="generate" className="flex-1 shrink-0 px-2 text-xs">Generate</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-4">
          <TabsContent value="tokens" className="h-full mt-0"><GlobalTokenEditor /></TabsContent>
          <TabsContent value="fonts" className="h-full mt-0"><FontSetup /></TabsContent>
          <TabsContent value="components" className="h-full mt-0"><ComponentManager /></TabsContent>
          <TabsContent value="templates" className="h-full mt-0"><ThemeTemplates /></TabsContent>
          <TabsContent value="generate" forceMount className="h-full mt-0"><GeneratorPanel /></TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
