import type { Metadata } from "next";
import CharacterCreator from "@/components/CharacterCreator";

export const metadata: Metadata = {
  title: "Create Character",
  alternates: { canonical: "/account/create-character" },
  description: "Every account creates a character — your identity across the platform.",
};

export default function CreateCharacterPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <span className="kicker">Character Forge</span>
        <h1 className="display-title text-white">Shape your signal.</h1>
        <p className="max-w-xl text-muted-foreground">
          Build the three-dimensional persona that represents you across CrypticDesign.net.
          Identity remains permanent; appearance can evolve with you.
        </p>
      </header>
      <CharacterCreator />
    </main>
  );
}
