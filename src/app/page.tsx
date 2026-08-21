import type { Metadata } from "next";
import MyHomeDashboard from "@/components/MyHomeDashboard";
import { accountAdmissionMode } from "@/lib/account-admission";

export const metadata: Metadata = {
  title: "My Home",
  alternates: { canonical: "/" }, openGraph: { images: ["/share/home.png"] }, twitter: { card: "summary_large_image", images: ["/share/home.png"] }, 
  description: "Your private Cryptic Design dashboard for Character identity, saved Library items, activity, progress, and what to do next.",
};

export default function MyHomePage() {
  return <MyHomeDashboard accountAdmissionMode={accountAdmissionMode()} />;
}
