import { useState } from "react";
import { ComponentList } from "./ComponentList";
import { ButtonComponentEditor } from "./ButtonComponentEditor";
import { DesignTokenSystem } from "@/types/token-system";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ComponentManagerProps {
  tokens: DesignTokenSystem;
  onChange: (tokens: DesignTokenSystem) => void;
}

export function ComponentManager({ tokens, onChange }: ComponentManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId === "button") {
    return (
      <ButtonComponentEditor
        tokens={tokens}
        onChange={onChange}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  if (selectedId) {
    // Placeholder for other components
    return (
      <div className="flex flex-col h-full">
         <div className="flex items-center gap-2 mb-4">
             <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)} className="shrink-0 h-8 w-8">
               <ArrowLeft className="w-4 h-4" />
             </Button>
             <h3 className="font-bold capitalize">{selectedId}</h3>
         </div>
         <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Specific configuration for {selectedId} is coming soon.</p>
                <p className="text-sm mt-2">This component currently inherits global tokens.</p>
            </CardContent>
         </Card>
      </div>
    );
  }

  return <ComponentList onSelect={setSelectedId} />;
}
