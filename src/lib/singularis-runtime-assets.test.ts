import assert from "node:assert/strict";
import test from "node:test";

import {
  SINGULARIS_RUNTIME_ASSET_MANIFEST,
  resolveSingularisRuntimeAsset,
} from "./singularis-runtime-assets.ts";

test("resolves every approved Singularis runtime through the fixed manifest", () => {
  for (const key of Object.keys(SINGULARIS_RUNTIME_ASSET_MANIFEST)) {
    const asset = resolveSingularisRuntimeAsset(key.split("/"));
    assert.equal(asset?.key, key);
    assert.equal(asset?.absolutePath.includes("protected-experiences"), true);
  }
});

test("rejects unknown, sibling, separator, percent-encoded, and traversal inputs", () => {
  const rejected = [
    [],
    ["v06", "index.html"],
    ["v05", "secrets.txt"],
    ["..", "package.json"],
    ["%2e%2e", "package.json"],
    ["v05/index.html"],
    ["v05\\index.html"],
    ["", "index.html"],
  ];
  for (const candidate of rejected) {
    assert.equal(resolveSingularisRuntimeAsset(candidate), null, candidate.join("/"));
  }
});
