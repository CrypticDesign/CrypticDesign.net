import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SubNavBreadcrumbs from "@/components/SubNavBreadcrumbs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crypticdesign.net"),
  title: { default: "Cryptic Design", template: "%s | Cryptic Design" },
  description: "CrypticDesign.net — entertainment, professional services, and original releases.",
  openGraph: {
    url: "https://crypticdesign.net",
    siteName: "Cryptic Design",
    type: "website",
    images: [
      {
        url: "/share.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Cryptic Design — entertainment, professional services, and original releases.",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        <SubNavBreadcrumbs position="top" />
        <div id="main-content" className="flex-1" tabIndex={-1}>{children}</div>
        <SubNavBreadcrumbs position="bottom" />
        <footer className="site-footer">
          <div className="site-footer__inner">
            <div className="site-footer__top">
              <div><h2>CRYPTIC DESIGN</h2><p>Independent research, design, development, and media production.</p></div>
              <div className="footer-columns">
                <div className="footer-column"><strong>PLATFORM</strong><Link href="/">My Home</Link><Link href="/entertainment">Entertainment</Link><Link href="/professional">Professional</Link></div>
                <div className="footer-column"><strong>STUDIO</strong><Link href="/products">Projects</Link><Link href="/professional/articles">Articles</Link><Link href="/entertainment/creative-labs">Creative Labs</Link><Link href="/entertainment/store">Store</Link></div>
                <div className="footer-column"><strong>CONNECT</strong><Link href="/professional/contact">Contact</Link><Link href="/creator-tools">Creators</Link><Link href="/account">Account</Link></div>
              </div>
            </div>
            <div className="site-footer__bottom"><p>© {new Date().getFullYear()} Cryptic Design LLC. All rights reserved.</p><p><Link href="/privacy" className="hover:text-white">PRIVACY</Link> &nbsp; ACCESSIBILITY &nbsp; <Link href="/terms" className="hover:text-white">TERMS</Link></p></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
