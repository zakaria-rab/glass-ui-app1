import type { NextConfig } from "next";

/**
 * Serve this app's assets from an absolute URL, and nothing else.
 *
 * The shell serves every app under its own domain, rewriting
 * `/apps/<slug>/*` to this app's deployment. That delivers this app's HTML
 * from the shell's origin — at which point a root-relative `/_next/...` in
 * that HTML resolves against the *shell*, which has no such chunk, and every
 * script and stylesheet 404s. The page arrives unstyled and dead. Verified:
 * 404 through the shell, 200 on this app's own origin.
 *
 * `assetPrefix` makes those references absolute, so they load from wherever
 * this deployment lives no matter which origin served the HTML. Vercel's own
 * Microfrontends product does this for you with a generated `vc-ap-*` prefix;
 * we are doing Multi-Zones by hand, so we do it by hand.
 *
 * Derived from `VERCEL_URL` rather than written down, so every app and every
 * preview references its own assets with nothing to configure per app. Unset
 * locally, where the app is served from its own origin anyway.
 *
 * Still no `basePath` — the app is served at `/` on its own origin, and a base
 * path would break that. Still no `X-Frame-Options` or `frame-ancestors`: the
 * shell embeds this app, so it must stay embeddable.
 */
const nextConfig: NextConfig = {
  assetPrefix: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
};

export default nextConfig;
