import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface ComponentListProps {
  onSelect: (componentId: string) => void;
}

const components = [
  { id: "button", name: "Button", description: "Trigger actions or events" },
  { id: "card", name: "Card", description: "Container for grouped content" },
  { id: "input", name: "Input", description: "Capture user text input" },
  { id: "label", name: "Label", description: "Label for form controls" },
  { id: "slider", name: "Slider", description: "Select a value from a range" },
  { id: "tabs", name: "Tabs", description: "Switch between content sections" },
];

export function ComponentList({ onSelect }: ComponentListProps) {
  const [search, setSearch] = useState("");

  const filtered = components.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Input
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        <div className="space-y-1">
          {filtered.map((component) => (
            <Button
              key={component.id}
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 items-start text-left"
              onClick={() => onSelect(component.id)}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{component.name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {component.description}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
            </Button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No components found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
