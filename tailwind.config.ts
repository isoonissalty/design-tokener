import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	extend: {
		colors: {
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			primary: {
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))'
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			}
		},
        spacing: {
            '0': 'var(--space-0)',
            '1': 'var(--space-1)',
            '2': 'var(--space-2)',
            '3': 'var(--space-3)',
            '4': 'var(--space-4)',
            '6': 'var(--space-6)',
            '8': 'var(--space-8)',
        },
        fontSize: {
            xs: 'var(--font-size-xs)',
            sm: 'var(--font-size-sm)',
            base: 'var(--font-size-base)',
            lg: 'var(--font-size-lg)',
            xl: 'var(--font-size-xl)',
        },
        fontFamily: {
            sans: 'var(--font-family-sans)',
            serif: 'var(--font-family-serif)',
            mono: 'var(--font-family-mono)',
        },
        fontWeight: {
            normal: 'var(--font-weight-regular)',
            medium: 'var(--font-weight-medium)',
            bold: 'var(--font-weight-bold)',
        },
        lineHeight: {
            tight: 'var(--line-height-tight)',
            normal: 'var(--line-height-normal)',
            relaxed: 'var(--line-height-relaxed)',
        },
        letterSpacing: {
            tight: 'var(--letter-spacing-tight)',
            normal: 'var(--letter-spacing-normal)',
            wide: 'var(--letter-spacing-wide)',
        },
		borderRadius: {
            none: 'var(--radius-none)',
			sm: 'var(--radius-sm)',
            DEFAULT: 'var(--radius-md)',
            md: 'var(--radius-md)',
			lg: 'var(--radius-lg)',
            full: 'var(--radius-full)',
		},
        borderWidth: {
            DEFAULT: 'var(--border-width-1)',
            '0': 'var(--border-width-0)',
            '1': 'var(--border-width-1)',
            '2': 'var(--border-width-2)',
        },
        width: {
             xs: "var(--size-xs)",
             sm: "var(--size-sm)",
             md: "var(--size-md)",
             lg: "var(--size-lg)",
             xl: "var(--size-xl)",
             container: "var(--size-container)",
        },
        maxWidth: {
             xs: "var(--size-xs)",
             sm: "var(--size-sm)",
             md: "var(--size-md)",
             lg: "var(--size-lg)",
             xl: "var(--size-xl)",
             container: "var(--size-container)",
        }
	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
