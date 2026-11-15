"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlobalTokenEditor } from "@/components/editor/GlobalTokenEditor";
import { ComponentManager } from "@/components/editor/ComponentManager";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveMainTab } from "@/store/features/uiSlice";
import { GeneratorPanel } from "@/components/editor/GeneratorPanel";
import { WandSparkles } from "lucide-react";

export function EditorSidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.ui.activeMainTab);

  return (
    <div className="flex flex-col h-full border-r bg-muted/10 min-w-[480px]">
      <Tabs value={activeTab} onValueChange={(val) => dispatch(setActiveMainTab(val as 'tokens' | 'components' | 'generate'))} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b shrink-0">
            <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="generate"><WandSparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Generate</TabsTrigger>
            </TabsList>
        </div>

        <div className="flex-1 overflow-hidden p-4">
            <TabsContent value="tokens" className="h-full mt-0">
                <GlobalTokenEditor />
            </TabsContent>
            <TabsContent value="components" className="h-full mt-0">
                <ComponentManager />
            </TabsContent>
            <div hidden={activeTab !== 'generate'} className="h-full"><GeneratorPanel /></div>
        </div>
      </Tabs>
    </div>
  );
}
