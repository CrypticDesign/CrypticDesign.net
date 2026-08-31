import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runtime = readFileSync(new URL("../components/ExperienceRuntime.tsx", import.meta.url), "utf8");
const scene = readFileSync(new URL("../components/PageScene.tsx", import.meta.url), "utf8");
const player = readFileSync(new URL("../components/player/PlayerProvider.tsx", import.meta.url), "utf8");
const entertainment = readFileSync(new URL("../app/entertainment/page.tsx", import.meta.url), "utf8");

test("Entertainment consumes the shared ExperienceRuntime rather than a route-specific renderer", () => {
  assert.match(entertainment, /<ExperienceRuntime/);
  assert.match(entertainment, /runtimeId="cryptic-design:entertainment:v1"/);
  assert.match(entertainment, /launchMode="fullscreen"/);
  assert.doesNotMatch(entertainment, /<PageScene/);
});

test("Entertainment uses one Fullscreen launch action while shared runtimes retain embedded launch by default", () => {
  assert.match(runtime, /launchMode = "embedded"/);
  assert.match(runtime, /const activateFullscreen = useCallback/);
  assert.match(runtime, /onClick=\{launchMode === "fullscreen" \? \(\) => void activateFullscreen\(\) : activate\}/);
  assert.match(runtime, /launchMode === "fullscreen" \? "Fullscreen"/);
});

test("activation changes input state without recreating PageScene", () => {
  assert.match(runtime, /interaction=\{isActive \? "active" : "ambient"\}/);
  assert.match(scene, /const activeInteraction = interactionRef\.current === "active"/);
  assert.match(scene, /activeInteraction \? 0\.065 : 0\.035/);
  assert.match(scene, /const interactionRef = useRef\(interaction\)/);
  assert.match(scene, /interactionRef\.current = interaction/);
  assert.match(scene, /\}, \[quality, sceneId\]\);/);
  assert.doesNotMatch(scene, /\[interaction, quality, sceneId\]/);
  assert.match(scene, /dataset\.rendererInstance/);
});

test("property runtimes can compose inside the shared wrapper and consume its controller", () => {
  assert.match(runtime, /children: ReactElement/);
  assert.match(runtime, /children\?: never; sceneId: PageSceneId; fallbackPoster: string/);
  assert.match(runtime, /export function useExperienceRuntime\(\): ExperienceRuntimeController/);
  assert.match(runtime, /<ExperienceRuntimeContext\.Provider value=\{controller\}>/);
  assert.match(runtime, /\{hasCustomSurface \? children : \(/);
  assert.match(runtime, /authoritativeContext: context/);
});

test("the consumer controller exposes lifecycle, fullscreen, audio, readiness, and hydration state", () => {
  for (const member of [
    "activate", "deactivate", "requestFullscreen", "enableAudio", "muteAudio", "setAudioVolume",
    "reportReady", "reportFallback", "interrupt", "resolve", "markUpdated",
  ]) assert.match(runtime, new RegExp(`${member}:`));
  assert.match(runtime, /capabilities,/);
  assert.match(runtime, /authoritativeContext: ExperienceRuntimeAuthoritativeContextV1/);
});

test("input capability policy reaches the wrapper and the stable PageScene", () => {
  assert.match(runtime, /capabilities\.keyboard && event\.key === "Escape"/);
  assert.match(runtime, /pointerEnabled=\{capabilities\.pointer\}/);
  assert.match(runtime, /touchEnabled=\{capabilities\.touch\}/);
  assert.match(runtime, /data-controller-enabled=\{capabilities\.controller\}/);
  assert.match(scene, /event\.pointerType === "touch" \? !touchEnabledRef\.current : !pointerEnabledRef\.current/);
});

test("fullscreen operates on the current runtime surface and has an expanded embedded fallback", () => {
  assert.match(runtime, /root\.requestFullscreen\(\)/);
  assert.match(runtime, /document\.exitFullscreen\(\)/);
  assert.match(runtime, /setExpandedFallback\(true\)/);
  assert.match(runtime, /FULLSCREEN_FAILED/);
});

test("audio priority pauses and deliberately restores the global player", () => {
  assert.match(runtime, /requestAudioPriority\(runtimeId\)/);
  assert.match(runtime, /releaseAudioPriority\(runtimeId\)/);
  assert.match(player, /resumeAfterExperienceRef\.current = playingRef\.current/);
  assert.match(player, /if \(resumeAfterExperienceRef\.current\) setPlaying\(true\)/);
});

test("focus, Escape, fallback, and unmount cleanup remain explicit", () => {
  assert.match(runtime, /rootRef\.current\?\.focus\(\)/);
  assert.match(runtime, /launchButtonRef\.current\?\.focus\(\)/);
  assert.match(runtime, /event\.key === "Escape"/);
  assert.match(runtime, /status === "fallback"/);
  assert.match(runtime, /useEffect\(\(\) => \(\) => releaseAudioPriority\(runtimeId\)/);
  assert.match(runtime, /dispatch\(\{ type: "INTERRUPT" \}\)/);
  assert.match(runtime, /dispatch\(\{ type: "RESOLVE" \}\)/);
  assert.match(runtime, /dispatch\(\{ type: "UPDATE" \}\)/);
});
