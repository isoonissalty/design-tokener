"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

interface TokenCategoryListProps {
  categories: Category[];
  onSelect: (id: string) => void;
}

export function TokenCategoryList({ categories, onSelect }: TokenCategoryListProps) {
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Input
          placeholder="Search categories..."
          aria-label="Search token categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        <div className="space-y-1">
          {filtered.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className="w-full justify-between h-auto py-3 px-4 items-start text-left"
              onClick={() => onSelect(category.id)}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{category.name}</span>
                {category.description && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {category.description}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
            </Button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No categories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
