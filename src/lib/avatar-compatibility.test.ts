import assert from "node:assert/strict";
import test from "node:test";

import { evaluateAvatarCompatibility, type AvatarAssetDefinition } from "./avatar-compatibility.ts";

const assets: AvatarAssetDefinition[] = [
  { id: "body-base", kind: "body", rigIds: ["humanoid-v2"], slot: "body", layer: 0, conflictsWith: [], fallbackAssetId: null, active: true },
  { id: "shirt-blue", kind: "wardrobe", rigIds: ["humanoid-v2"], slot: "torso", layer: 1, conflictsWith: [], fallbackAssetId: null, active: true },
  { id: "shirt-gold", kind: "wardrobe", rigIds: ["humanoid-v2"], slot: "torso", layer: 1, conflictsWith: [], fallbackAssetId: null, active: true },
  { id: "legacy-hair", kind: "hair", rigIds: ["humanoid-v1"], slot: "head", layer: 1, conflictsWith: [], fallbackAssetId: "hair-neutral", active: true },
  { id: "hair-neutral", kind: "hair", rigIds: ["humanoid-v2"], slot: "head", layer: 1, conflictsWith: [], fallbackAssetId: null, active: true },
  { id: "crest", kind: "trait", rigIds: ["humanoid-v2"], slot: "head", layer: 2, conflictsWith: ["wide-hat"], fallbackAssetId: null, active: true },
  { id: "wide-hat", kind: "wardrobe", rigIds: ["humanoid-v2"], slot: "head", layer: 3, conflictsWith: ["crest"], fallbackAssetId: null, active: true },
];

test("accepts a deterministic compatible selection without WebGL", () => {
  const report = evaluateAvatarCompatibility({ selection: { rigId: "humanoid-v2", assetIds: ["body-base", "shirt-blue", "hair-neutral"] }, assets, manifestVersion: "manifest-1" });
  assert.deepEqual(report, { valid: true, errors: [], warnings: [], proposedFallbacks: [], manifestVersion: "manifest-1" });
});

test("reports unknown assets, same-layer collisions, and explicit conflicts", () => {
  const report = evaluateAvatarCompatibility({ selection: { rigId: "humanoid-v2", assetIds: ["missing", "shirt-blue", "shirt-gold", "crest", "wide-hat"] }, assets, manifestVersion: "manifest-1" });
  assert.equal(report.valid, false);
  assert.deepEqual(report.errors.map(({ code }) => code).sort(), ["explicit_conflict", "slot_conflict", "unknown_asset"]);
});

test("proposes an authored fallback for a rig mismatch", () => {
  const report = evaluateAvatarCompatibility({ selection: { rigId: "humanoid-v2", assetIds: ["legacy-hair"] }, assets, manifestVersion: "manifest-1" });
  assert.equal(report.valid, false);
  assert.deepEqual(report.proposedFallbacks, [{ replacedAssetId: "legacy-hair", fallbackAssetId: "hair-neutral", reason: "rig_mismatch" }]);
});
