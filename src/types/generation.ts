export type GenerationCategory = "colors" | "spacing" | "radius" | "sizing";

export interface GenerationSource {
  title: string;
  url: string;
}

export interface GeneratedToken {
  /** Key relative to the foundation category, e.g. primary.500 or md. */
  key: string;
  value: string;
  reason: string;
}

export interface GenerationResult {
  category: GenerationCategory;
  title: string;
  summary: string;
  parameters: Record<string, string>;
  sources: GenerationSource[];
  tokens: GeneratedToken[];
}
