import type { Metadata } from "next";
import MyHomeDashboard from "@/components/MyHomeDashboard";

export const metadata: Metadata = {
  title: "My Home",
  alternates: { canonical: "/" },
  description: "Your personal Cryptic Design character, library, activity, and interests.",
};

export default function MyHomePage() {
  return <MyHomeDashboard />;
}
