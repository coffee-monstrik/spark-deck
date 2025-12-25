# Copilot / AI Agent Instructions — spark-deck

Short, actionable guidance for AI code assistants working in this repository.

## Big picture
- This is a small Next.js app using the App Router (app/ directory) with React + TypeScript. The app uses Next 16 and React 19.
- Styles are implemented with Tailwind CSS (v4) via PostCSS plugin and a small `globals.css` containing CSS variables and a dark-mode theme.
- Fonts: Google fonts are loaded via `next/font` in `app/layout.tsx` and exposed as CSS variables (e.g., `--font-geist-sans`).
- Static assets live in `public/` and are referenced with `next/image` in components (see `app/page.tsx`).

## Where to look first (key files)
- `app/layout.tsx` — root layout and font usage (server component by default).
- `app/page.tsx` — example page using `next/image`, Tailwind utility classes, and links for docs/deploy.
- `app/globals.css` — global CSS variables, theme rules, and Tailwind import.
- `package.json` — `dev`, `build`, `start`, `lint` scripts.
- `eslint.config.mjs` and `tsconfig.json` — linting and TypeScript strict settings to follow.

## Conventions & patterns (follow these exactly)
- App Router semantics: files in `app/` are **Server Components by default**; opt into client components with the top-line directive `"use client"`.
- Prefer Tailwind utility classes for styling; `globals.css` contains the global theme variables—modify it only for global concerns.
- When adding fonts, follow the `next/font` pattern and set `variable` options so existing CSS variables continue to work (see `app/layout.tsx`).
- Image assets should go into `public/`. Use `next/image` with explicit `width`/`height` or `fill` and `priority` when appropriate (see `app/page.tsx`).
- TypeScript is strict (`"strict": true` in `tsconfig.json`) — add typings and prefer explicit types for exported components and functions.
- Use project ESLint configuration (`eslint.config.mjs`); run `npm run lint` and prefer `--fix` locally when safe.

## Build / dev / test / debug workflows
- Dev server: `npm run dev` (supports `npm`/`pnpm`/`yarn`/`bun`).
- Build for production: `npm run build` then `npm run start` (server). For Vercel deploys, standard Next/Vercel flow applies.
- Lint: `npm run lint` (runs `eslint` per project config). No test runner is configured in the repository.
- If you add a new dev dependency, update `package.json` and ensure `npm run build` still succeeds locally.

## Pull request guidance for AI edits
- Keep changes focused and incremental: update one logical area per PR (styling, layout, route, or API). Update README only when behavior or developer workflow changes.
- Preserve app-router server/client boundaries: don't add `"use client"` unless the component needs state/hooks/events.
- Ensure TypeScript still compiles (`tsc`) and `npm run build` passes before proposing changes.
- When adding or modifying global styles, prefer changing `app/globals.css` rather than scattering global rules in components.

## Examples (copyable snippets)
- Mark client component when adding interactivity:

  ```tsx
  "use client";
  import React from "react";

  export default function MyButton() {
    return <button onClick={() => alert("clicked")}>Click</button>;
  }
  ```

- Add an image asset and reference it:

  1. Put `logo.svg` in `/public`.
  2. Use it in a component: `import Image from 'next/image';` then `<Image src="/logo.svg" width={64} height={64} alt="logo" />`.

## What NOT to change without explicit review
- `eslint.config.mjs` and `tsconfig.json` rule sets (they control CI/linting expectations and TypeScript strictness).
- The semantic structure of `app/` routes (don't rename routes without updating links/redirects).

## Missing but useful context (ask the maintainer)
- Preferred Node.js engine or version for CI. (Not declared in `package.json`.)
- Any tests / CI steps the project expects (no CI config found).
- Branching or release process (no `CONTRIBUTING.md` or `RELEASE.md` present).

---
If any part of this is unclear or you want more details (examples for component patterns, test recommendations, or CI setup), tell me which area to expand and I will iterate. ✅