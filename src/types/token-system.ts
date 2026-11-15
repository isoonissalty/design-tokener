import type { GenerationCategory, GenerationResult } from "./generation";

export type TokenValue = string;

// --- 1. Foundation Tokens ---

export interface FoundationColors {
  [palette: string]: Record<string, TokenValue>;
}

export interface FoundationTypography {
  family: {
    sans: TokenValue;
    serif: TokenValue;
    mono: TokenValue;
  };
  size: {
    xs: TokenValue;
    sm: TokenValue;
    base: TokenValue;
    lg: TokenValue;
    xl: TokenValue;
    [key: string]: TokenValue;
  };
  weight: {
    regular: TokenValue;
    medium: TokenValue;
    bold: TokenValue;
    [key: string]: TokenValue;
  };
  lineHeight: {
    tight: TokenValue;
    normal: TokenValue;
    relaxed: TokenValue;
    [key: string]: TokenValue;
  };
  letterSpacing: {
    tight: TokenValue;
    normal: TokenValue;
    wide: TokenValue;
    [key: string]: TokenValue;
  };
}

export interface FoundationTokens {
  colors: FoundationColors;
  typography: FoundationTypography;
  spacing: Record<string, TokenValue>; // space.0, space.1, ...
  sizing: Record<string, TokenValue>;  // size.xs, ...
  radius: Record<string, TokenValue>;  // radius.sm, ...
  borderWidth: Record<string, TokenValue>; // border.width.0, ...
}

// --- 2. Semantic Tokens ---

export interface SemanticColorValue {
  light: TokenValue;
  dark: TokenValue;
}

export interface SemanticColors {
  text: {
    primary: SemanticColorValue;
    secondary: SemanticColorValue;
    disabled: SemanticColorValue;
    inverse: SemanticColorValue;
  };
  bg: {
    canvas: SemanticColorValue;
    surface: SemanticColorValue;
    subtle: SemanticColorValue;
    inverse: SemanticColorValue;
  };
  border: {
    default: SemanticColorValue;
    muted: SemanticColorValue;
    focus: SemanticColorValue;
  };
  intent: {
    primary: SemanticColorValue;
    secondary?: SemanticColorValue;
    onPrimary?: SemanticColorValue;
    onSecondary?: SemanticColorValue;
    success: SemanticColorValue;
    warning: SemanticColorValue;
    error: SemanticColorValue;
  };
}

export interface TypographyComposite {
  fontFamily: TokenValue;
  fontSize: TokenValue;
  fontWeight: TokenValue;
  lineHeight: TokenValue;
  letterSpacing: TokenValue;
}

export interface SemanticTypography {
  heading: {
    h1: TypographyComposite;
    h2: TypographyComposite;
    h3: TypographyComposite;
  };
  body: {
    base: TypographyComposite;
    sm: TypographyComposite;
  };
  caption: TypographyComposite;
  label: TypographyComposite;
}

export interface SemanticShadow {
  x: TokenValue;
  y: TokenValue;
  blur: TokenValue;
  spread: TokenValue;
  color: TokenValue;
}

export interface SemanticTokens {
  colors: SemanticColors;
  typography: SemanticTypography;
  shadow: {
    none: SemanticShadow;
    sm: SemanticShadow;
    md: SemanticShadow;
    lg: SemanticShadow;
  };
  motion: {
    duration: Record<string, TokenValue>;
    easing: Record<string, TokenValue>;
  };
  opacity: {
    disabled: TokenValue;
    subtle: TokenValue;
    overlay: TokenValue;
  };
  zIndex: Record<string, TokenValue>;
}

// --- 3. Component Tokens ---

export interface ButtonTokens {
  bg: {
    default: SemanticColorValue; // References semantic color (which has light/dark)
    hover: SemanticColorValue;
    active: SemanticColorValue;
    disabled: SemanticColorValue;
  };
  text: {
    default: SemanticColorValue;
  };
  radius: TokenValue;
  padding: {
    x: TokenValue;
    y: TokenValue;
  };
}

export interface ComponentTokens {
  button: ButtonTokens;
}

// --- Root System ---

export interface DesignTokenSettings {
  baseFontSize: string;
}

export interface DesignTokenSystem {
  settings: DesignTokenSettings;
  generation?: Partial<Record<GenerationCategory, GenerationResult>>;
  foundation: FoundationTokens;
  semantic: SemanticTokens;
  components: ComponentTokens;
}
