import type { Metadata } from "next";
import MyHomeDashboard from "@/components/MyHomeDashboard";
import { accountAdmissionMode } from "@/lib/account-admission";

export const metadata: Metadata = {
  title: "My Home",
  alternates: { canonical: "/" }, openGraph: { images: ["/share/home.png"] }, twitter: { card: "summary_large_image", images: ["/share/home.png"] }, 
  description: "Your personal Cryptic Design space: character, saved library, activity, interests, and progress across releases, franchises, games, music, and original worlds.",
};

export default function MyHomePage() {
  return <MyHomeDashboard accountAdmissionMode={accountAdmissionMode()} />;
}
