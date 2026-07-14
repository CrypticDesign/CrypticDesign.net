export const AVATAR_SKIN_TONES = ["umber", "copper", "sand", "moon"] as const;
export const AVATAR_OUTFITS = ["signal", "archive", "drift"] as const;
export const AVATAR_TRAITS = ["none", "crest", "antennae"] as const;

export interface AvatarRecipe {
  schemaVersion: 1;
  rigId: "cryptic-humanoid-v1";
  skinTone: (typeof AVATAR_SKIN_TONES)[number];
  outfit: (typeof AVATAR_OUTFITS)[number];
  accent: "cyan" | "gold" | "magenta" | "green";
  trait: (typeof AVATAR_TRAITS)[number];
}

export const DEFAULT_AVATAR_RECIPE: AvatarRecipe = { schemaVersion: 1, rigId: "cryptic-humanoid-v1", skinTone: "copper", outfit: "signal", accent: "cyan", trait: "none" };

export function validateAvatarRecipe(value: unknown): AvatarRecipe {
  const recipe = value && typeof value === "object" ? value as Partial<AvatarRecipe> : DEFAULT_AVATAR_RECIPE;
  if (recipe.schemaVersion !== 1 || recipe.rigId !== "cryptic-humanoid-v1") throw new Error("Unsupported avatar recipe version");
  if (!AVATAR_SKIN_TONES.includes(recipe.skinTone as AvatarRecipe["skinTone"])) throw new Error("Unknown avatar skin material");
  if (!AVATAR_OUTFITS.includes(recipe.outfit as AvatarRecipe["outfit"])) throw new Error("Unknown avatar outfit");
  if (!["cyan", "gold", "magenta", "green"].includes(recipe.accent ?? "")) throw new Error("Unknown avatar accent");
  if (!AVATAR_TRAITS.includes(recipe.trait as AvatarRecipe["trait"])) throw new Error("Unknown avatar trait");
  return recipe as AvatarRecipe;
}
