import type { DesignTokenSystem } from "@/types/token-system";

export type FontLanguage = "en" | "th";

export interface FontOption {
  id: string;
  label: string;
  family: string;
  source: "google" | "system";
  googleFamily?: string;
}

export const fontOptions: Record<FontLanguage, readonly FontOption[]> = {
  en: [
    { id: "inter", label: "Inter", family: '"Inter"', source: "google", googleFamily: "Inter" },
    { id: "roboto", label: "Roboto", family: '"Roboto"', source: "google", googleFamily: "Roboto" },
    { id: "lato", label: "Lato", family: '"Lato"', source: "google", googleFamily: "Lato" },
    { id: "open-sans", label: "Open Sans", family: '"Open Sans"', source: "google", googleFamily: "Open Sans" },
    { id: "georgia", label: "Georgia", family: "Georgia", source: "system" },
  ],
  th: [
    { id: "noto-sans-thai", label: "Noto Sans Thai", family: '"Noto Sans Thai"', source: "google", googleFamily: "Noto Sans Thai" },
    { id: "sarabun", label: "Sarabun", family: '"Sarabun"', source: "google", googleFamily: "Sarabun" },
    { id: "prompt", label: "Prompt", family: '"Prompt"', source: "google", googleFamily: "Prompt" },
    { id: "kanit", label: "Kanit", family: '"Kanit"', source: "google", googleFamily: "Kanit" },
    { id: "noto-serif-thai", label: "Noto Serif Thai", family: '"Noto Serif Thai"', source: "google", googleFamily: "Noto Serif Thai" },
  ],
};

export const fontPairings = [
  { id: "clean", label: "Clean & versatile", description: "Inter + Noto Sans Thai", en: "inter", th: "noto-sans-thai" },
  { id: "readable", label: "Everyday reading", description: "Roboto + Sarabun", en: "roboto", th: "sarabun" },
  { id: "friendly", label: "Friendly & rounded", description: "Lato + Prompt", en: "lato", th: "prompt" },
] as const;

/** Parse complete family names, so quoted commas and similar names cannot match a catalog font. */
function parseFamilies(value: string): string[] | undefined {
  if (!value.trim() || value.length > 4096 || /[;{}<>\\\u0000-\u001f\u007f]/.test(value) || /(?:url|expression)\s*\(|@import|javascript:/i.test(value)) return;
  const names: string[] = [];
  let quote = "";
  let start = 0;
  const add = (part: string) => {
    const trimmed = part.trim();
    const quoted = trimmed[0] === '"' || trimmed[0] === "'";
    if (quoted) {
      if (trimmed.length < 3 || trimmed.at(-1) !== trimmed[0] || trimmed.slice(1, -1).includes(trimmed[0])) return false;
      names.push(trimmed.slice(1, -1));
    } else {
      // CSS family names are identifiers, optionally separated by spaces.
      if (!/^-?(?:[_a-zA-Z\u0080-\uffff][\w\u0080-\uffff-]*)(?:\s+-?[_a-zA-Z\u0080-\uffff][\w\u0080-\uffff-]*)*$/.test(trimmed)) return false;
      names.push(trimmed.replace(/\s+/g, " "));
    }
    return true;
  };
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (character === '"' || character === "'") {
      if (!quote) quote = character;
      else if (quote === character) quote = "";
    } else if (character === "," && !quote) {
      if (!add(value.slice(start, index))) return;
      start = index + 1;
    }
  }
  if (quote || !add(value.slice(start))) return;
  return names;
}

export function isSafeFontFamily(value: unknown): value is string {
  return typeof value === "string" && parseFamilies(value) !== undefined;
}

/** Resolve only font-family aliases and validate their complete dependency graph. */
export function resolveFontFamily(families: Record<string, string | undefined>, name: string): string | undefined {
  const cache = new Map<string, string>();
  const resolve = (key: string, chain: Set<string>): string | undefined => {
    if (chain.has(key) || chain.size >= 100 || !Object.hasOwn(families, key)) return;
    const value = families[key];
    if (typeof value !== "string" || value.length > 4096) return;
    if (cache.has(key)) return cache.get(key);
    const nextChain = new Set(chain).add(key);
    let expanded = "";
    let end = 0;
    for (const match of value.matchAll(/\{([^}]+)\}/g)) {
      const reference = /^font\.family\.([a-zA-Z0-9][a-zA-Z0-9_-]*)$/.exec(match[1]);
      if (!reference) return;
      const resolved = resolve(reference[1], nextChain);
      if (resolved === undefined) return;
      expanded += value.slice(end, match.index) + resolved;
      if (expanded.length > 4096) return;
      end = match.index + match[0].length;
    }
    expanded += value.slice(end);
    if (!isSafeFontFamily(expanded)) return;
    cache.set(key, expanded);
    return expanded;
  };
  return resolve(name, new Set());
}

export function getFontOption(language: FontLanguage, family: string): FontOption | undefined {
  const names = parseFamilies(family);
  if (names?.length !== 1) return;
  return fontOptions[language].find(option => parseFamilies(option.family)?.[0].toLowerCase() === names[0].toLowerCase());
}

/** Only catalog fonts are fetched; arbitrary imported family names stay local. */
export function getFontStylesheetUrl(tokens: DesignTokenSystem): string | undefined {
  const requested = new Set<string>();
  const catalog = [...fontOptions.en, ...fontOptions.th].filter(option => option.source === "google" && option.googleFamily);
  const genericFamilies = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "emoji", "math", "fangsong"]);
  for (const value of Object.values(tokens.foundation.typography.family)) {
    if (typeof value !== "string") continue;
    for (const name of parseFamilies(value) ?? []) {
      // A generic family is already a complete system fallback. In particular,
      // the legacy default lists Roboto after system-ui and needs no download.
      if (genericFamilies.has(name.toLowerCase())) break;
      const match = catalog.find(option => option.googleFamily!.toLowerCase() === name.toLowerCase());
      if (match) requested.add(match.googleFamily!);
    }
  }
  if (!requested.size) return;
  const families = [...requested].sort().map(name => `family=${encodeURIComponent(name).replace(/%20/g, "+")}:wght@400;500;700`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
