import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import type { NextConfig } from "next";

/**
 * A microfrontend in the Glass UI group.
 *
 * `withMicrofrontends` is what makes this app servable under the shell's
 * domain: it generates the `vc-ap-*` asset prefix so this app's `/_next/*`
 * URLs cannot collide with the shell's or with another app's. That replaced a
 * hand-written `assetPrefix` derived from VERCEL_URL — the same problem, solved
 * by the platform instead of by us.
 *
 * The build command matters as much as this file. In a polyrepo the
 * authoritative `microfrontends.json` lives in the default application, so this
 * app pulls it at build time: `vercel microfrontends pull && next build`. A
 * build that cannot find the config fails outright rather than degrading, which
 * is why it is in vercel.json rather than left to whoever sets the project up.
 *
 * Still no `basePath`: routing strips nothing, the shell forwards
 * `/apps/<slug>/*` and this app answers on those paths through the group.
 * Still no `X-Frame-Options` or `frame-ancestors` — the shell embeds this app.
 */
const nextConfig: NextConfig = {
  /**
   * Microfrontends forwards a matched path to this app unchanged — it does not
   * strip the prefix. An app routed at /apps/<slug> must therefore serve
   * /apps/<slug>, or every request arriving through the group answers 404
   * while the app works perfectly at its own URL. The 404 page even carries
   * this app's asset prefix, which makes it read as a routing fault.
   *
   * Provisioning rewrites this value to the app's own slug when it stamps a
   * repository. See rename-app.ts in the shell.
   */
  basePath: "/apps/app1",
};

export default withMicrofrontends(nextConfig);
