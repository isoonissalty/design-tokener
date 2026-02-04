"use client";

import { DesignTokenSystem, FoundationTokens, SemanticTokens } from "@/types/token-system";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalTokenEditorProps {
  tokens: DesignTokenSystem;
  onChange: (tokens: DesignTokenSystem) => void;
}

export function GlobalTokenEditor({ tokens, onChange }: GlobalTokenEditorProps) {
  const [activeTab, setActiveTab] = useState("foundation");

  const updateToken = (path: string[], value: string) => {
    // Deep clone to avoid mutation
    const newTokens = JSON.parse(JSON.stringify(tokens));

    // Traverse to parent
    let current = newTokens;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    // Set value
    current[path[path.length - 1]] = value;

    onChange(newTokens);
  };

  const TokenInput = ({ label, value, path, type = "text" }: { label: string, value: string, path: string[], type?: string }) => {
    const isColor = type === "color" || /^#[0-9A-Fa-f]{6}$/.test(value);

    return (
      <div className="flex items-center gap-2 mb-2">
        <Label className="w-32 truncate text-xs" title={label}>{label}</Label>
        <div className="flex-1 flex gap-2">
            {/* Color Preview/Picker if applicable and value is not an alias */}
            {type === "color" && !value.startsWith("{") && (
                <div className="relative">
                    <Input
                        type="color"
                        value={value}
                        onChange={(e) => updateToken(path, e.target.value)}
                        className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer shrink-0"
                    />
                </div>
            )}
            <Input
                type="text"
                value={value}
                onChange={(e) => updateToken(path, e.target.value)}
                className="h-8 text-xs font-mono"
            />
        </div>
      </div>
    );
  };

  // Simple collapsible section
  const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
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

  const renderObjectFields = (obj: any, path: string[], typeHint?: string) => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      if (typeof value === "string") {
        return <TokenInput key={key} label={key} value={value} path={currentPath} type={typeHint || (key.includes("color") ? "color" : "text")} />;
      } else if (typeof value === "object" && value !== null) {
          // Special case for Semantic Color (light/dark)
          if ("light" in value && "dark" in value) {
              return (
                  <div key={key} className="mb-4 border-l-2 pl-2 border-muted">
                      <Label className="text-sm font-semibold mb-2 block">{key}</Label>
                      <TokenInput label="Light" value={(value as any).light} path={[...currentPath, "light"]} type="text" />
                      <TokenInput label="Dark" value={(value as any).dark} path={[...currentPath, "dark"]} type="text" />
                  </div>
              );
          }
           // Special case for Typography Composite
          if ("fontSize" in value && "fontFamily" in value) {
               return (
                  <div key={key} className="mb-4 border p-2 rounded-md">
                      <Label className="text-sm font-semibold mb-2 block border-b pb-1">{key}</Label>
                      {Object.entries(value).map(([prop, val]) => (
                          <TokenInput key={prop} label={prop} value={val as string} path={[...currentPath, prop]} />
                      ))}
                  </div>
               )
          }

         // Recursion for nested objects (like colors.gray)
         return (
             <CollapsibleSection title={key} key={key}>
                 {renderObjectFields(value, currentPath, typeHint)}
             </CollapsibleSection>
         );
      }
      return null;
    });
  };

  return (
    <div className="h-full flex flex-col">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-4 shrink-0">
             <TabsTrigger value="foundation">Foundation</TabsTrigger>
             <TabsTrigger value="semantic">Semantic</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
              <TabsContent value="foundation" className="mt-0 space-y-4">
                  <div className="w-full border rounded-md divide-y">
                      {/* Foundation Colors */}
                      <div className="p-2 bg-muted/20 font-semibold text-sm">Colors</div>
                      <div className="p-2">
                        {renderObjectFields(tokens.foundation.colors, ["foundation", "colors"], "color")}
                      </div>

                      {/* Typography */}
                      <div className="p-2 bg-muted/20 font-semibold text-sm">Typography</div>
                      <div className="p-2">
                        {renderObjectFields(tokens.foundation.typography, ["foundation", "typography"], "text")}
                      </div>

                       {/* Spacing */}
                       <div className="p-2 bg-muted/20 font-semibold text-sm">Spacing</div>
                       <div className="p-2">
                        {renderObjectFields(tokens.foundation.spacing, ["foundation", "spacing"], "text")}
                      </div>

                       {/* Other Foundation */}
                       <div className="p-2 bg-muted/20 font-semibold text-sm">Sizing</div>
                       <div className="p-2">
                         {renderObjectFields(tokens.foundation.sizing, ["foundation", "sizing"], "text")}
                       </div>
                       <div className="p-2 bg-muted/20 font-semibold text-sm">Radius</div>
                       <div className="p-2">
                         {renderObjectFields(tokens.foundation.radius, ["foundation", "radius"], "text")}
                       </div>
                  </div>
              </TabsContent>

              <TabsContent value="semantic" className="mt-0 space-y-4">
                   <div className="w-full border rounded-md divide-y">
                        {/* Semantic Colors */}
                      <div className="p-2 bg-muted/20 font-semibold text-sm">Colors</div>
                      <div className="p-2">
                        {renderObjectFields(tokens.semantic.colors, ["semantic", "colors"])}
                      </div>

                      {/* Semantic Typography */}
                      <div className="p-2 bg-muted/20 font-semibold text-sm">Typography</div>
                      <div className="p-2">
                        {renderObjectFields(tokens.semantic.typography, ["semantic", "typography"])}
                      </div>

                      {/* Others */}
                      <div className="p-2 bg-muted/20 font-semibold text-sm">Shadow</div>
                      <div className="p-2">
                        {renderObjectFields(tokens.semantic.shadow, ["semantic", "shadow"])}
                      </div>
                       <div className="p-2 bg-muted/20 font-semibold text-sm">Motion</div>
                       <div className="p-2">
                        {renderObjectFields(tokens.semantic.motion, ["semantic", "motion"])}
                      </div>
                   </div>
              </TabsContent>
          </div>
       </Tabs>
    </div>
  );
}
