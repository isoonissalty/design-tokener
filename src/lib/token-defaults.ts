import { DesignTokenSystem } from "@/types/token-system";

export const defaultDesignTokens: DesignTokenSystem = {
  foundation: {
    colors: {
      gray: {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        "200": "#e5e7eb",
        "300": "#d1d5db",
        "400": "#9ca3af",
        "500": "#6b7280",
        "600": "#4b5563",
        "700": "#374151",
        "800": "#1f2937",
        "900": "#111827",
        "950": "#030712",
      },
      blue: {
        "50": "#eff6ff",
        "100": "#dbeafe",
        "200": "#bfdbfe",
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8",
        "800": "#1e40af",
        "900": "#1e3a8a",
        "950": "#172554",
      },
      white: {
        DEFAULT: "#ffffff",
      },
      black: {
        DEFAULT: "#000000",
      },
      red: {
          "500": "#ef4444",
          "600": "#dc2626",
      },
       green: {
          "500": "#22c55e",
          "600": "#16a34a",
      },
       yellow: {
          "500": "#eab308",
          "600": "#ca8a04",
      }
    },
    typography: {
      family: {
        sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
        mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      },
      size: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
      },
      weight: {
        regular: "400",
        medium: "500",
        bold: "700",
      },
      lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75",
      },
      letterSpacing: {
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
      },
    },
    spacing: {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "6": "1.5rem",
      "8": "2rem",
    },
    sizing: {
      xs: "20rem",
      sm: "24rem",
      md: "28rem",
      lg: "32rem",
      xl: "36rem",
      container: "80rem",
    },
    radius: {
      none: "0px",
      sm: "0.125rem",
      md: "0.375rem",
      lg: "0.5rem",
      full: "9999px",
    },
    borderWidth: {
      "0": "0px",
      "1": "1px",
      "2": "2px",
    },
  },
  semantic: {
    colors: {
      text: {
        primary: { light: "{color.gray.900}", dark: "{color.gray.50}" },
        secondary: { light: "{color.gray.500}", dark: "{color.gray.400}" },
        disabled: { light: "{color.gray.400}", dark: "{color.gray.600}" },
        inverse: { light: "{color.gray.50}", dark: "{color.gray.900}" },
      },
      bg: {
        canvas: { light: "{color.white.DEFAULT}", dark: "{color.gray.950}" },
        surface: { light: "{color.white.DEFAULT}", dark: "{color.gray.900}" },
        subtle: { light: "{color.gray.50}", dark: "{color.gray.800}" },
        inverse: { light: "{color.gray.900}", dark: "{color.gray.50}" },
      },
      border: {
        default: { light: "{color.gray.200}", dark: "{color.gray.800}" },
        muted: { light: "{color.gray.100}", dark: "{color.gray.800}" },
        focus: { light: "{color.blue.500}", dark: "{color.blue.400}" },
      },
      intent: {
        primary: { light: "{color.blue.600}", dark: "{color.blue.500}" },
        success: { light: "{color.green.600}", dark: "{color.green.500}" },
        warning: { light: "{color.yellow.600}", dark: "{color.yellow.500}" },
        error: { light: "{color.red.600}", dark: "{color.red.500}" },
      },
    },
    typography: {
      heading: {
        h1: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.xl}",
          fontWeight: "{font.weight.bold}",
          lineHeight: "{line.height.tight}",
          letterSpacing: "{letter.spacing.tight}",
        },
        h2: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.lg}",
          fontWeight: "{font.weight.bold}",
          lineHeight: "{line.height.tight}",
          letterSpacing: "{letter.spacing.tight}",
        },
        h3: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.base}",
          fontWeight: "{font.weight.bold}",
          lineHeight: "{line.height.tight}",
          letterSpacing: "{letter.spacing.normal}",
        },
      },
      body: {
        base: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.base}",
          fontWeight: "{font.weight.regular}",
          lineHeight: "{line.height.normal}",
          letterSpacing: "{letter.spacing.normal}",
        },
        sm: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.sm}",
          fontWeight: "{font.weight.regular}",
          lineHeight: "{line.height.normal}",
          letterSpacing: "{letter.spacing.normal}",
        },
      },
      caption: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.xs}",
          fontWeight: "{font.weight.regular}",
          lineHeight: "{line.height.normal}",
          letterSpacing: "{letter.spacing.wide}",
      },
      label: {
          fontFamily: "{font.family.sans}",
          fontSize: "{font.size.sm}",
          fontWeight: "{font.weight.medium}",
          lineHeight: "{line.height.normal}",
          letterSpacing: "{letter.spacing.wide}",
      }
    },
    shadow: {
      none: { x: "0", y: "0", blur: "0", spread: "0", color: "transparent" },
      sm: { x: "0", y: "1px", blur: "2px", spread: "0", color: "rgba(0,0,0,0.05)" },
      md: { x: "0", y: "4px", blur: "6px", spread: "-1px", color: "rgba(0,0,0,0.1)" },
      lg: { x: "0", y: "10px", blur: "15px", spread: "-3px", color: "rgba(0,0,0,0.1)" },
    },
    motion: {
      duration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      easing: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    opacity: {
      disabled: "0.5",
      subtle: "0.7",
      overlay: "0.8",
    },
    zIndex: {
      base: "0",
      dropdown: "1000",
      sticky: "1100",
      modal: "1300",
      toast: "1400",
      tooltip: "1500",
    },
  },
  components: {
    button: {
      bg: {
        default: { light: "{color.intent.primary.light}", dark: "{color.intent.primary.dark}" }, // Or reference semantic intent directly
        hover: { light: "{color.blue.700}", dark: "{color.blue.400}" }, // Example override
        active: { light: "{color.blue.800}", dark: "{color.blue.600}" },
        disabled: { light: "{color.gray.300}", dark: "{color.gray.700}" },
      },
      text: {
        default: { light: "{color.white.DEFAULT}", dark: "{color.white.DEFAULT}" },
      },
      radius: "{radius.md}",
      padding: {
        x: "{space.4}",
        y: "{space.2}",
      },
    },
  },
};
