# Design Token Builder

Build a Tailwind theme from editable foundation, semantic, and component tokens. Preview the result in light and dark mode across landing page, dashboard, and pricing layouts.

## Run locally

Requires Node.js 22.15+ (Node.js 24 recommended).

```bash
npm ci
npm run dev
```

Open http://localhost:3000. The editor and preview resize side by side on desktop and stack vertically on smaller screens.

## Create and refine a theme

- **Templates:** see the current theme, save it under a name, or apply one of eight complete starting themes. Your templates persist in this browser and include every token, both color modes, typography, spacing, and button styles. Editing or applying another theme keeps saved templates intact.
- **Generate:** build color palettes, spacing, corner radius, and content sizing. Color generation supports OKLCH, HSL, or encoded sRGB, with independent primary and secondary colors, named palettes, and optional harmony relationships. Generator drafts stay in place when switching tabs.
- **Tokens:** edit individual foundation and semantic values. After applying generated values, use **Edit applied tokens** to open the matching Foundation category. Generated color palettes appear expanded at the top of Colors. Use **Save as template** to name and save the full applied theme and its generation recipes in Templates.
- **Components:** customize button colors, interaction states, radius, and padding. Other listed components inherit the global tokens.
- **Preview:** select a layout, toggle light/dark mode, or open the full screen preview. Dashboard and pricing controls can be tried interactively.

Template, palette, import, reset, and saved-theme restoration are undoable. Undo/redo retains up to 100 changes. Ctrl/⌘ Z and Ctrl/⌘ Shift Z work outside text inputs. Save and restore use this browser's local storage; use JSON export to keep a portable copy.

## Generated values and references

Open **Generate**, choose a method, inspect the preview and **Why these values?**, then apply. Every generated token includes its formula and linked sources. Each application is one undoable change and preserves other foundation tokens.

- **Palette:** both chosen colors stay exact at shade 500. Ramp weights and hue rotations are application recipes informed by [W3C color models](https://www.w3.org/TR/css-color-4/) and [color harmony concepts](https://color.adobe.com/create/color-wheel).
- **Spacing:** adjustable 4px or 8px grids, or the published [Carbon spacing scale](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview).
- **Radius:** adjustable [Tailwind v3](https://v3.tailwindcss.com/docs/border-radius) or [Material Web v0_192](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-shape.scss) presets. Zero and full rounding stay fixed.
- **Sizing:** adjustable content widths based on [Tailwind v3 max-widths](https://v3.tailwindcss.com/docs/max-width), with an independent container width.

Dimension generators support px/rem output using the root size in **Tokens → Settings**. Saved configurations and JSON exports preserve generation references; exported CSS includes them as comments. Manually edited values and subsequent root-size changes are distinguished from the original recipe.

## Import and export

**Import Theme** accepts a `.json`/`.css` file or pasted text. JSON restores the full token system. CSS merges recognized `:root`, `.dark`, and Tailwind `@theme` declarations into the current theme. Hex, HSL, RGB, and modern CSS color values remain editable. JavaScript configuration imports are not executed; use CSS or JSON instead.

**Export Theme** offers a code preview, copy, and download:

| Format | Usage |
| --- | --- |
| Tailwind CSS v4 | Use `theme.css` as your Tailwind stylesheet. It includes the Tailwind import, utility mappings, and dark variant. |
| Tailwind CSS v3 | Download both `theme.css` and `tailwind.config.cjs`. Import the CSS alongside your Tailwind directives and use the config's theme mappings. |
| JSON | Includes every token and both modes for exact restoration and further editing. |
| DESIGN.md | A self-contained design contract with the current tokens, both color modes, and usage guidance. Preview, copy, or download it for your project. |

The DESIGN.md export follows the Google DESIGN.md alpha format and its standard eight sections. It includes configured colors, typography, spacing, corner radii, and button states in YAML. Shadows, motion, sizing, borders, opacity, and layer order are documented in prose because the alpha schema has no fields for them. The document distinguishes observed values from proposed guidance and reports unresolved references. Product context and accessibility checks still need verification. Re-export after editing tokens to keep the contract current.

CSS imports update supported matching variables and retain the other tokens. JSON is the format for lossless backups. Review import errors in the dialog; an invalid import leaves the current theme intact.

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The Node test suite covers token reference generation, color preservation, palette/contrast behavior, immutable templates, import/export (including DESIGN.md structure and alias resolution), and undo/redo history. Production startup uses `npm start`. The build fetches Geist fonts through Next.js.

## Dependency security

Run `npm ci` to install the audited lockfile and `npm audit --include=dev --audit-level=low` to check both runtime and development dependencies at every severity.

The scoped `@typescript-eslint/typescript-estree` override keeps its `minimatch` dependency on a patched 11.x release for [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Remove the override when the upstream parser uses a patched version in its own dependency range.
