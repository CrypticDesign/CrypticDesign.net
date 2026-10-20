import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const NON_DEPLOY_PREFIXES = [
  ".github/",
  "artifacts/",
  "docs/",
  "qa-screens/",
  "supabase/",
  "tests/",
  "tracking/",
];

const NON_DEPLOY_FILES = new Set([
  ".env.example",
  ".gitattributes",
  ".gitignore",
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "eslint.config.mjs",
]);

export function isDeployRelevantPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/").replace(/^\.\//, "");
  if (NON_DEPLOY_FILES.has(normalized)) return false;
  if (/(?:^|\/)[^/]+\.test\.(?:[cm]?js|jsx|ts|tsx)$/.test(normalized)) return false;
  return !NON_DEPLOY_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function shouldIgnoreBuild({ context, changedFiles }) {
  // Deploy Previews remain available for every PR because GitHub requires the
  // Netlify preview check. Only production builds are filtered.
  if (context !== "production") return false;
  return !changedFiles.some(isDeployRelevantPath);
}

function validCommitRef(value) {
  return typeof value === "string" && /^[0-9a-f]{7,40}$/i.test(value);
}

export function changedFilesBetween(previousRef, currentRef) {
  if (!validCommitRef(previousRef) || !validCommitRef(currentRef)) return null;

  try {
    const output = execFileSync(
      "git",
      [
        "diff",
        "--name-only",
        "--no-ext-diff",
        "--diff-filter=ACMRTUXB",
        "-z",
        previousRef,
        currentRef,
        "--",
      ],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return output.split("\0").filter(Boolean);
  } catch {
    return null;
  }
}

export function netlifyIgnoreDecision(environment = process.env) {
  const context = environment.CONTEXT ?? "";

  if (context !== "production") {
    return {
      ignore: false,
      reason: `build required: ${context || "unknown"} context is never filtered`,
    };
  }

  const changedFiles = changedFilesBetween(
    environment.CACHED_COMMIT_REF,
    environment.COMMIT_REF,
  );

  // Fail open when Netlify does not provide usable commit refs. A missing or
  // shallow ref must never suppress a potentially necessary production build.
  if (changedFiles === null) {
    return {
      ignore: false,
      reason: "build required: commit comparison was unavailable",
    };
  }

  if (shouldIgnoreBuild({ context, changedFiles })) {
    return {
      ignore: true,
      reason: changedFiles.length === 0
        ? "build ignored: no file changes were detected"
        : "build ignored: changes are limited to documentation, evidence, tests, or repository operations",
    };
  }

  return {
    ignore: false,
    reason: "build required: deploy-relevant files changed",
  };
}

function run() {
  const decision = netlifyIgnoreDecision();
  console.log(`[netlify-ignore] ${decision.reason}`);

  // Netlify's ignore command contract is inverted: exit 0 cancels the build;
  // exit 1 continues it.
  process.exitCode = decision.ignore ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
