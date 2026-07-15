export type InspectionView = "portrait" | "full_body" | "detail";
export type RendererMode = "webgl" | "static" | "text";
export type MotionPreference = "full" | "reduced";
export type InspectionCommand = "rotate_left" | "rotate_right" | "show_portrait" | "show_full_body" | "show_detail" | "reset";

export interface AvatarInspectionState {
  view: InspectionView;
  rotationDegrees: number;
  rendererMode: RendererMode;
  motionPreference: MotionPreference;
}

export interface AvatarInspectionRecipe {
  body: string;
  hair: string | null;
  wardrobe: string[];
  traits: string[];
  signals: string[];
}

export interface InspectionAlternative {
  heading: string;
  summary: string;
  sections: Array<{ label: string; values: string[] }>;
  staticViews: InspectionView[];
}

const ROTATION_STEP = 15;

function normalizedRotation(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function applyInspectionCommand(state: AvatarInspectionState, command: InspectionCommand): AvatarInspectionState {
  if (command === "rotate_left") return { ...state, rotationDegrees: normalizedRotation(state.rotationDegrees - ROTATION_STEP) };
  if (command === "rotate_right") return { ...state, rotationDegrees: normalizedRotation(state.rotationDegrees + ROTATION_STEP) };
  if (command === "show_portrait") return { ...state, view: "portrait" };
  if (command === "show_full_body") return { ...state, view: "full_body" };
  if (command === "show_detail") return { ...state, view: "detail" };
  return { ...state, view: "full_body", rotationDegrees: 0 };
}

export function shouldAnimateInspection(state: AvatarInspectionState): boolean {
  return state.rendererMode === "webgl" && state.motionPreference === "full";
}

export function buildInspectionAlternative(input: { characterName: string; recipe: AvatarInspectionRecipe }): InspectionAlternative {
  const sections = [
    { label: "Body", values: [input.recipe.body] },
    { label: "Hair", values: input.recipe.hair ? [input.recipe.hair] : ["None selected"] },
    { label: "Wardrobe", values: input.recipe.wardrobe.length ? input.recipe.wardrobe : ["None selected"] },
    { label: "Traits", values: input.recipe.traits.length ? input.recipe.traits : ["None selected"] },
    { label: "Signals", values: input.recipe.signals.length ? input.recipe.signals : ["None selected"] },
  ];
  return {
    heading: `${input.characterName} appearance`,
    summary: `${input.characterName} uses ${input.recipe.body} with ${input.recipe.wardrobe.length} wardrobe selection${input.recipe.wardrobe.length === 1 ? "" : "s"}.`,
    sections,
    staticViews: ["portrait", "full_body"],
  };
}

export function canConfirmFromInspection(input: { compatibilityValid: boolean; recipeComplete: boolean; rendererMode: RendererMode }): boolean {
  return input.compatibilityValid && input.recipeComplete && ["webgl", "static", "text"].includes(input.rendererMode);
}

export function describeInspectionChange(state: AvatarInspectionState): string {
  const view = state.view === "full_body" ? "full body" : state.view;
  return `${view} view, ${state.rotationDegrees} degrees, ${state.rendererMode} presentation`;
}
