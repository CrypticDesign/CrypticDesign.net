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
