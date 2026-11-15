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
			background: 'color-mix(in srgb, var(--background) calc(<alpha-value> * 100%), transparent)',
			foreground: 'color-mix(in srgb, var(--foreground) calc(<alpha-value> * 100%), transparent)',
			card: {
				DEFAULT: 'color-mix(in srgb, var(--card) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--card-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			popover: {
				DEFAULT: 'color-mix(in srgb, var(--popover) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--popover-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			primary: {
				DEFAULT: 'color-mix(in srgb, var(--primary) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--primary-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			secondary: {
				DEFAULT: 'color-mix(in srgb, var(--secondary) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--secondary-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			muted: {
				DEFAULT: 'color-mix(in srgb, var(--muted) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--muted-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			accent: {
				DEFAULT: 'color-mix(in srgb, var(--accent) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--accent-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			destructive: {
				DEFAULT: 'color-mix(in srgb, var(--destructive) calc(<alpha-value> * 100%), transparent)',
				foreground: 'color-mix(in srgb, var(--destructive-foreground) calc(<alpha-value> * 100%), transparent)'
			},
			border: 'color-mix(in srgb, var(--border) calc(<alpha-value> * 100%), transparent)',
			input: 'color-mix(in srgb, var(--input) calc(<alpha-value> * 100%), transparent)',
			ring: 'color-mix(in srgb, var(--ring) calc(<alpha-value> * 100%), transparent)',
			chart: {
				'1': 'color-mix(in srgb, var(--chart-1) calc(<alpha-value> * 100%), transparent)',
				'2': 'color-mix(in srgb, var(--chart-2) calc(<alpha-value> * 100%), transparent)',
				'3': 'color-mix(in srgb, var(--chart-3) calc(<alpha-value> * 100%), transparent)',
				'4': 'color-mix(in srgb, var(--chart-4) calc(<alpha-value> * 100%), transparent)',
				'5': 'color-mix(in srgb, var(--chart-5) calc(<alpha-value> * 100%), transparent)'
			}
		},
        boxShadow: {
            none: 'var(--shadow-none, 0 0 #0000)',
            sm: 'var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
            DEFAULT: 'var(--shadow-md, 0 1px 3px 0 rgb(0 0 0 / 0.1))',
            md: 'var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
            lg: 'var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))',
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
