# Design Token Builder

A token editor with light/dark previews and CSS/Tailwind export.

## Generators

Open **Generate** in the sidebar, or open a foundation category and select **Generate**. Preview the result, inspect **Why these values?**, then apply it. Each application is one Undo/Redo step and preserves other foundation tokens.

- **Palette:** OKLCH, HSL, or encoded sRGB tint/shade ramps. Pick primary and secondary colors independently, or derive a secondary with a complementary, analogous, or triadic relationship. Both seeds remain exact at shade 500. The ramp weights and hue rotations are application recipes based on [W3C color models](https://www.w3.org/TR/css-color-4/) and [color harmony concepts](https://color.adobe.com/create/color-wheel).
- **Spacing:** adjustable 4px or 8px grids, or the published [Carbon spacing scale](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview).
- **Radius:** adjustable [Tailwind v3](https://v3.tailwindcss.com/docs/border-radius) or [Material Web v0_192](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-shape.scss) presets; zero and full rounding stay fixed.
- **Sizing:** adjustable content widths based on [Tailwind v3 max-widths](https://v3.tailwindcss.com/docs/max-width), with an independent container width.

Each token includes its calculation and linked sources. Dimension generators support px/rem output using the pixel root size in **Tokens → Settings**. Saved configurations preserve generation references; exported CSS includes them as comments. Manually edited values are identified separately from their original generated rationale.

Run `npm test`, `npm run lint`, and `npx tsc --noEmit` for validation, and `npm run build` for the production build.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
