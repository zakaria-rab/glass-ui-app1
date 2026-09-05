import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { connection } from "next/server";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Flags are request-time data, not build-time: without this the read is
  // evaluated once during `next build` and baked into a prerendered page, so
  // flipping a flag in Flagsmith would change nothing until the next deploy,
  // which is not a feature flag.
  //
  // `connection()` rather than `export const dynamic = "force-dynamic"`. It is
  // the shell's convention for exactly this (its CLAUDE.md: "pages that query
  // on the server call `await connection()` first, so the registry is read at
  // request time instead of being frozen into the build"), and this template
  // is stamped into every future app, so it should teach one idiom rather than
  // a second one. It also leaves the segment config alone: a blanket
  // force-dynamic here would rule out partial prerendering for every route of
  // every app stamped from this template, forever, without anyone
  // re-deciding it.
  await connection();
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
