import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In",
  alternates: { canonical: "/account/sign-in" },
  description: "Sign in to CrypticDesign.net.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Sign In</h1>
      <p className="max-w-xl text-muted-foreground">
        Sign-in opens with the account backend. Your library and character are
        stored on this device until then.
      </p>
      <div className="flex gap-3 text-sm">
        <Link href="/" className="rounded-control bg-accent-cyan px-4 py-2 font-medium text-black hover:opacity-90">Continue to My Home</Link>
        <Link href="/library" className="text-accent-cyan hover:underline">My Library</Link>
        <Link href="/account" className="text-accent-cyan hover:underline">← Account</Link>
      </div>
    </main>
  );
}
