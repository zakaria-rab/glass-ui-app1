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
- **No `basePath`.** The shell rewrites `/apps/<slug>/*` to this app's
  deployment and *strips* the prefix, so the app is served at `/` on its own
  origin and a base path would 404 every route. `assetPrefix` is the exception
  and is required: the HTML arrives from the shell's origin, where a
  root-relative `/_next/...` resolves against the shell and every asset 404s.
  See the comment in `next.config.ts`.
- **No Vercel Microfrontends.** Do not add `@vercel/microfrontends` and do not
  add `rewrites()`. Composition is a plain iframe by URL; that keeps per-PR
  previews without per-project routing fees. Multi-Zones is a possible future
  migration only if same-origin paths are actually needed — not preemptively.
- **Stay embeddable.** Never send `X-Frame-Options` and never add a
  `frame-ancestors` CSP. If a CSP is ever added, it must allow the shell origin.
- **Data goes through GraphQL.** This app owns its own boundary at
  `/api/graphql` (graphql-yoga), the same shape as the shell's: SDL in
  `src/graphql/schema.ts`, resolvers in `src/graphql/resolvers.ts`, JSON in
  `src/graphql/mocks/`. Components call `gql()` from `src/lib/graphql-client.ts`
  and nothing else — it executes in-process on the server and POSTs from the
  browser, so callers cannot tell which. No REST, no direct `fetch` to other
  services, no hardcoded data in components. To add data: schema first, then
  resolver, then mock.
- **Mutable state is in memory, seeded from JSON, never written back.** Vercel
  function filesystems are read-only outside `/tmp`, so writing to
  `src/graphql/mocks/` works locally and 500s on every mutation in production
  while reads keep succeeding — the app looks healthy. Pin such state to a
  `globalThis` key, not module scope: Next builds the route handler and the page
  as separate server module graphs, so a module-scope `const` is evaluated once
  per graph and you get two independent stores. Pin *every* piece of state the
  graphs must agree on, not just the list.
- **Pages that query on the server call `await connection()` first,** so data is
  read at request time instead of frozen into the build. Not
  `export const dynamic`, which is segment config and rules out partial
  prerendering for every app stamped from this template.
- **Self-contained styling.** Minimal CSS variables in `src/app/globals.css`,
  Inter via `next/font/google`. The shell owns the brand; `--oj-accent` is a
  placeholder to be replaced with a real Overjet design-system token.
- **No new dependencies** beyond what is already here — the GraphQL boundary
  (`graphql`, `graphql-yoga`, pinned to the same majors as the shell), flags
  (`@flagsmith/flagsmith`) and analytics (`@vercel/analytics`) — and no UI
  libraries (no Tailwind, shadcn, MUI, Ant).

## Commands

| Command       | What it does                                  |
| ------------- | --------------------------------------------- |
| `pnpm install`| Install dependencies                          |
| `pnpm dev`    | Dev server on http://localhost:3001           |
| `pnpm build`  | Production build                              |
| `pnpm lint`   | ESLint (`eslint-config-next`)                 |
| `pnpm test`   | Store and validation checks (`node:test`)     |

Run `pnpm lint`, `pnpm test` and `pnpm build` before opening a PR, and attach a screenshot of
any changed page.
