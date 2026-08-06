import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("uses the approved Singularis marketing artwork for first contact", () => {
  assert.match(component, /state\.phase === "arrival" && <div className="sin-cgs__hero-art">/);
  assert.match(component, /src="\/images\/singularis-marketing-02\.jpg"/);
  assert.equal(existsSync("public/images/singularis-marketing-02.jpg"), true);
});

test("keeps franchise navigation in a collapsible left workspace rail", () => {
  assert.match(component, /id="singularis-franchise-drawer" className="sin-cgs__nav-rail"/);
  assert.match(component, /className="sin-cgs__nav-toggle"/);
  assert.match(component, /data-nav-open=\{franchiseDrawerOpen\}/);
  assert.match(component, /aria-current=\{workspaceSection === section\.id \? "page" : undefined\}/);
  assert.match(component, /data-runtime-file=\{`\/games\/singularis\/workspaces\/\$\{section\.id\}\/index\.html`\}/);
  assert.match(component, /workspaceSection !== "mission-control" \? <iframe/);
  assert.match(component, /className="sin-cgs__nav-menu"/);
  assert.doesNotMatch(component, /cryptic:arcade-drawer/);
});

test("resets document scroll after Singularis phase navigation", () => {
  assert.match(component, /previousPhaseRef = useRef\(state\.phase\)/);
  assert.match(component, /window\.requestAnimationFrame\(\(\) => window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)\)/);
  assert.doesNotMatch(component, /history\.scrollRestoration/);
});

test("v05 exposes a versioned same-origin page bridge", () => {
  assert.match(build, /source:'singularis-v05'/);
  assert.match(build, /contractVersion:1/);
  assert.match(build, /'runtime-ready'/);
  assert.match(build, /'operation-ended'/);
  assert.match(build, /window\.parent\.postMessage/);
  assert.match(build, /'s-gate'\)\.addEventListener\('pointerdown'/);
});
