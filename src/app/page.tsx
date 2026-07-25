import type { Metadata } from "next";
import MyHomeDashboard from "@/components/MyHomeDashboard";

export const metadata: Metadata = {
  title: "My Home",
  alternates: { canonical: "/" },
  description: "Your personal Cryptic Design space: character, saved library, activity, interests, and progress across releases, franchises, games, music, and original worlds.",
};

export default function MyHomePage() {
  return <MyHomeDashboard />;
}
