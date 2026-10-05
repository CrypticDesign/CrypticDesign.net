import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../components/AvatarStudio.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("the avatar viewer exposes keyboard rotation, zoom, reset, and a visible focus state", () => {
  assert.match(component, /role="group" tabIndex=\{0\}/);
  assert.match(component, /avatarViewCommandForKey\(event\.key\)/);
  assert.match(component, /aria-describedby=\{`\$\{controlsId\} \$\{summaryId\}`\}/);
  assert.match(styles, /\.avatar-stage:focus-visible/);
});

test("the avatar viewer exposes the same inspection commands as visible controls", () => {
  assert.match(component, /role="toolbar" aria-label="Character preview controls"/);
  assert.match(component, /aria-label="Rotate character left"/);
  assert.match(component, /aria-label="Zoom in"/);
  assert.match(component, />Full<\/button>/);
  assert.match(component, />Portrait<\/button>/);
  assert.match(component, />Detail<\/button>/);
  assert.match(component, />Reset<\/button>/);
  assert.match(styles, /\.avatar-stage__toolbar button\{width:auto;min-width:44px;min-height:44px/);
});

test("the viewer exposes deterministic view presets and a renderer-independent recipe summary", () => {
  assert.match(component, /AVATAR_VIEW_PRESETS\[command\.mode\]/);
  assert.match(component, /describeAvatarRecipe\(recipe\)/);
  assert.match(component, /className="avatar-stage__summary"/);
  assert.match(component, /aria-live="polite"/);
});

test("the viewer swaps to its static fallback when WebGL is unavailable or loses context", () => {
  assert.match(component, /catch \{ element\.dataset\.fallback = "true"/);
  assert.match(component, /"webglcontextlost", contextLost/);
  assert.match(component, /"webglcontextrestored", contextRestored/);
  assert.match(styles, /\.avatar-stage__viewport\[data-fallback="true"\] canvas\{display:none\}/);
  assert.match(styles, /\.avatar-stage__viewport\[data-fallback="true"\] \.avatar-fallback\{display:grid\}/);
});

test("reduced motion avoids the continuous animation loop while preserving direct controls", () => {
  assert.match(component, /!reduce && !document\.hidden && inViewport/);
  assert.match(component, /motionQuery\.addEventListener\("change", motionChanged\)/);
  assert.match(component, /new IntersectionObserver/);
  assert.match(component, /document\.addEventListener\("visibilitychange", visibilityChanged\)/);
});

test("viewer cleanup releases GPU resources and its WebGL context", () => {
  assert.match(component, /material\.dispose\(\)/);
  assert.match(component, /renderer\.dispose\(\)/);
  assert.match(component, /renderer\.forceContextLoss\(\)/);
});
