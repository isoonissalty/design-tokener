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

- **Templates:** apply one of eight complete starting themes. Each includes both color modes, typography, spacing, and button styles.
- **Palette:** choose a hex seed and palette name to generate shades 50–950. Shade 500 retains your seed. Optionally apply the palette to primary colors, focus rings, and buttons. The generator chooses button tones and foregrounds with at least 4.5:1 contrast.
- **Tokens:** edit individual foundation and semantic values. Generated palettes appear under Foundation → Colors.
- **Components:** customize button colors, interaction states, radius, and padding. Other listed components inherit the global tokens.
- **Preview:** select a layout, toggle light/dark mode, or open the full screen preview. Dashboard and pricing controls can be tried interactively.

Template, palette, import, reset, and saved-theme restoration are undoable. Undo/redo retains up to 100 changes. Ctrl/⌘ Z and Ctrl/⌘ Shift Z work outside text inputs. Save and restore use this browser's local storage; use JSON export to keep a portable copy.

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

