export type PageSceneId = "public-home" | "entertainment" | "community" | "professional";
export type PageSceneQuality = "auto" | "high" | "mid" | "low";
export type ResolvedPageSceneQuality = Exclude<PageSceneQuality, "auto">;

export interface PageSceneCapabilityInput {
  requested?: PageSceneQuality;
  reducedMotion: boolean;
  webglSupported: boolean;
  viewportWidth: number;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  saveData?: boolean;
}

export interface PageSceneDefinition {
  id: PageSceneId;
  background: number;
  primary: number;
  secondary: number;
  particleCount: Record<Exclude<ResolvedPageSceneQuality, "low">, number>;
}

export const PAGE_SCENES: Record<PageSceneId, PageSceneDefinition> = {
  "public-home": {
    id: "public-home",
    background: 0x03080f,
    primary: 0x1e90ff,
    secondary: 0x1e90ff,
    particleCount: { high: 420, mid: 180 },
  },
  entertainment: {
    id: "entertainment",
    background: 0x03080f,
    primary: 0x00ffff,
    secondary: 0x00ffff,
    particleCount: { high: 380, mid: 160 },
  },
  community: {
    id: "community",
    background: 0x03080f,
    primary: 0x00ff7f,
    secondary: 0x00ff7f,
    particleCount: { high: 320, mid: 130 },
  },
  professional: {
    id: "professional",
    background: 0x03080f,
    primary: 0xffff33,
    secondary: 0xffff33,
    particleCount: { high: 260, mid: 100 },
  },
};

export function resolvePageSceneQuality(input: PageSceneCapabilityInput): ResolvedPageSceneQuality {
  if (!input.webglSupported || input.reducedMotion || input.saveData || input.viewportWidth < 640) return "low";
  if (input.requested && input.requested !== "auto") return input.requested;

  const constrainedMemory = input.deviceMemory !== undefined && input.deviceMemory <= 4;
  const constrainedCpu = input.hardwareConcurrency !== undefined && input.hardwareConcurrency <= 4;
  if (input.viewportWidth < 1024 || constrainedMemory || constrainedCpu) return "mid";
  return "high";
}
