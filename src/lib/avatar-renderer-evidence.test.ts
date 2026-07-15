import assert from "node:assert/strict";
import test from "node:test";

import { evaluateRendererEvidence, type RendererFeasibilityEvidence, type RendererPerformanceBudget } from "./avatar-renderer-evidence.ts";

const sha = "b".repeat(64);
const budget: RendererPerformanceBudget = { version: "fixture-budget-v1", maxLoadMilliseconds: 2000, maxFirstFrameMilliseconds: 2500, minSustainedFramesPerSecond: 30, maxGpuMemoryBytes: 128_000_000, maxContextRecoveryMilliseconds: 1000, maxResidualResourcesAfterDisposal: 0, minSampleSeconds: 30 };
const evidence: RendererFeasibilityEvidence = {
  evidenceId: "evidence-1", assetId: "avatar-1", assetSha256: sha, budgetVersion: budget.version, capturedAt: "2026-07-14T12:00:00Z", deviceProfile: "desktop-test", browserName: "browser-test", synthetic: false,
  rigBound: true, cameraFramed: true, materialVariantApplied: true, wardrobeAttached: true, staticPortraitCaptured: true, staticFullBodyCaptured: true, contextRecovered: true, resourcesDisposed: true,
  measurements: { loadMilliseconds: 800, firstFrameMilliseconds: 1000, sustainedFramesPerSecond: 60, gpuMemoryBytes: 64_000_000, contextRecoveryMilliseconds: 400, residualResourcesAfterDisposal: 0, sampleSeconds: 60 },
};

test("accepts complete real-browser evidence bound to an asset and budget", () => {
  assert.deepEqual(evaluateRendererEvidence({ evidence, budget, expectedAssetId: "avatar-1", expectedSha256: sha }), { passed: true, evidenceId: "evidence-1", issues: [] });
});

test("rejects synthetic evidence even when every reported result passes", () => {
  const report = evaluateRendererEvidence({ evidence: { ...evidence, synthetic: true }, budget, expectedAssetId: "avatar-1", expectedSha256: sha });
  assert.equal(report.passed, false);
  assert.equal(report.issues.some(({ code }) => code === "synthetic_evidence"), true);
});

test("requires exact asset checksum and budget version binding", () => {
  const report = evaluateRendererEvidence({ evidence: { ...evidence, assetSha256: "c".repeat(64), budgetVersion: "old" }, budget, expectedAssetId: "avatar-1", expectedSha256: sha });
  assert.deepEqual(report.issues.map(({ code }) => code), ["asset_mismatch", "budget_mismatch"]);
});

test("requires every visual, fallback, recovery, and disposal capability", () => {
  const report = evaluateRendererEvidence({ evidence: { ...evidence, cameraFramed: false, staticPortraitCaptured: false, resourcesDisposed: false }, budget, expectedAssetId: "avatar-1", expectedSha256: sha });
  assert.deepEqual(report.issues.filter(({ code }) => code === "capability_missing").map(({ field }) => field), ["cameraFramed", "staticPortraitCaptured", "resourcesDisposed"]);
});

test("reports invalid and out-of-budget measurements independently", () => {
  const report = evaluateRendererEvidence({ evidence: { ...evidence, measurements: { ...evidence.measurements, loadMilliseconds: Number.NaN, sustainedFramesPerSecond: 29, gpuMemoryBytes: 128_000_001, sampleSeconds: 29 } }, budget, expectedAssetId: "avatar-1", expectedSha256: sha });
  assert.equal(report.passed, false);
  assert.equal(report.issues.filter(({ code }) => code === "invalid_measurement").length, 1);
  assert.deepEqual(report.issues.filter(({ code }) => code === "performance_budget_exceeded").map(({ field }) => field), ["measurements.sustainedFramesPerSecond", "measurements.gpuMemoryBytes", "measurements.sampleSeconds"]);
});
