import type { AvatarRecipe } from "./avatar";

export type AvatarViewMode = "full-body" | "portrait" | "detail";

export type AvatarViewCommand =
  | { type: "rotate"; radians: number }
  | { type: "zoom"; amount: number }
  | { type: "view"; mode: AvatarViewMode }
  | { type: "reset" };

export const AVATAR_CAMERA_MIN_DISTANCE = 4.8;
export const AVATAR_CAMERA_MAX_DISTANCE = 8;
export const AVATAR_CAMERA_DEFAULT_DISTANCE = 6.2;

export const AVATAR_VIEW_PRESETS: Record<AvatarViewMode, { distance: number; height: number }> = {
  "full-body": { distance: AVATAR_CAMERA_DEFAULT_DISTANCE, height: 0.2 },
  portrait: { distance: AVATAR_CAMERA_MIN_DISTANCE, height: 1.15 },
  detail: { distance: AVATAR_CAMERA_MIN_DISTANCE, height: 0.55 },
};

export function avatarViewCommandForKey(key: string): AvatarViewCommand | null {
  switch (key) {
    case "ArrowLeft":
      return { type: "rotate", radians: -0.18 };
    case "ArrowRight":
      return { type: "rotate", radians: 0.18 };
    case "ArrowUp":
    case "+":
    case "=":
      return { type: "zoom", amount: -0.35 };
    case "ArrowDown":
    case "-":
      return { type: "zoom", amount: 0.35 };
    case "1":
      return { type: "view", mode: "full-body" };
    case "2":
      return { type: "view", mode: "portrait" };
    case "3":
      return { type: "view", mode: "detail" };
    case "Home":
      return { type: "reset" };
    default:
      return null;
  }
}

export function clampAvatarCameraDistance(distance: number) {
  return Math.min(AVATAR_CAMERA_MAX_DISTANCE, Math.max(AVATAR_CAMERA_MIN_DISTANCE, distance));
}

export function describeAvatarRecipe(recipe: AvatarRecipe) {
  const trait = recipe.trait === "none" ? "none selected" : recipe.trait;
  return `Body: ${recipe.rigId}, ${recipe.skinTone} skin material. Hair: no selection in this recipe version. Wardrobe: ${recipe.outfit}. Traits: ${trait}. Signals: ${recipe.accent}.`;
}
