export interface RendererPerformanceBudget {
  version: string;
  maxLoadMilliseconds: number;
  maxFirstFrameMilliseconds: number;
  minSustainedFramesPerSecond: number;
  maxGpuMemoryBytes: number;
  maxContextRecoveryMilliseconds: number;
  maxResidualResourcesAfterDisposal: number;
  minSampleSeconds: number;
}

export interface RendererFeasibilityEvidence {
  evidenceId: string;
  assetId: string;
  assetSha256: string;
  budgetVersion: string;
  capturedAt: string;
  deviceProfile: string;
  browserName: string;
  synthetic: boolean;
  rigBound: boolean;
  cameraFramed: boolean;
  materialVariantApplied: boolean;
  wardrobeAttached: boolean;
  staticPortraitCaptured: boolean;
  staticFullBodyCaptured: boolean;
  contextRecovered: boolean;
  resourcesDisposed: boolean;
  measurements: {
    loadMilliseconds: number;
    firstFrameMilliseconds: number;
    sustainedFramesPerSecond: number;
    gpuMemoryBytes: number;
    contextRecoveryMilliseconds: number;
    residualResourcesAfterDisposal: number;
    sampleSeconds: number;
  };
}

export interface RendererEvidenceIssue {
  code: "invalid_evidence" | "synthetic_evidence" | "asset_mismatch" | "budget_mismatch" | "capability_missing" | "invalid_measurement" | "performance_budget_exceeded";
  field: string;
  message: string;
}

export interface RendererEvidenceReport {
  passed: boolean;
  evidenceId: string;
  issues: RendererEvidenceIssue[];
}

const capabilities = ["rigBound", "cameraFramed", "materialVariantApplied", "wardrobeAttached", "staticPortraitCaptured", "staticFullBodyCaptured", "contextRecovered", "resourcesDisposed"] as const;

export function evaluateRendererEvidence(input: { evidence: RendererFeasibilityEvidence; budget: RendererPerformanceBudget; expectedAssetId: string; expectedSha256: string }): RendererEvidenceReport {
  const { evidence, budget } = input;
  const issues: RendererEvidenceIssue[] = [];
  const capturedAt = Date.parse(evidence.capturedAt);
  if (!evidence.evidenceId.trim() || !evidence.deviceProfile.trim() || !evidence.browserName.trim() || !Number.isFinite(capturedAt)) {
    issues.push({ code: "invalid_evidence", field: "identity", message: "Evidence identity, device, browser, and timestamp are required" });
  }
  if (evidence.synthetic) issues.push({ code: "synthetic_evidence", field: "synthetic", message: "Synthetic or mocked evidence cannot satisfy renderer feasibility" });
  if (evidence.assetId !== input.expectedAssetId || evidence.assetSha256 !== input.expectedSha256) {
    issues.push({ code: "asset_mismatch", field: "asset", message: "Evidence must bind to the approved asset ID and checksum" });
  }
  if (!budget.version.trim() || evidence.budgetVersion !== budget.version) {
    issues.push({ code: "budget_mismatch", field: "budgetVersion", message: "Evidence must use the supplied approved budget version" });
  }
  for (const field of capabilities) if (!evidence[field]) {
    issues.push({ code: "capability_missing", field, message: `${field} was not demonstrated` });
  }
  for (const [field, value] of Object.entries(evidence.measurements)) if (!Number.isFinite(value) || value < 0) {
    issues.push({ code: "invalid_measurement", field: `measurements.${field}`, message: `${field} must be a non-negative finite measurement` });
  }
  const comparisons: Array<[keyof RendererFeasibilityEvidence["measurements"], number, "max" | "min"]> = [
    ["loadMilliseconds", budget.maxLoadMilliseconds, "max"],
    ["firstFrameMilliseconds", budget.maxFirstFrameMilliseconds, "max"],
    ["sustainedFramesPerSecond", budget.minSustainedFramesPerSecond, "min"],
    ["gpuMemoryBytes", budget.maxGpuMemoryBytes, "max"],
    ["contextRecoveryMilliseconds", budget.maxContextRecoveryMilliseconds, "max"],
    ["residualResourcesAfterDisposal", budget.maxResidualResourcesAfterDisposal, "max"],
    ["sampleSeconds", budget.minSampleSeconds, "min"],
  ];
  for (const [field, limit, direction] of comparisons) {
    if (!Number.isFinite(limit) || limit < 0) {
      issues.push({ code: "invalid_measurement", field: `budget.${field}`, message: `Budget limit for ${field} is invalid` });
      continue;
    }
    const value = evidence.measurements[field];
    if (Number.isFinite(value) && (direction === "max" ? value > limit : value < limit)) {
      issues.push({ code: "performance_budget_exceeded", field: `measurements.${field}`, message: `${field} ${value} fails ${direction}imum ${limit}` });
    }
  }
  return { passed: issues.length === 0, evidenceId: evidence.evidenceId, issues };
}
