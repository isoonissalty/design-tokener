# Agent guidance

Design Token Builder is a Next.js/React app for editing, previewing, and exporting Tailwind themes built from foundation, semantic, and component tokens.

## Environment and commands

Use npm with the committed `package-lock.json`. Node.js 24 is recommended; the test loader requires Node.js 22.15+ on the Node.js 22 release line.

- Install dependencies: `npm ci`.
- Start development: `npm run dev`.
- Check code changes: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.

Development and production builds fetch Geist fonts through Next.js and need access to Google Fonts. For documentation-only changes, check links, commands, and examples; application checks are unnecessary.

## Read as needed

- [README.md](README.md): product workflows, token model, import/export, and browser storage behavior.
- [Code navigation](CONTRIBUTING.md#find-the-relevant-code): where to find the relevant implementation.
- [Making changes](CONTRIBUTING.md#make-changes): coding conventions and token, history, generation, and persistence invariants.
- [Verification](CONTRIBUTING.md#verify-your-change): regression tests, browser checks, and dependency audits.
