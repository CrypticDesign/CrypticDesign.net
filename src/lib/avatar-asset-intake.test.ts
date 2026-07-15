import assert from "node:assert/strict";
import test from "node:test";

import { evaluateAvatarAssetIntake, type AvatarAssetBudget, type AvatarAssetManifest } from "./avatar-asset-intake.ts";

const budget: AvatarAssetBudget = { version: "test-budget-v1", maxFileBytes: 4_000_000, maxTriangles: 50_000, maxDrawCalls: 20, maxTextureBytes: 8_000_000, maxTextureDimension: 2048, maxBones: 100, maxMorphTargets: 32 };
const manifest: AvatarAssetManifest = {
  assetId: "owned-test-avatar-v1",
  format: "glb",
  localPath: "/assets/avatar/owned-test-avatar-v1.glb",
  sha256: "a".repeat(64),
  rights: { owner: "Cryptic Design", provenanceRecordId: "PROV-1", approvedForTesting: true, thirdPartyRestrictions: [] },
  exportVersion: "export-v1",
  rigId: "cryptic-humanoid-v1",
  metrics: { fileBytes: 2_000_000, triangles: 25_000, drawCalls: 10, textureBytes: 4_000_000, maxTextureDimension: 1024, bones: 70, morphTargets: 12 },
};

test("accepts an owned local GLB with immutable provenance inside a versioned budget", () => {
  assert.deepEqual(evaluateAvatarAssetIntake({ manifest, budget }), { accepted: true, assetId: manifest.assetId, budgetVersion: budget.version, issues: [] });
});

test("rejects remote, traversal, and non-GLB sources", () => {
  for (const localPath of ["https://example.com/avatar.glb", "/assets/../avatar.glb", "/assets/avatar.gltf"]) {
    const report = evaluateAvatarAssetIntake({ manifest: { ...manifest, localPath }, budget });
    assert.equal(report.accepted, false);
    assert.equal(report.issues.some(({ code }) => code === "non_local_source"), true);
  }
});

test("fails closed when provenance, approval, checksum, or unrestricted ownership is absent", () => {
  const report = evaluateAvatarAssetIntake({ manifest: { ...manifest, sha256: "not-a-checksum", rights: { owner: "", provenanceRecordId: "", approvedForTesting: false, thirdPartyRestrictions: ["editorial use only"] } }, budget });
  assert.equal(report.accepted, false);
  assert.deepEqual(report.issues.map(({ code }) => code).sort(), ["invalid_checksum", "restricted_rights", "rights_not_approved"]);
});

test("reports each exceeded measurable budget with the budget version", () => {
  const report = evaluateAvatarAssetIntake({ manifest: { ...manifest, metrics: { ...manifest.metrics, triangles: 50_001, drawCalls: 21 } }, budget });
  assert.equal(report.accepted, false);
  assert.equal(report.budgetVersion, "test-budget-v1");
  assert.deepEqual(report.issues.map(({ field }) => field), ["metrics.triangles", "metrics.drawCalls"]);
});

test("rejects malformed metric and budget values instead of comparing them", () => {
  const report = evaluateAvatarAssetIntake({ manifest: { ...manifest, metrics: { ...manifest.metrics, bones: -1 } }, budget: { ...budget, maxMorphTargets: Number.NaN } });
  assert.equal(report.accepted, false);
  assert.deepEqual(report.issues.filter(({ code }) => code === "invalid_metrics").map(({ field }) => field), ["metrics.bones", "metrics.morphTargets"]);
});
