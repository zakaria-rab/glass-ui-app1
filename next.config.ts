import type { NextConfig } from "next";

/**
 * Intentionally empty.
 *
 * glass-ui-app1 is a standalone app on its own Vercel project. The Glass UI
 * shell embeds it in an iframe pointed at this app's own URL, so:
 *   - no `basePath` and no `assetPrefix` (the app is served at `/`),
 *   - no `rewrites()` (we do not use Vercel Microfrontends or Multi-Zones),
 *   - no `X-Frame-Options` and no `frame-ancestors` CSP (it must be embeddable).
 */
const nextConfig: NextConfig = {};

export default nextConfig;
