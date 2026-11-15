"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { themeTemplates, tokensFromTemplate } from "@/lib/theme-templates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTokens } from "@/store/features/themeSlice";
import { cn } from "@/lib/utils";

export function ThemeTemplates() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.theme.present);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const selectedId = useMemo(() => {
    const serializedTokens = JSON.stringify(tokens);
    return themeTemplates.find((template) => JSON.stringify(template.tokens) === serializedTokens)?.id;
  }, [tokens]);
  const filteredTemplates = themeTemplates.filter((template) =>
    `${template.name} ${template.description}`.toLowerCase().includes(search.toLowerCase().trim()),
  );

  function applyTemplate(id: string, name: string) {
    dispatch(setTokens(tokensFromTemplate(id)));
    setMessage(`${name} applied. Continue editing your tokens, or use Undo to restore your previous theme.`);
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4" aria-label="Theme templates">
      <div className="space-y-2 shrink-0">
        <h2 className="text-sm font-semibold">Start with a template</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Eight complete themes with light and dark modes. Apply a starting point, then make it yours in Tokens.
        </p>
      </div>
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="Search templates"
          placeholder="Search templates…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground shrink-0" role="status" aria-live="polite">
        {message || "Applying a template replaces the current theme. Every change can be undone."}
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-2">
        <div className="grid gap-3">
          {filteredTemplates.map((template) => {
            const selected = selectedId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                aria-label={`Apply ${template.name} template`}
                aria-pressed={selected}
                onClick={() => applyTemplate(template.id, template.name)}
                disabled={selected}
                className={cn(
                  "w-full rounded-lg border bg-background p-4 text-left transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default",
                  selected && "border-slate-900 ring-1 ring-slate-900",
                )}
              >
                <div className="mb-3 flex h-8 overflow-hidden rounded-md border" aria-hidden="true">
                  {template.swatches.map((color, index) => <span key={index} className="flex-1" style={{ backgroundColor: color }} />)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{template.name}</span>
                  {selected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium"><Check className="h-3 w-3" aria-hidden="true" /> Applied</span>
                  ) : <span className="text-xs text-muted-foreground">Apply theme</span>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{template.description}</p>
              </button>
            );
          })}
          {filteredTemplates.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No templates match your search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
