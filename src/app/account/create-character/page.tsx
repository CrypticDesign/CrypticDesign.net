import type { Metadata } from "next";
import CharacterCreator from "@/components/CharacterCreator";

export const metadata: Metadata = {
  title: "Create Character",
  alternates: { canonical: "/account/create-character" },
  description: "Every account creates a character — your identity across the platform.",
};

export default function CreateCharacterPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Create your character</h1>
        <p className="max-w-xl text-muted-foreground">
          Your character is platform identity, not a simple avatar — it carries
          saves, history, room presence, Arcade identity, and listening
          identity. This preview saves your character on this device.
        </p>
      </header>
      <CharacterCreator />
    </main>
  );
}
