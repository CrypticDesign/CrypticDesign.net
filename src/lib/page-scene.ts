export type PageSceneId = "public-home" | "entertainment" | "community" | "professional";
export type PageSceneQuality = "auto" | "high" | "mid" | "low";
export type ResolvedPageSceneQuality = Exclude<PageSceneQuality, "auto">;
export type PageScenePerformanceState = "nominal" | "constrained" | "critical";

export interface PageSceneTextureAsset {
  id: string;
  type: "texture";
  src: string;
  usage: "backdrop";
  opacity: number;
}

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
  assets: PageSceneTextureAsset[];
}

export const PAGE_SCENES: Record<PageSceneId, PageSceneDefinition> = {
  "public-home": {
    id: "public-home",
    background: 0x03080f,
    primary: 0x4f8fea,
    secondary: 0x4f8fea,
    particleCount: { high: 420, mid: 180 },
    assets: [{ id: "home-signal", type: "texture", src: "/images/entertainment-hero.png", usage: "backdrop", opacity: 0.1 }],
  },
  entertainment: {
    id: "entertainment",
    background: 0x03080f,
    primary: 0x4cc9d8,
    secondary: 0x4cc9d8,
    particleCount: { high: 380, mid: 160 },
    assets: [{ id: "entertainment-signal", type: "texture", src: "/images/entertainment-hero.png", usage: "backdrop", opacity: 0.1 }],
  },
  community: {
    id: "community",
    background: 0x03080f,
    primary: 0x7c8ce8,
    secondary: 0x7c8ce8,
    particleCount: { high: 320, mid: 130 },
    assets: [{ id: "community-signal", type: "texture", src: "/images/current-focus.png", usage: "backdrop", opacity: 0.08 }],
  },
  professional: {
    id: "professional",
    background: 0x03080f,
    primary: 0x9a86d8,
    secondary: 0x9a86d8,
    particleCount: { high: 260, mid: 100 },
    assets: [{ id: "professional-signal", type: "texture", src: "/images/professional-hero.png", usage: "backdrop", opacity: 0.08 }],
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

export function classifyPageScenePerformance(fps: number): PageScenePerformanceState {
  if (fps < 28) return "critical";
  if (fps < 48) return "constrained";
  return "nominal";
}

export function shouldDowngradePageSceneQuality({
  requested,
  quality,
  fps,
  consecutiveConstrainedSamples,
}: {
  requested: PageSceneQuality;
  quality: ResolvedPageSceneQuality;
  fps: number;
  consecutiveConstrainedSamples: number;
}): boolean {
  return requested === "auto" && quality === "high" && fps < 42 && consecutiveConstrainedSamples >= 2;
}
