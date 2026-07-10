"use client";

import { useEffect, useState } from "react";
import { getSavedSlugs, toggleSaved } from "@/lib/library";

export default function SaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);

  useEffect(() => {
    setSaved(getSavedSlugs().includes(slug));
  }, [slug]);

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleSaved(slug))}
      className="rounded border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-accent-cyan hover:text-accent-cyan"
    >
      {saved ? "Saved to Library ✓" : "Save to Library"}
    </button>
  );
}
