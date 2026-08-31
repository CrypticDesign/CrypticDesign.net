"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactElement,
} from "react";

import PageScene from "@/components/PageScene";
import { usePlayer } from "@/components/player/PlayerProvider";
import {
  DEFAULT_EXPERIENCE_RUNTIME_CAPABILITIES,
  EXPERIENCE_RUNTIME_CONTEXT_VERSION,
  createExperienceRuntimeState,
  experienceRuntimeReducer,
  runtimeLauncherLabel,
  type ExperienceRuntimeAuthoritativeContextV1,
  type ExperienceRuntimeCapabilities,
  type ExperienceRuntimeState,
} from "@/lib/experience-runtime";
import type { PageSceneId, PageSceneQuality } from "@/lib/page-scene";

interface ExperienceRuntimeBaseProps {
  runtimeId: string;
  accessibleLabel: string;
  launchMode?: "embedded" | "fullscreen";
  controls?: "shared" | "consumer";
  capabilities?: Partial<ExperienceRuntimeCapabilities>;
  authoritativeContext?: ExperienceRuntimeAuthoritativeContextV1;
}

export type ExperienceRuntimeProps = ExperienceRuntimeBaseProps & (
  | { children?: never; sceneId: PageSceneId; fallbackPoster: string; quality?: PageSceneQuality }
  | { children: ReactElement; sceneId?: never; fallbackPoster?: never; quality?: never }
);

export interface ExperienceRuntimeController {
  state: ExperienceRuntimeState;
  capabilities: ExperienceRuntimeCapabilities;
  authoritativeContext: ExperienceRuntimeAuthoritativeContextV1;
  isActive: boolean;
  isExpanded: boolean;
  activate: () => void;
  deactivate: () => Promise<void>;
  requestFullscreen: () => Promise<void>;
  enableAudio: () => void;
  muteAudio: () => void;
  setAudioVolume: (volume: number) => void;
  reportReady: () => void;
  reportFallback: (reason: string) => void;
  interrupt: () => Promise<void>;
  resolve: () => void;
  markUpdated: () => void;
}

const ExperienceRuntimeContext = createContext<ExperienceRuntimeController | null>(null);

export function useExperienceRuntime(): ExperienceRuntimeController {
  const controller = useContext(ExperienceRuntimeContext);
  if (!controller) throw new Error("useExperienceRuntime must be used inside ExperienceRuntime.");
  return controller;
}

