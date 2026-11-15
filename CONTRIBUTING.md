# Contributing to Design Token Builder

Thanks for helping improve the editor, generators, previews, and theme exports. Read the [README](README.md) for the current features and workflows before making changes.

## Report an issue or propose a feature

Check the [existing issues](https://github.com/isoonissalty/design-tokener/issues) first. For a bug, include the steps to reproduce, expected and actual behavior, browser and Node.js versions, and a screenshot or small theme JSON/CSS example when useful. Remove private information from shared files.

For a feature, describe the design task it would support and the behavior you expect. Discuss larger changes in an issue before investing in an implementation.

## Set up locally

Use Node.js 26.13.1 (stable LTS), pinned in `.nvmrc` and `.node-version`, with npm and the committed `package-lock.json`. The setup below assumes [nvm](https://github.com/nvm-sh/nvm) is installed; other version managers should select the same Node.js version.

1. Fork the [repository](https://github.com/isoonissalty/design-tokener) on GitHub.
2. Clone your fork, replacing `YOUR-USERNAME` below, and create a branch for your change:

   ```bash
   git clone https://github.com/YOUR-USERNAME/design-tokener.git
   cd design-tokener
   nvm install
   nvm use
   git switch -c describe-your-change
   npm ci
   npm run dev
   ```

3. Open [localhost:3000](http://localhost:3000). No API keys or database setup are required for the current application.

The development server and production build fetch Geist fonts through Next.js, so they need access to Google Fonts. Saved themes and templates use browser local storage; export JSON before clearing browser data if you need to keep your work.

## Find the relevant code

| Path | Purpose |
| --- | --- |
| `src/app/` | Next.js App Router entry points, layout, and global styles. |
| `src/components/editor/` | Token editors, generators, and template controls. |
| `src/components/preview/` | Live preview and its layouts. |
| `src/components/ui/` | Shared UI primitives. |
| `src/types/` | Token system and generation result types. |
| `src/lib/` | Defaults, color and scale generation, reference resolution, import/export, and saved-template helpers. |
| `src/store/` | Redux store, typed hooks, theme history, templates, and UI state. |
| `tests/` | Node.js tests for generators, state, templates, and import/export. |

## Make changes

- Follow the surrounding TypeScript and React conventions. Use the existing `@/` alias for imports from `src/`, typed Redux hooks, and shared UI primitives where appropriate. TypeScript strict mode and the Next.js ESLint configuration are enabled.
- Keep generation, validation, and export logic in `src/lib/` where it can be exercised independently of the UI. Keep browser APIs in client code or guard access appropriately.
- Preserve the foundation → semantic → component token model, light/dark values, and token references when changing theme behavior. Route theme edits through the existing Redux actions so undo/redo remains consistent.
- Treat applied generations as one undoable change and saved templates as independent snapshots. Preserve unrelated tokens, generation metadata, and existing imports/exports unless the change explicitly addresses those behaviors.
- For new generation methods, include the formula, parameters, and source references represented by the existing generation types. Update export handling and documentation when the output changes.
- Keep changes focused. Include `package-lock.json` when changing dependencies, and avoid committing generated output, local storage dumps, or secrets.

## Verify your change

Run the checks from the repository root:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

`npm test` runs the Node.js test runner with the repository's TypeScript loaders for both `.test.mjs` and `.test.cjs` files. For behavior changes, add or update a focused regression test using the existing `node:test` and `node:assert/strict` patterns. Cover observable results and relevant edge cases, such as invalid input, alias resolution, both color modes, or undo/redo. Documentation-only changes can be checked by reviewing links, commands, and examples without running the application suite.

For UI changes, also check the affected workflow in the browser at desktop and narrow widths, in light and dark mode, and with keyboard navigation. For token or generator changes, verify the edited/generated values in the preview and exported files. If persistence is affected, verify save/restore after a reload. To test the production server after a successful build, run `npm start`.

Check dependency changes with:

```bash
npm audit --include=dev --audit-level=low
```

## Open a pull request

Push your branch to your fork and open a pull request against the upstream repository. Explain the problem, the resulting behavior, and how you verified it. Link any related issue, include screenshots for visible changes, and update the README or other documentation when a workflow changes. Report any checks you could not run and why.

## License

By submitting a contribution, you agree that it will be licensed under the project's [MIT License](LICENSE).
