export type AssetKind = "body" | "hair" | "wardrobe" | "trait" | "signal";

export interface AvatarAssetDefinition {
  id: string;
  kind: AssetKind;
  rigIds: string[];
  slot: string;
  layer: number;
  conflictsWith: string[];
  fallbackAssetId: string | null;
  active: boolean;
}

export interface CompatibilitySelection {
  rigId: string;
  assetIds: string[];
}

export interface CompatibilityIssue {
  code: "unknown_asset" | "inactive_asset" | "rig_mismatch" | "slot_conflict" | "explicit_conflict";
  assetIds: string[];
  message: string;
}

export interface CompatibilityFallback {
  replacedAssetId: string;
  fallbackAssetId: string;
  reason: string;
}

export interface CompatibilityReport {
  valid: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  proposedFallbacks: CompatibilityFallback[];
  manifestVersion: string;
}

export function evaluateAvatarCompatibility(input: { selection: CompatibilitySelection; assets: AvatarAssetDefinition[]; manifestVersion: string }): CompatibilityReport {
  const byId = new Map(input.assets.map((asset) => [asset.id, asset]));
  const errors: CompatibilityIssue[] = [];
  const warnings: CompatibilityIssue[] = [];
  const proposedFallbacks: CompatibilityFallback[] = [];
  const selected: AvatarAssetDefinition[] = [];
  for (const id of input.selection.assetIds) {
    const asset = byId.get(id);
    if (!asset) errors.push({ code: "unknown_asset", assetIds: [id], message: `Asset ${id} is not in manifest ${input.manifestVersion}` });
    else selected.push(asset);
  }
  for (const asset of selected) {
    if (!asset.active) errors.push({ code: "inactive_asset", assetIds: [asset.id], message: `Asset ${asset.id} is inactive` });
    if (!asset.rigIds.includes(input.selection.rigId)) {
      errors.push({ code: "rig_mismatch", assetIds: [asset.id], message: `Asset ${asset.id} does not support rig ${input.selection.rigId}` });
      if (asset.fallbackAssetId) proposedFallbacks.push({ replacedAssetId: asset.id, fallbackAssetId: asset.fallbackAssetId, reason: "rig_mismatch" });
    }
  }
  const slots = new Map<string, AvatarAssetDefinition[]>();
  for (const asset of selected) slots.set(asset.slot, [...(slots.get(asset.slot) ?? []), asset]);
  for (const [slot, assets] of slots) {
    const byLayer = new Map<number, AvatarAssetDefinition[]>();
    for (const asset of assets) byLayer.set(asset.layer, [...(byLayer.get(asset.layer) ?? []), asset]);
    for (const sameLayer of byLayer.values()) if (sameLayer.length > 1) errors.push({ code: "slot_conflict", assetIds: sameLayer.map(({ id }) => id).sort(), message: `Multiple assets occupy ${slot} layer ${sameLayer[0].layer}` });
  }
  const emitted = new Set<string>();
  for (const asset of selected) for (const conflictId of asset.conflictsWith) {
    if (!input.selection.assetIds.includes(conflictId)) continue;
    const ids = [asset.id, conflictId].sort();
    const key = ids.join(":");
    if (emitted.has(key)) continue;
    emitted.add(key);
    errors.push({ code: "explicit_conflict", assetIds: ids, message: `Assets ${ids.join(" and ")} are incompatible` });
  }
  return { valid: errors.length === 0, errors, warnings, proposedFallbacks, manifestVersion: input.manifestVersion };
}