export default function ExperienceRuntime({
  runtimeId,
  sceneId,
  fallbackPoster,
  accessibleLabel,
  launchMode = "embedded",
  controls = "shared",
  quality = "auto",
  capabilities: capabilityOverrides,
  authoritativeContext,
  children,
}: ExperienceRuntimeProps) {
  const hasCustomSurface = children !== undefined;
  const capabilities = useMemo(
    () => ({ ...DEFAULT_EXPERIENCE_RUNTIME_CAPABILITIES, ...capabilityOverrides }),
    [capabilityOverrides],
  );
  const context = useMemo<ExperienceRuntimeAuthoritativeContextV1>(
    () => authoritativeContext ?? {
      contractVersion: EXPERIENCE_RUNTIME_CONTEXT_VERSION,
      experienceId: runtimeId,
      access: { status: "public" },
      resume: { status: "none" },
    },
    [authoritativeContext, runtimeId],
  );
  const [state, dispatch] = useReducer(experienceRuntimeReducer, context, createExperienceRuntimeState);
  const [expandedFallback, setExpandedFallback] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const launchButtonRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef(state);
  const contextRef = useRef(context);
  const { requestAudioPriority, releaseAudioPriority } = usePlayer();

  stateRef.current = state;

  useEffect(() => {
    if (contextRef.current === context) return;
    contextRef.current = context;
    setExpandedFallback(false);
    releaseAudioPriority(runtimeId);
    dispatch({ type: "HYDRATE", context });
    if (hasCustomSurface) return;
    const frame = window.requestAnimationFrame(() => dispatch({ type: "PRESENT" }));
    return () => window.cancelAnimationFrame(frame);
  }, [context, hasCustomSurface, releaseAudioPriority, runtimeId]);

  useEffect(() => {
    if (state.phase !== "presentation") return;
    const frame = window.requestAnimationFrame(() => dispatch({ type: "READY" }));
    return () => window.cancelAnimationFrame(frame);
  }, [state.phase]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === rootRef.current) {
        dispatch({ type: "ENTER_FULLSCREEN" });
        return;
      }
      if (stateRef.current.phase !== "active-fullscreen") return;
      dispatch({ type: "EXIT_FULLSCREEN" });
      if (launchMode === "fullscreen") {
        releaseAudioPriority(runtimeId);
        dispatch({ type: "DEACTIVATE" });
        window.requestAnimationFrame(() => launchButtonRef.current?.focus());
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [launchMode, releaseAudioPriority, runtimeId]);

  useEffect(() => {
    if (!expandedFallback) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [expandedFallback]);

  useEffect(() => () => releaseAudioPriority(runtimeId), [releaseAudioPriority, runtimeId]);

  const reportReady = useCallback(() => dispatch({ type: "PRESENT" }), []);
  const reportFallback = useCallback((reason: string) => dispatch({ type: "FALLBACK", reason }), []);

  const handleSceneStatus = useCallback((status: "ready" | "fallback", reason?: string) => {
    if (status === "fallback") reportFallback(reason ?? "runtime-unavailable");
    else reportReady();
  }, [reportFallback, reportReady]);

  const activate = useCallback(() => {
    if (runtimeLauncherLabel(state.context) === "Unavailable") return;
    dispatch({ type: "ACTIVATE" });
    window.requestAnimationFrame(() => {
      dispatch({ type: "ACTIVATED" });
      rootRef.current?.focus();
    });
  }, [state.context]);

  const interrupt = useCallback(async () => {
    if (document.fullscreenElement === rootRef.current && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { /* The embedded session still exits safely. */ }
    }
    setExpandedFallback(false);
    releaseAudioPriority(runtimeId);
    dispatch({ type: "INTERRUPT" });
  }, [releaseAudioPriority, runtimeId]);

  const resolve = useCallback(() => dispatch({ type: "RESOLVE" }), []);
  const markUpdated = useCallback(() => dispatch({ type: "UPDATE" }), []);

  const deactivate = useCallback(async () => {
    await interrupt();
    dispatch({ type: "RESOLVE" });
    dispatch({ type: "UPDATE" });
    window.requestAnimationFrame(() => launchButtonRef.current?.focus());
  }, [interrupt]);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement === rootRef.current) {
      try { await document.exitFullscreen(); } catch {
        dispatch({ type: "FULLSCREEN_FAILED", reason: "fullscreen-exit-failed" });
      }
      return;
    }
    if (expandedFallback) {
      setExpandedFallback(false);
      return;
    }

    const root = rootRef.current;
    if (!capabilities.fullscreen || !root?.requestFullscreen) {
      setExpandedFallback(true);
      dispatch({ type: "FULLSCREEN_FAILED", reason: "fullscreen-unsupported-expanded-embedded" });
      return;
    }
    try {
      await root.requestFullscreen();
    } catch {
      setExpandedFallback(true);
      dispatch({ type: "FULLSCREEN_FAILED", reason: "fullscreen-request-failed-expanded-embedded" });
    }
  }, [capabilities.fullscreen, expandedFallback]);

  const activateFullscreen = useCallback(async () => {
    if (runtimeLauncherLabel(state.context) === "Unavailable") return;
    dispatch({ type: "ACTIVATE" });
    dispatch({ type: "ACTIVATED" });
    rootRef.current?.focus();
    await toggleFullscreen();
  }, [state.context, toggleFullscreen]);

  const enableAudio = useCallback(() => {
    if (!capabilities.audio) return;
    requestAudioPriority(runtimeId);
    dispatch({ type: "SET_AUDIO", consent: "granted", muted: false });
  }, [capabilities.audio, requestAudioPriority, runtimeId]);

  const muteAudio = useCallback(() => {
    releaseAudioPriority(runtimeId);
    dispatch({ type: "SET_AUDIO", muted: true });
  }, [releaseAudioPriority, runtimeId]);

  const setAudioVolume = useCallback((volume: number) => {
    if (!capabilities.audio) return;
    dispatch({ type: "SET_AUDIO", volume });
  }, [capabilities.audio]);

  const isActive = state.phase === "active-embedded" || state.phase === "active-fullscreen";
  const launcher = runtimeLauncherLabel(state.context);
  const controller = useMemo<ExperienceRuntimeController>(() => ({
    state,
    capabilities,
    authoritativeContext: context,
    isActive,
    isExpanded: expandedFallback || state.phase === "active-fullscreen",
    activate,
    deactivate,
    requestFullscreen: toggleFullscreen,
    enableAudio,
    muteAudio,
    setAudioVolume,
    reportReady,
    reportFallback,
    interrupt,
    resolve,
    markUpdated,
  }), [
    activate,
    capabilities,
    context,
    deactivate,
    enableAudio,
    expandedFallback,
    interrupt,
    isActive,
    markUpdated,
    muteAudio,
    reportFallback,
    reportReady,
    resolve,
    setAudioVolume,
    state,
    toggleFullscreen,
  ]);
  const statusMessage = state.phase === "fallback"
    ? "Interactive presentation unavailable. The page and its actions remain available."
    : state.fullscreenFailure
      ? "Fullscreen was unavailable. The active experience remains expanded in this page."
      : state.phase === "ready"
        ? "Interactive presentation ready."
        : isActive
          ? "Interactive experience active. Press Escape or Exit experience to return."
          : "Interactive presentation loading.";

  if (!hasCustomSurface && (!sceneId || !fallbackPoster)) {
    throw new Error("ExperienceRuntime requires sceneId and fallbackPoster when no custom child surface is provided.");
  }

  return (
    <ExperienceRuntimeContext.Provider value={controller}>
      <div
        ref={rootRef}
        className={`experience-runtime ${hasCustomSurface ? "experience-runtime--custom" : "visual-hero__image"}`}
        data-runtime-id={runtimeId}
        data-launch-mode={launchMode}
        data-runtime-state={state.phase}
        data-input-owner={state.inputOwner}
        data-expanded={expandedFallback || state.phase === "active-fullscreen"}
        data-audio-consent={state.audio.consent}
        data-audio-muted={state.audio.muted}
        data-audio-volume={state.audio.volume}
        data-controller-enabled={capabilities.controller}
        tabIndex={-1}
        role="region"
        aria-label={accessibleLabel}
        onKeyDown={(event) => {
          if (controls === "shared" && capabilities.keyboard && event.key === "Escape" && isActive && document.fullscreenElement !== rootRef.current) {
            event.preventDefault();
            void deactivate();
          }
        }}
      >
        {hasCustomSurface ? children : (
          <PageScene
            sceneId={sceneId!}
            fallbackPoster={fallbackPoster!}
            quality={quality}
            interaction={isActive ? "active" : "ambient"}
            runtimePhase={state.phase}
            inputOwner={state.inputOwner}
            pointerEnabled={capabilities.pointer}
            touchEnabled={capabilities.touch}
            onRuntimeStatus={handleSceneStatus}
          />
        )}
        {controls === "shared" ? <div className="experience-runtime__controls" aria-label="Experience controls">
          {!isActive && state.phase !== "fallback" ? (
            <button
              ref={launchButtonRef}
              type="button"
              className="experience-runtime__control experience-runtime__control--primary"
              disabled={state.phase !== "ready" && state.phase !== "updated" || launcher === "Unavailable"}
              onClick={launchMode === "fullscreen" ? () => void activateFullscreen() : activate}
            >
              {launcher === "Unavailable" ? "Experience unavailable" : launchMode === "fullscreen" ? "Fullscreen" : launcher === "Continue" ? "Continue experience" : "Enter experience"}
            </button>
          ) : null}
          {isActive ? (
            <>
              <button type="button" className="experience-runtime__control" onClick={() => void toggleFullscreen()}>
                {state.phase === "active-fullscreen" ? "Exit fullscreen" : expandedFallback ? "Expanded in page" : "Fullscreen"}
              </button>
              {capabilities.audio ? (
                <button type="button" className="experience-runtime__control" aria-pressed={!state.audio.muted} onClick={state.audio.muted ? enableAudio : muteAudio}>
                  {state.audio.muted ? "Enable experience audio" : "Mute experience audio"}
                </button>
              ) : null}
              <button type="button" className="experience-runtime__control" onClick={() => void deactivate()}>Exit experience</button>
            </>
          ) : null}
        </div> : null}
        <span className="sr-only" aria-live="polite">{statusMessage}</span>
      </div>
    </ExperienceRuntimeContext.Provider>
  );
}
