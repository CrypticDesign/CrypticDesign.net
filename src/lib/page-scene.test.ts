import assert from "node:assert/strict";
import test from "node:test";

import { PAGE_SCENES, resolvePageSceneQuality } from "./page-scene.ts";

const capable = {
  reducedMotion: false,
  webglSupported: true,
  viewportWidth: 1440,
  deviceMemory: 8,
  hardwareConcurrency: 8,
};

test("keeps every public scene in one governed registry", () => {
  assert.deepEqual(Object.keys(PAGE_SCENES), ["public-home", "entertainment", "community", "professional"]);
  assert.ok(PAGE_SCENES["public-home"].particleCount.high > PAGE_SCENES["public-home"].particleCount.mid);
});

test("uses one canonical destination accent for every WebGL material", () => {
  const expectedAccents = {
    "public-home": 0x1e90ff,
    entertainment: 0x00ffff,
    community: 0x00ff7f,
    professional: 0xffff33,
  } as const;

  for (const [sceneId, accent] of Object.entries(expectedAccents)) {
    const scene = PAGE_SCENES[sceneId as keyof typeof PAGE_SCENES];
    assert.equal(scene.primary, accent);
    assert.equal(scene.secondary, accent);
  }
});

test("uses a static low tier for reduced motion, constrained mobile, save-data, or missing WebGL", () => {
  assert.equal(resolvePageSceneQuality({ ...capable, reducedMotion: true }), "low");
  assert.equal(resolvePageSceneQuality({ ...capable, viewportWidth: 480 }), "low");
  assert.equal(resolvePageSceneQuality({ ...capable, saveData: true }), "low");
  assert.equal(resolvePageSceneQuality({ ...capable, webglSupported: false }), "low");
});

test("selects conservative automatic tiers and honors explicit quality after hard constraints", () => {
  assert.equal(resolvePageSceneQuality(capable), "high");
  assert.equal(resolvePageSceneQuality({ ...capable, deviceMemory: 4 }), "mid");
  assert.equal(resolvePageSceneQuality({ ...capable, requested: "mid" }), "mid");
  assert.equal(resolvePageSceneQuality({ ...capable, requested: "high", reducedMotion: true }), "low");
});
