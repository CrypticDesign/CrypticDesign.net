import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crypticdesign.net"),
  title: {
    default: "Cryptic Design",
    template: "%s | Cryptic Design",
  },
  description:
    "CrypticDesign.net — the Cryptic Design platform for entertainment, professional services, and original releases.",
  openGraph: {
    siteName: "Cryptic Design",
    type: "website",
    images: ["/share-placeholder.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-neutral-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
            <nav
              aria-label="Secondary"
              className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500"
            >
              <Link href="/releases" className="hover:text-neutral-300">Releases</Link>
              <Link href="/creative-works" className="hover:text-neutral-300">Creative Works</Link>
              <Link href="/worlds" className="hover:text-neutral-300">Worlds</Link>
              <Link href="/labs" className="hover:text-neutral-300">Labs</Link>
              <Link href="/creator-tools" className="hover:text-neutral-300">Creator Tools</Link>
              <Link href="/professional" className="hover:text-neutral-300">Studio &amp; Services</Link>
              <Link href="/search" className="hover:text-neutral-300">Search</Link>
            </nav>
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} Cryptic Design, LLC. Science, art,
              and technology — designed as one system.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
