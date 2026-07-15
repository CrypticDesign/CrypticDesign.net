export interface AvatarAssetManifest {
  assetId: string;
  format: "glb";
  localPath: string;
  sha256: string;
  rights: {
    owner: string;
    provenanceRecordId: string;
    approvedForTesting: boolean;
    thirdPartyRestrictions: string[];
  };
  exportVersion: string;
  rigId: string;
  metrics: {
    fileBytes: number;
    triangles: number;
    drawCalls: number;
    textureBytes: number;
    maxTextureDimension: number;
    bones: number;
    morphTargets: number;
  };
}

export interface AvatarAssetBudget {
  version: string;
  maxFileBytes: number;
  maxTriangles: number;
  maxDrawCalls: number;
  maxTextureBytes: number;
  maxTextureDimension: number;
  maxBones: number;
  maxMorphTargets: number;
}

export type AssetIntakeIssueCode =
  | "invalid_identity"
  | "non_local_source"
  | "invalid_checksum"
  | "rights_not_approved"
  | "restricted_rights"
  | "invalid_metrics"
  | "budget_exceeded";

export interface AssetIntakeIssue {
  code: AssetIntakeIssueCode;
  field: string;
  message: string;
}

export interface AssetIntakeReport {
  accepted: boolean;
  assetId: string;
  budgetVersion: string;
  issues: AssetIntakeIssue[];
}

const metricBudgetFields = [
  ["fileBytes", "maxFileBytes"],
  ["triangles", "maxTriangles"],
  ["drawCalls", "maxDrawCalls"],
  ["textureBytes", "maxTextureBytes"],
  ["maxTextureDimension", "maxTextureDimension"],
  ["bones", "maxBones"],
  ["morphTargets", "maxMorphTargets"],
] as const;

function isSafeLocalAssetPath(value: string): boolean {
  return value.startsWith("/assets/") && !value.includes("..") && !value.includes("://") && value.toLowerCase().endsWith(".glb");
}

export function evaluateAvatarAssetIntake(input: { manifest: AvatarAssetManifest; budget: AvatarAssetBudget }): AssetIntakeReport {
  const { manifest, budget } = input;
  const issues: AssetIntakeIssue[] = [];
  if (!manifest.assetId.trim() || !manifest.exportVersion.trim() || !manifest.rigId.trim() || !budget.version.trim()) {
    issues.push({ code: "invalid_identity", field: "identity", message: "Asset, export, rig, and budget versions are required" });
  }
  if (!isSafeLocalAssetPath(manifest.localPath)) {
    issues.push({ code: "non_local_source", field: "localPath", message: "Avatar assets must be local GLB files under /assets/" });
  }
  if (!/^[a-f0-9]{64}$/.test(manifest.sha256)) {
    issues.push({ code: "invalid_checksum", field: "sha256", message: "A lowercase SHA-256 checksum is required" });
  }
  if (!manifest.rights.owner.trim() || !manifest.rights.provenanceRecordId.trim() || !manifest.rights.approvedForTesting) {
    issues.push({ code: "rights_not_approved", field: "rights", message: "Owned provenance and explicit testing approval are required" });
  }
  if (manifest.rights.thirdPartyRestrictions.length) {
    issues.push({ code: "restricted_rights", field: "rights.thirdPartyRestrictions", message: "Restricted third-party assets cannot enter the owned test pipeline" });
  }
  for (const [metricField, budgetField] of metricBudgetFields) {
    const value = manifest.metrics[metricField];
    const limit = budget[budgetField];
    if (!Number.isSafeInteger(value) || value < 0 || !Number.isSafeInteger(limit) || limit < 0) {
      issues.push({ code: "invalid_metrics", field: `metrics.${metricField}`, message: `${metricField} and its budget must be non-negative safe integers` });
    } else if (value > limit) {
      issues.push({ code: "budget_exceeded", field: `metrics.${metricField}`, message: `${metricField} ${value} exceeds ${budgetField} ${limit}` });
    }
  }
  return { accepted: issues.length === 0, assetId: manifest.assetId, budgetVersion: budget.version, issues };
}
