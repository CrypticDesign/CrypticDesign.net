import type { Metadata } from "next";
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
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-neutral-500 sm:px-6">
            © {new Date().getFullYear()} Cryptic Design, LLC. Science, art,
            and technology — designed as one system.
          </div>
        </footer>
      </body>
    </html>
  );
}
