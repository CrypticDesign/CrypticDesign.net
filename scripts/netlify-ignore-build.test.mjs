import assert from "node:assert/strict";
import test from "node:test";

import {
  isDeployRelevantPath,
  shouldIgnoreBuild,
} from "./netlify-ignore-build.mjs";

test("production builds continue for deploy-relevant application changes", () => {
  for (const filePath of [
    "src/app/page.tsx",
    "public/images/home.webp",
    "protected-experiences/singularis/index.html",
    "next.config.ts",
    "package-lock.json",
    "postcss.config.mjs",
    "scripts/runtime-generator.mjs",
  ]) {
    assert.equal(isDeployRelevantPath(filePath), true, filePath);
  }

  assert.equal(
    shouldIgnoreBuild({
      context: "production",
      changedFiles: ["docs/runbook.md", "src/app/page.tsx"],
    }),
    false,
  );
});

test("production builds are ignored for non-deploy-only changes", () => {
  const changedFiles = [
    ".github/workflows/verify.yml",
    "artifacts/CRY-242/README.md",
    "docs/runbook.md",
    "src/lib/example.test.ts",
    "tests/account-flow.e2e.mjs",
    "tracking/plan.md",
    "README.md",
  ];

  assert.equal(changedFiles.every((filePath) => !isDeployRelevantPath(filePath)), true);
  assert.equal(
    shouldIgnoreBuild({ context: "production", changedFiles }),
    true,
  );
});

test("deploy previews and branch deploys are never filtered", () => {
  for (const context of ["deploy-preview", "branch-deploy", "dev", ""]) {
    assert.equal(
      shouldIgnoreBuild({ context, changedFiles: ["docs/runbook.md"] }),
      false,
      context,
    );
  }
});
