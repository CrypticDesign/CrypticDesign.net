import path from "node:path";

const RUNTIME_ROOT = path.join(
  process.cwd(),
  "protected-experiences",
  "singularis",
);

export const SINGULARIS_RUNTIME_ASSET_MANIFEST = {
  "v05/index.html": "v05/index.html",
  "workspaces/arsenal/index.html": "workspaces/arsenal/index.html",
  "workspaces/codex/index.html": "workspaces/codex/index.html",
  "workspaces/hangar/index.html": "workspaces/hangar/index.html",
  "workspaces/pilot/index.html": "workspaces/pilot/index.html",
  "workspaces/war-effort/index.html": "workspaces/war-effort/index.html",
} as const;

export type SingularisRuntimeAssetKey = keyof typeof SINGULARIS_RUNTIME_ASSET_MANIFEST;

export interface SingularisRuntimeAsset {
  key: SingularisRuntimeAssetKey;
  absolutePath: string;
  contentType: "text/html; charset=utf-8";
}

export function resolveSingularisRuntimeAsset(
  pathSegments: readonly string[],
): SingularisRuntimeAsset | null {
  if (pathSegments.length === 0 || pathSegments.some((segment) =>
    !segment
    || segment === "."
    || segment === ".."
    || segment.includes("/")
    || segment.includes("\\")
    || segment.includes("%")
    || segment.includes("\0"),
  )) return null;

  const key = pathSegments.join("/") as SingularisRuntimeAssetKey;
  if (!Object.hasOwn(SINGULARIS_RUNTIME_ASSET_MANIFEST, key)) return null;
  const relativePath = SINGULARIS_RUNTIME_ASSET_MANIFEST[key];
  if (!relativePath) return null;

  const absolutePath = path.resolve(RUNTIME_ROOT, ...relativePath.split("/"));
  const relativeToRoot = path.relative(RUNTIME_ROOT, absolutePath);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) return null;

  return { key, absolutePath, contentType: "text/html; charset=utf-8" };
}
