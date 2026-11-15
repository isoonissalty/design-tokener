"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlobalTokenEditor } from "./GlobalTokenEditor";
import { ComponentManager } from "./ComponentManager";
import { GeneratorPanel } from "./GeneratorPanel";
import { ThemeTemplates } from "./ThemeTemplates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMainTab } from "@/store/features/uiSlice";

export function EditorSidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeMainTab);

  return (
    <aside aria-label="Theme editor" className="flex flex-col h-full min-h-0 min-w-0 border-r bg-background">
      <Tabs value={activeTab} onValueChange={(value) => dispatch(setActiveMainTab(value as typeof activeTab))} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b shrink-0">
          <TabsList aria-label="Editor tools" className="grid w-full grid-cols-4">
            <TabsTrigger value="tokens" className="px-1">Tokens</TabsTrigger>
            <TabsTrigger value="components" className="px-1">Components</TabsTrigger>
            <TabsTrigger value="templates" className="px-1">Templates</TabsTrigger>
            <TabsTrigger value="generate" className="px-1">Generate</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden p-4">
          <TabsContent value="tokens" className="h-full mt-0"><GlobalTokenEditor /></TabsContent>
          <TabsContent value="components" className="h-full mt-0"><ComponentManager /></TabsContent>
          <TabsContent value="templates" className="h-full mt-0"><ThemeTemplates /></TabsContent>
          <TabsContent value="generate" className="h-full mt-0"><GeneratorPanel /></TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
