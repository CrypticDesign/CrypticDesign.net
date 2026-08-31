export const EXPERIENCE_RUNTIME_CONTEXT_VERSION = "1.0" as const;

export type ExperienceRuntimePhase =
  | "hydrating"
  | "presentation"
  | "ready"
  | "activating"
  | "active-embedded"
  | "active-fullscreen"
  | "interrupting"
  | "resolved"
  | "updated"
  | "fallback";

export type ExperienceRuntimeInputOwner = "page" | "runtime" | "none";
export type ExperienceRuntimeResumeStatus = "none" | "available" | "incompatible";

export interface ExperienceRuntimeAuthoritativeContextV1 {
  contractVersion: typeof EXPERIENCE_RUNTIME_CONTEXT_VERSION;
  experienceId: string;
  access: {
    status: "public" | "authorized" | "denied";
    subjectId?: string;
  };
  resume?: {
    status: ExperienceRuntimeResumeStatus;
    checkpointId?: string;
    schemaVersion?: string;
    payload?: unknown;
  };
}

export interface ExperienceRuntimeCapabilities {
  pointer: boolean;
  touch: boolean;
  keyboard: boolean;
  controller: boolean;
  audio: boolean;
  fullscreen: boolean;
}

export interface ExperienceRuntimeAudioState {
  consent: "required" | "granted" | "denied";
  muted: boolean;
  volume: number;
}

export interface ExperienceRuntimeState {
  phase: ExperienceRuntimePhase;
  context?: ExperienceRuntimeAuthoritativeContextV1;
  inputOwner: ExperienceRuntimeInputOwner;
  audio: ExperienceRuntimeAudioState;
  fullscreenFailure?: string;
  fallbackReason?: string;
}

export type ExperienceRuntimeAction =
  | { type: "HYDRATE"; context?: ExperienceRuntimeAuthoritativeContextV1 }
  | { type: "PRESENT" }
  | { type: "READY" }
  | { type: "ACTIVATE" }
  | { type: "ACTIVATED" }
  | { type: "ENTER_FULLSCREEN" }
  | { type: "EXIT_FULLSCREEN" }
  | { type: "FULLSCREEN_FAILED"; reason: string }
  | { type: "INTERRUPT" }
  | { type: "RESOLVE" }
  | { type: "UPDATE" }
  | { type: "DEACTIVATE" }
  | { type: "FALLBACK"; reason: string }
  | { type: "SET_AUDIO"; muted?: boolean; volume?: number; consent?: ExperienceRuntimeAudioState["consent"] };

export const DEFAULT_EXPERIENCE_RUNTIME_CAPABILITIES: ExperienceRuntimeCapabilities = {
  pointer: true,
  touch: true,
  keyboard: true,
  controller: false,
  audio: true,
  fullscreen: true,
};

export function createExperienceRuntimeState(
  context?: ExperienceRuntimeAuthoritativeContextV1,
): ExperienceRuntimeState {
  return {
    phase: "hydrating",
    context,
    inputOwner: "page",
    audio: { consent: "required", muted: true, volume: 0.8 },
  };
}

function clampVolume(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function experienceRuntimeReducer(
  state: ExperienceRuntimeState,
  action: ExperienceRuntimeAction,
): ExperienceRuntimeState {
  switch (action.type) {
    case "HYDRATE":
      return { ...createExperienceRuntimeState(action.context), audio: state.audio };
    case "PRESENT":
      return state.phase === "hydrating" || state.phase === "fallback"
        ? { ...state, phase: "presentation", fallbackReason: undefined }
        : state;
    case "READY":
      return state.phase === "presentation" ? { ...state, phase: "ready" } : state;
    case "ACTIVATE":
      return state.phase === "ready" || state.phase === "updated"
        ? { ...state, phase: "activating", fullscreenFailure: undefined }
        : state;
    case "ACTIVATED":
      return state.phase === "activating"
        ? { ...state, phase: "active-embedded", inputOwner: "runtime" }
        : state;
    case "ENTER_FULLSCREEN":
      return state.phase === "active-embedded"
        ? { ...state, phase: "active-fullscreen", inputOwner: "runtime", fullscreenFailure: undefined }
        : state;
    case "EXIT_FULLSCREEN":
      return state.phase === "active-fullscreen"
        ? { ...state, phase: "active-embedded", inputOwner: "runtime" }
        : state;
    case "FULLSCREEN_FAILED":
      return state.phase === "active-embedded" || state.phase === "active-fullscreen"
        ? { ...state, phase: "active-embedded", fullscreenFailure: action.reason }
        : state;
    case "INTERRUPT":
      return state.phase === "active-embedded" || state.phase === "active-fullscreen"
        ? { ...state, phase: "interrupting", inputOwner: "none" }
        : state;
    case "RESOLVE":
      return state.phase === "interrupting"
        ? { ...state, phase: "resolved", inputOwner: "page" }
        : state;
    case "UPDATE":
      return state.phase === "resolved"
        ? { ...state, phase: "updated", inputOwner: "page" }
        : state;
    case "DEACTIVATE":
      return state.phase === "active-embedded" || state.phase === "active-fullscreen" || state.phase === "activating"
        ? { ...state, phase: "updated", inputOwner: "page" }
        : state;
    case "FALLBACK":
      return { ...state, phase: "fallback", inputOwner: "page", fallbackReason: action.reason };
    case "SET_AUDIO":
      return {
        ...state,
        audio: {
          consent: action.consent ?? state.audio.consent,
          muted: action.muted ?? state.audio.muted,
          volume: action.volume === undefined ? state.audio.volume : clampVolume(action.volume),
        },
      };
  }
}

export function runtimeLauncherLabel(context?: ExperienceRuntimeAuthoritativeContextV1): "Play" | "Continue" | "Unavailable" {
  if (context?.access.status === "denied" || context?.resume?.status === "incompatible") return "Unavailable";
  return context?.resume?.status === "available" ? "Continue" : "Play";
}
