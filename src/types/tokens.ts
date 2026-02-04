export type DesignTokens = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
    container: number;
  };
  typography: {
    h1: number;
    h2: number;
    body: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
};

export const defaultTokens: DesignTokens = {
  colors: {
    primary: "#3b82f6", // blue-500
    secondary: "#64748b", // slate-500
    background: "#ffffff",
    text: "#0f172a", // slate-900
  },
  spacing: {
    small: 4,
    medium: 16,
    large: 32,
    container: 128,
  },
  typography: {
    h1: 48,
    h2: 30,
    body: 16,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
};
