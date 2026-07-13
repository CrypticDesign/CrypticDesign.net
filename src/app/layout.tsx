import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SubNavBreadcrumbs from "@/components/SubNavBreadcrumbs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://crypticdesign.net"),
  title: { default: "Cryptic Design", template: "%s | Cryptic Design" },
  description: "CrypticDesign.net — entertainment, professional services, and original releases.",
  openGraph: { siteName: "Cryptic Design", type: "website", images: ["/share-placeholder.svg"] },
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
                <div className="footer-column"><strong>STUDIO</strong><Link href="/products">Projects</Link><Link href="/professional/articles">Articles</Link><Link href="/entertainment/creative-labs">Creative Labs</Link></div>
                <div className="footer-column"><strong>CONNECT</strong><Link href="/professional/contact">Contact</Link><Link href="/creator-tools">Creators</Link><Link href="/account">Account</Link></div>
              </div>
            </div>
            <div className="site-footer__bottom"><p>© {new Date().getFullYear()} Cryptic Design LLC. All rights reserved.</p><p>PRIVACY &nbsp; ACCESSIBILITY &nbsp; TERMS</p></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
