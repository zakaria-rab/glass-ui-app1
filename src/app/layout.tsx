import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "glass-ui-app1",
  description: "A standalone Glass UI app, embedded by the Glass UI shell.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        {/* Page views for this app, reported to this app's own Vercel project.
            It stays useful when the app is opened inside the Glass UI shell:
            the shell counts its own routes, this counts this app. First-party,
            no cookies. */}
        <Analytics />
      </body>
    </html>
  );
}
