import type { Metadata } from "next";
import MyHomeDashboard from "@/components/MyHomeDashboard";
import PublicHome from "@/components/PublicHome";
import { accountAdmissionMode } from "@/lib/account-admission";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";
import { socialMetadata } from "@/lib/social-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const authenticated = await getInitialAccountAuthenticated();
  const title = authenticated ? "My Home" : "Cryptic Design";
  const description = authenticated
    ? "Your private Cryptic Design dashboard for Character identity, saved Library items, activity, progress, and what to do next."
    : "Explore Cryptic Design: original entertainment, creative technology, professional design practice, research, and a connected platform ecosystem.";
  return {
    title,
    description,
    alternates: { canonical: "/" },
    ...socialMetadata({ title, description, url: "/", image: "/share/home.png" }),
  };
}

export default async function HomePage() {
  const authenticated = await getInitialAccountAuthenticated();
  return authenticated
    ? <MyHomeDashboard initialAuthenticated />
    : <PublicHome accountAdmissionMode={accountAdmissionMode()} />;
}
