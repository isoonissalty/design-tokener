/** Shared metadata for preview selection, state, and full screen titles. */
export const previewTemplates = {
  landing: { label: "Landing page", brand: "Brand" },
  dashboard: { label: "Dashboard", brand: "Workspace" },
  pricing: { label: "Pricing page", brand: "Forma" },
  settings: { label: "Settings & forms", brand: "Account" },
  components: { label: "Component gallery", brand: "Component library" },
  storefront: { label: "Storefront", brand: "Everyday objects" },
  article: { label: "Article / documentation", brand: "Field notes" },
} as const;

export type PreviewTemplateId = keyof typeof previewTemplates;

export const previewTemplateIds = Object.keys(previewTemplates) as PreviewTemplateId[];

export function isPreviewTemplateId(value: string): value is PreviewTemplateId {
  return Object.hasOwn(previewTemplates, value);
}
