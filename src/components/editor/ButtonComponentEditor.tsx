"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateToken } from "@/store/features/themeSlice";
import { setSelectedComponentId } from "@/store/features/uiSlice";

interface TokenInputProps {
    label: string;
    value: string;
    path: string[];
    type?: string;
    onUpdate: (path: string[], value: string) => void;
}

const TokenInput = ({ label, value, path, type = "text", onUpdate }: TokenInputProps) => {
    // Check if alias
    const isAlias = value.startsWith("{");
    const isColor = (type === "color" || /^#[0-9A-Fa-f]{6}$/.test(value)) && !isAlias;

    return (
       <div className="space-y-1">
           <Label className="text-xs">{label}</Label>
           <div className="flex gap-2">
                {isColor && (
                   <Input
                       type="color"
                       value={value}
                       onChange={(e) => onUpdate(path, e.target.value)}
                       className="w-8 h-8 p-0 border-0 rounded-md cursor-pointer shrink-0"
                   />
               )}
               <Input
                   type="text"
                   value={value}
                   onChange={(e) => onUpdate(path, e.target.value)}
                   className="h-8 text-xs font-mono"
               />
           </div>
       </div>
    );
 };

export function ButtonComponentEditor() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state) => state.theme.present);

  const updateButtonToken = (path: string[], value: string) => {
    // Prefix path with 'components', 'button'
    dispatch(updateToken({
        path: ['components', 'button', ...path],
        value
    }));
  };

  const { button } = tokens.components;

  return (
    <div className="space-y-6 h-full flex flex-col">
       <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => dispatch(setSelectedComponentId(null))} className="shrink-0 h-8 w-8" aria-label="Back to component list">
               <ArrowLeft className="w-4 h-4" />
            </Button>
         <h3 className="text-lg font-semibold">Button</h3>
       </div>

       {/* Preview Section */}
      <Card className="shrink-0">
        <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-sm font-medium">Live Button Preview</CardTitle>
        </CardHeader>
        <CardContent>
            {/* We use ThemeWrapper here to apply the styles to these buttons specifically */}
            <ThemeWrapper tokens={tokens} className="p-6 border rounded-md bg-muted/30 flex flex-wrap gap-4 items-center justify-center min-h-[100px] preview-root">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
            </ThemeWrapper>
        </CardContent>
      </Card>

      {/* Editor Controls */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Background Colors</h4>

            {/* Default */}
            <div className="space-y-2 border-l-2 pl-2">
                 <Label className="text-sm font-semibold">Default</Label>
                 <div className="grid grid-cols-2 gap-2">
                     <TokenInput label="Light" value={button.bg.default.light} path={["bg", "default", "light"]} onUpdate={updateButtonToken} />
                     <TokenInput label="Dark" value={button.bg.default.dark} path={["bg", "default", "dark"]} onUpdate={updateButtonToken} />
                 </div>
            </div>

            {/* Hover */}
            <div className="space-y-2 border-l-2 pl-2">
                 <Label className="text-sm font-semibold">Hover</Label>
                 <div className="grid grid-cols-2 gap-2">
                     <TokenInput label="Light" value={button.bg.hover.light} path={["bg", "hover", "light"]} onUpdate={updateButtonToken} />
                     <TokenInput label="Dark" value={button.bg.hover.dark} path={["bg", "hover", "dark"]} onUpdate={updateButtonToken} />
                 </div>
            </div>

             {/* Active */}
            <div className="space-y-2 border-l-2 pl-2">
                 <Label className="text-sm font-semibold">Active</Label>
                 <div className="grid grid-cols-2 gap-2">
                     <TokenInput label="Light" value={button.bg.active.light} path={["bg", "active", "light"]} onUpdate={updateButtonToken} />
                     <TokenInput label="Dark" value={button.bg.active.dark} path={["bg", "active", "dark"]} onUpdate={updateButtonToken} />
                 </div>
            </div>

             {/* Disabled */}
             <div className="space-y-2 border-l-2 pl-2">
                 <Label className="text-sm font-semibold">Disabled</Label>
                 <div className="grid grid-cols-2 gap-2">
                     <TokenInput label="Light" value={button.bg.disabled.light} path={["bg", "disabled", "light"]} onUpdate={updateButtonToken} />
                     <TokenInput label="Dark" value={button.bg.disabled.dark} path={["bg", "disabled", "dark"]} onUpdate={updateButtonToken} />
                 </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Text Colors</h4>
            <div className="space-y-2 border-l-2 pl-2">
                 <Label className="text-sm font-semibold">Default</Label>
                 <div className="grid grid-cols-2 gap-2">
                     <TokenInput label="Light" value={button.text.default.light} path={["text", "default", "light"]} onUpdate={updateButtonToken} />
                     <TokenInput label="Dark" value={button.text.default.dark} path={["text", "default", "dark"]} onUpdate={updateButtonToken} />
                 </div>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Shape & Spacing</h4>
            <div className="grid grid-cols-2 gap-4">
                 <TokenInput label="Radius" value={button.radius} path={["radius"]} onUpdate={updateButtonToken} />
                 <div className="col-span-2 grid grid-cols-2 gap-4">
                    <TokenInput label="Padding X" value={button.padding.x} path={["padding", "x"]} onUpdate={updateButtonToken} />
                    <TokenInput label="Padding Y" value={button.padding.y} path={["padding", "y"]} onUpdate={updateButtonToken} />
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
