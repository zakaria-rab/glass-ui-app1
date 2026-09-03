# CLAUDE.md

## Purpose

`glass-ui-app1` is a **standalone Glass UI app**. Glass UI is Overjet's internal
apps portal: the shell (`overjetdental/glass-ui-framework`) owns the left nav,
the prompt UI and the marketplace, and each `glass-ui-<name>` repo is its own
GitHub repo with its own Vercel project, deployments and PR previews.

The shell **embeds this app in an iframe** pointed at this app's own production
URL (held in the shell's app registry, overridable per-environment with an env
var such as `NEXT_PUBLIC_APP1_URL`). This app therefore has to stand on its own:
it must look and behave correctly opened directly at its Vercel URL, and render
identically inside the shell's center pane.

This repo is also the **template** other Glass UI apps are created from.

## Rules

- **Works standalone and in an iframe.** Every change must be correct at this
  app's own URL *and* when embedded by the shell.
- **No `basePath`, no `assetPrefix`.** The page is served at `/`.
- **No Vercel Microfrontends.** Do not add `@vercel/microfrontends` and do not
  add `rewrites()`. Composition is a plain iframe by URL; that keeps per-PR
  previews without per-project routing fees. Multi-Zones is a possible future
  migration only if same-origin paths are actually needed — not preemptively.
- **Stay embeddable.** Never send `X-Frame-Options` and never add a
  `frame-ancestors` CSP. If a CSP is ever added, it must allow the shell origin.
- **Data goes through GraphQL.** Any future data access happens through the
  shell's GraphQL endpoint (`/api/graphql`, backed by mocks in the shell's
  `src/graphql/mocks/`). No REST, no direct `fetch` to other services, no
  hardcoded data in components. **There is no data access yet** — this app is
  presentational today.
- **Self-contained styling.** Minimal CSS variables in `src/app/globals.css`,
  Inter via `next/font/google`. The shell owns the brand; `--oj-accent` is a
  placeholder to be replaced with a real Overjet design-system token.
- **No new dependencies** and no UI libraries (no Tailwind, shadcn, MUI, Ant).

## Commands

| Command       | What it does                                  |
| ------------- | --------------------------------------------- |
| `pnpm install`| Install dependencies                          |
| `pnpm dev`    | Dev server on http://localhost:3001           |
| `pnpm build`  | Production build                              |
| `pnpm lint`   | ESLint (`eslint-config-next`)                 |

Run `pnpm lint` and `pnpm build` before opening a PR, and attach a screenshot of
any changed page.
