import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crypticdesign.net"),
  title: {
    default: "Cryptic Design",
    template: "%s | Cryptic Design",
  },
  description:
    "CrypticDesign.net — the Cryptic Design platform for entertainment, professional services, and original releases.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
