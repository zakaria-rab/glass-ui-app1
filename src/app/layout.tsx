import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { getServerFlags } from "@/lib/flags";

import { FlagsProvider } from "./flags-provider";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "glass-ui-app1",
  description: "A standalone Glass UI app, embedded by the Glass UI shell.",
};

/**
 * Flags are request-time data, not build-time. Without this the layout's flag
 * read is evaluated once during `next build` and baked into a prerendered
 * page, so flipping a flag in Flagsmith would change nothing until the next
 * deploy — which is not a feature flag.
 *
 * ponytail: force-dynamic on the root layout costs this app static rendering
 * wholesale. If an app ever needs the static path back, drop the provider from
 * the layout and read flags per route instead.
 */
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const flags = await getServerFlags();

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <FlagsProvider serverState={flags.state}>{children}</FlagsProvider>
        {/* Page views for this app, reported to this app's own Vercel project.
            It stays useful when the app is opened inside the Glass UI shell:
            the shell counts its own routes, this counts this app. First-party,
            no cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
