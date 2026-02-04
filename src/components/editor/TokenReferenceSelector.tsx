"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TokenReferenceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; previewValue?: string }[];
  placeholder?: string;
}

export function TokenReferenceSelector({ value, onChange, options, placeholder }: TokenReferenceSelectorProps) {
  // Determine if the current value is in the options, if not, we might be in "custom/raw" mode
  // But this selector is strictly for picking from the list.

  // Clean value for matching (remove {})
  const cleanValue = value.replace(/^\{(.*)\}$/, "$1");

  // Check if options have the value
  const selectedOption = options.find(o => {
      const optVal = o.value.replace(/^\{(.*)\}$/, "$1");
      return optVal === cleanValue;
  });

  const displayValue = selectedOption ? selectedOption.value : value;

  return (
    <Select value={displayValue} onValueChange={onChange}>
      <SelectTrigger className="w-full h-8 text-xs font-mono bg-white">
        <SelectValue placeholder={placeholder || "Select token..."}>
             {displayValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[200px] bg-white z-50">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs bg-white">
            <div className="flex items-center justify-between w-full gap-4">
               <span>{opt.label}</span>
               {opt.previewValue && (
                   <span className="text-muted-foreground font-mono text-[10px] opacity-70 truncate max-w-[80px]">
                       {opt.previewValue}
                   </span>
               )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
