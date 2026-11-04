import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("uses the global FAB player without page-level embedded player stubs", () => {
  const layout = readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
  assert.match(layout, /<FabMediaPlayer \/>/);
  assert.match(layout, /<PlayerProvider>/);

  for (const file of [
    "src/app/entertainment/page.tsx",
    "src/app/professional/page.tsx",
    "src/app/professional/case-studies/page.tsx",
    "src/components/MyHomeDashboard.tsx",
  ]) {
    assert.doesNotMatch(readFileSync(path.join(root, file), "utf8"), /PlayerDock|player-dock/);
  }
  assert.equal(existsSync(path.join(root, "src/components/PlayerDock.tsx")), false);
});

test("the shared player exposes truthful operational and accessibility states", () => {
  const provider = readFileSync(path.join(root, "src/components/player/PlayerProvider.tsx"), "utf8");
  const surface = readFileSync(path.join(root, "src/components/player/FabMediaPlayer.tsx"), "utf8");

  assert.equal((provider.match(/<audio\s/g) ?? []).length, 1, "the provider owns one audio element");
  for (const handler of ["onLoadStart", "onCanPlay", "onPlaying", "onWaiting", "onStalled", "onError"]) {
    assert.match(provider, new RegExp(handler), handler);
  }
  assert.match(provider, /window\.addEventListener\("offline"/);
  assert.match(provider, /setPlaybackStatus\("interrupted"\)/);
  assert.match(provider, /liveSourceStatus\("error"\)/);
  assert.match(provider, /if \(audioPriorityOwnerRef\.current\) return "interrupted"/);
  assert.match(provider, /const attachedAudioSource = hasAudioSource && playbackStatus !== "idle"/);
  assert.match(provider, /src=\{attachedAudioSource\}/);
  assert.match(provider, /preload="none"/);
  assert.doesNotMatch(provider, /preload="metadata"/);
  assert.doesNotMatch(provider, /preview clock/i);

  assert.match(surface, /role="status"/);
  assert.match(surface, /aria-live="polite"/);
  assert.match(surface, />Try again</);
  assert.match(surface, /disabled=\{playbackBlocked\}/);
  assert.match(surface, /No chapters/);
  assert.match(surface, /No transcript/);
});

test("the shared player exposes stable track sharing without autoplaying deep links", () => {
  const provider = readFileSync(path.join(root, "src/components/player/PlayerProvider.tsx"), "utf8");
  const surface = readFileSync(path.join(root, "src/components/player/FabMediaPlayer.tsx"), "utf8");
  const model = readFileSync(path.join(root, "src/lib/player.ts"), "utf8");

  assert.match(model, /playerTrackSharePath/);
  assert.match(model, /encodeURIComponent\(track\.id\)/);
  assert.match(provider, /PLAYER_TRACK_QUERY_PARAM/);
  assert.match(provider, /playerTrackIndexById/);
  assert.match(provider, /setPlaying\(false\)/);
  assert.match(provider, /setExpanded\(true\)/);

  assert.match(surface, /navigator\.share/);
  assert.match(surface, /navigator\.clipboard\.writeText/);
  assert.match(surface, /playerTrackSharePath\(/);
  assert.match(surface, /ShareIcon/);
  assert.match(surface, /role="status" aria-live="polite"/);
  assert.doesNotMatch(surface, /track\.src[^\n]+share|share[^\n]+track\.src/i);
});
