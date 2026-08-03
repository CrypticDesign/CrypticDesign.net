import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync("src/components/SingularisGamespace.tsx", "utf8");
const build = readFileSync("public/games/singularis/v05/index.html", "utf8");

test("embeds the verified v05 build only for the Operation runtime", () => {
  assert.match(component, /state\.phase === "operation" \? <iframe/);
  assert.match(component, /src="\/games\/singularis\/v05\/index\.html"/);
  assert.match(component, /title="Singularis Leviathan Protocol v05 game runtime"/);
});

test("keeps the embedded runtime in a stable parent render tree", () => {
  assert.match(component, /const renderUniverse = \(active = false\) =>/);
  assert.match(component, /\{renderUniverse\(immersive\)\}/);
  assert.doesNotMatch(component, /const Universe =/);
  assert.doesNotMatch(component, /<Universe\b/);
});

test("v05 exposes a versioned same-origin page bridge", () => {
  assert.match(build, /source:'singularis-v05'/);
  assert.match(build, /contractVersion:1/);
  assert.match(build, /'runtime-ready'/);
  assert.match(build, /'operation-ended'/);
  assert.match(build, /window\.parent\.postMessage/);
  assert.match(build, /'s-gate'\)\.addEventListener\('pointerdown'/);
});
