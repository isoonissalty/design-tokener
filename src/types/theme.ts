export type ColorPalette = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
};

export type ThemeConfig = {
  light: ColorPalette;
  dark: ColorPalette;
  radius: number;
};

export type ButtonConfig = {
  paddingX: number;
  paddingY: number;
  borderRadius: number;
  fontSize: number;
  fontWeight: string;
  textTransform: string; // "none", "uppercase", etc.
  boxShadow: string; // "none", "sm", "md", "lg"
};

export const defaultLightColors: ColorPalette = {
  background: "#ffffff",
  foreground: "#09090b",
  card: "#ffffff",
  cardForeground: "#09090b",
  popover: "#ffffff",
  popoverForeground: "#09090b",
  primary: "#18181b",
  primaryForeground: "#fafafa",
  secondary: "#f4f4f5",
  secondaryForeground: "#18181b",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  accent: "#f4f4f5",
  accentForeground: "#18181b",
  destructive: "#ef4444",
  destructiveForeground: "#fafafa",
  border: "#e4e4e7",
  input: "#e4e4e7",
  ring: "#18181b",
};

export const defaultDarkColors: ColorPalette = {
  background: "#09090b",
  foreground: "#fafafa",
  card: "#09090b",
  cardForeground: "#fafafa",
  popover: "#09090b",
  popoverForeground: "#fafafa",
  primary: "#fafafa",
  primaryForeground: "#18181b",
  secondary: "#27272a",
  secondaryForeground: "#fafafa",
  muted: "#27272a",
  mutedForeground: "#a1a1aa",
  accent: "#27272a",
  accentForeground: "#fafafa",
  destructive: "#7f1d1d",
  destructiveForeground: "#fafafa",
  border: "#27272a",
  input: "#27272a",
  ring: "#d4d4d8",
};

export const defaultThemeConfig: ThemeConfig = {
  light: defaultLightColors,
  dark: defaultDarkColors,
  radius: 0.5,
};

export const defaultButtonConfig: ButtonConfig = {
  paddingX: 16,
  paddingY: 8,
  borderRadius: 0.375, // Matches radius 0.5rem approx (0.5rem = 8px? No, radius usually rem. 0.5rem = 8px)
  fontSize: 14,
  fontWeight: "500",
  textTransform: "none",
  boxShadow: "sm",
};
