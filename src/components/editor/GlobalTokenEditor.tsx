"use client";

import { DesignTokenSystem } from "@/types/token-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { TokenCategoryList, Category } from "./TokenCategoryList";
import { TokenField } from "./TokenField";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface GlobalTokenEditorProps {
  tokens: DesignTokenSystem;
  onChange: (tokens: DesignTokenSystem) => void;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b last:border-0">
            <Button
              variant="ghost"
              className="w-full justify-start p-2 h-auto hover:bg-muted/50 rounded-none font-medium text-sm"
              onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                {title}
            </Button>
            {isOpen && (
                <div className="pl-4 pr-2 pb-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export function GlobalTokenEditor({ tokens, onChange }: GlobalTokenEditorProps) {
  const [activeTab, setActiveTab] = useState("foundation");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const updateToken = useCallback((path: string[], value: string) => {
    const newTokens = JSON.parse(JSON.stringify(tokens));
    let current = newTokens;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(newTokens);
  }, [tokens, onChange]);

  const updateSettings = useCallback((key: string, value: string) => {
      const newTokens = JSON.parse(JSON.stringify(tokens));
      if (!newTokens.settings) {
          newTokens.settings = {};
      }
      newTokens.settings[key] = value;
      onChange(newTokens);
  }, [tokens, onChange]);




  const renderObjectFields = (obj: any, path: string[]) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];

      if (typeof value === "string") {
        return (
            <TokenField
                key={currentPath.join(".")}
                label={key}
                value={value}
                onChange={(val) => updateToken(currentPath, val)}
                path={currentPath}
                tokens={tokens}
            />
        );
      } else if (typeof value === "object" && value !== null) {
          // Special case for Semantic Color (light/dark)
          if ("light" in value && "dark" in value) {
              return (
                  <div key={key} className="mb-4 border-l-2 pl-2 border-muted">
                      <Label className="text-sm font-semibold mb-2 block">{key}</Label>
                      <TokenField
                        label="Light"
                        value={(value as any).light}
                        onChange={(val) => updateToken([...currentPath, "light"], val)}
                        path={[...currentPath, "light"]}
                        tokens={tokens}
                      />
                      <TokenField
                        label="Dark"
                        value={(value as any).dark}
                        onChange={(val) => updateToken([...currentPath, "dark"], val)}
                        path={[...currentPath, "dark"]}
                        tokens={tokens}
                      />
                  </div>
              );
          }
           // Special case for Typography Composite
          if ("fontSize" in value && "fontFamily" in value) {
               return (
                  <div key={key} className="mb-4 border p-2 rounded-md">
                      <Label className="text-sm font-semibold mb-2 block border-b pb-1">{key}</Label>
                      {Object.entries(value).map(([prop, val]) => (
                          <TokenField
                            key={prop}
                            label={prop}
                            value={val as string}
                            onChange={(v) => updateToken([...currentPath, prop], v)}
                            path={[...currentPath, prop]}
                            tokens={tokens}
                          />
                      ))}
                  </div>
               )
          }

         return (
             <CollapsibleSection title={key} key={key}>
                 {renderObjectFields(value, currentPath)}
             </CollapsibleSection>
         );
      }
      return null;
    });
  };

  const foundationCategories: Category[] = [
      { id: "colors", name: "Colors", description: "Global color palette" },
      { id: "typography", name: "Typography", description: "Fonts, sizes, weights" },
      { id: "spacing", name: "Spacing", description: "Margins, paddings, gaps" },
      { id: "sizing", name: "Sizing", description: "Widths, heights, container sizes" },
      { id: "radius", name: "Radius", description: "Border radius values" },
      { id: "borderWidth", name: "Border Width", description: "Stroke widths" },
  ];

  const semanticCategories: Category[] = [
      { id: "colors", name: "Colors", description: "Backgrounds, text, borders" },
      { id: "typography", name: "Typography", description: "Headings, body, captions" },
      { id: "shadow", name: "Shadow", description: "Elevation and depth" },
      { id: "motion", name: "Motion", description: "Animations and transitions" },
      { id: "opacity", name: "Opacity", description: "Transparency levels" },
      { id: "zIndex", name: "Z-Index", description: "Stacking order" },
  ];

  const renderEditor = () => {
      if (!selectedCategory) return null;

      let data: any;
      let pathPrefix: string[] = [];

      if (activeTab === "foundation") {
          data = tokens.foundation[selectedCategory as keyof typeof tokens.foundation];
          pathPrefix = ["foundation", selectedCategory];
      } else {
          data = tokens.semantic[selectedCategory as keyof typeof tokens.semantic];
          pathPrefix = ["semantic", selectedCategory];
      }

      if (!data) return <div className="p-4">No data found</div>;

      return (
          <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="h-8 w-8">
                      <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-bold capitalize">{selectedCategory.replace(/([A-Z])/g, ' $1').trim()}</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                  {renderObjectFields(data, pathPrefix)}
              </div>
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col">
       <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedCategory(null); }} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
             <TabsTrigger value="settings">Settings</TabsTrigger>
             <TabsTrigger value="foundation">Foundation</TabsTrigger>
             <TabsTrigger value="semantic">Semantic</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
               <TabsContent value="settings" className="mt-0 space-y-4 p-1">
                   <div className="space-y-4">
                       <div>
                           <Label className="text-sm font-semibold mb-2 block">Root Configuration</Label>
                           <TokenField
                                label="Base Font Size"
                                value={tokens.settings?.baseFontSize || "16px"}
                                onChange={(val) => updateSettings("baseFontSize", val)}
                                path={["settings", "baseFontSize"]}
                                tokens={tokens}
                           />
                           <p className="text-xs text-muted-foreground mt-1">
                               Sets the root font size (html). 1rem will equal this value.
                           </p>
                       </div>
                   </div>
               </TabsContent>

              <TabsContent value="foundation" className="h-full mt-0">
                   {selectedCategory ? renderEditor() : (
                       <TokenCategoryList categories={foundationCategories} onSelect={setSelectedCategory} />
                   )}
              </TabsContent>

              <TabsContent value="semantic" className="h-full mt-0">
                   {selectedCategory ? renderEditor() : (
                       <TokenCategoryList categories={semanticCategories} onSelect={setSelectedCategory} />
                   )}
              </TabsContent>
          </div>
       </Tabs>
    </div>
  );
}
