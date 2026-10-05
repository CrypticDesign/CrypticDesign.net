export const CHARACTER_FORGE_STEPS = ["Identity", "Form", "Style", "Story", "Review"] as const;

export const CHARACTER_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;

export interface CharacterForgeIdentityErrors {
  name?: string;
  handle?: string;
}

export function validateCharacterForgeIdentity(nameValue: string, handleValue: string): CharacterForgeIdentityErrors {
  const name = nameValue.trim();
  const handle = handleValue.trim();
  const errors: CharacterForgeIdentityErrors = {};
  if (!name) errors.name = "Enter a display name.";
  else if (name.length > 32) errors.name = "Use 32 characters or fewer.";
  if (!handle) errors.handle = "Enter a handle.";
  else if (!CHARACTER_HANDLE_PATTERN.test(handle)) errors.handle = "Use 3–32 lowercase letters, numbers, or hyphens.";
  return errors;
}

export function canOpenCharacterForgeStep(requestedStep: number, highestUnlockedStep: number) {
  return Number.isInteger(requestedStep)
    && requestedStep >= 0
    && requestedStep < CHARACTER_FORGE_STEPS.length
    && requestedStep <= highestUnlockedStep;
}
