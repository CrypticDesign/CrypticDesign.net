import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/library" },
  robots: { index: false, follow: false },
};

export default function LibraryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
