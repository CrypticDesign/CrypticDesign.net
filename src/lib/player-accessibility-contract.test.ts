import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const player = readFileSync(new URL("../components/player/FabMediaPlayer.tsx", import.meta.url), "utf8");

test("the global player uses a stable accessible panel relationship across server-rendered routes", () => {
  assert.match(player, /const PANEL_ID = "cryptic-signal-player-panel"/);
  assert.match(player, /aria-controls=\{panelId\}/);
  assert.match(player, /id=\{panelId\}/);
  assert.doesNotMatch(player, /useId/);
});
