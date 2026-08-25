import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../components/PageScene.tsx", import.meta.url), "utf8");

test("WebGL capability probing is cached and releases its temporary context", () => {
  assert.match(component, /let cachedWebGLSupport: boolean \| undefined/);
  assert.match(component, /if \(cachedWebGLSupport !== undefined\) return cachedWebGLSupport/);
  assert.match(component, /getExtension\("WEBGL_lose_context"\)\?\.loseContext\(\)/);
});

test("route scene cleanup releases renderer resources and its live context", () => {
  assert.match(component, /scene\.traverse/);
  assert.match(component, /loadedTextures\.forEach\(\(texture\) => texture\.dispose\(\)\)/);
  assert.match(component, /renderer\.dispose\(\)/);
  assert.match(component, /renderer\.forceContextLoss\(\)/);
});

test("the scene reserves its secondary accent for one lower-opacity orbital ring", () => {
  assert.match(component, /color: index === 1 \? definition\.secondary : definition\.primary/);
  assert.match(component, /opacity: index === 1 \? 0\.48 : 0\.7/);
});
