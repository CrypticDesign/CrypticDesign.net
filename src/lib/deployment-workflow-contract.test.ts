import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/verify.yml", "utf8");
const pullRequestTemplate = readFileSync(
  ".github/pull_request_template.md",
  "utf8",
);

test("repository verification runs on pull requests to main without a production deploy step", () => {
  assert.match(workflow, /pull_request:\s*\n\s+branches:\s*\n\s+- main/);
  assert.doesNotMatch(workflow, /^\s*push:/m);
  assert.doesNotMatch(workflow, /pull_request_target:/);
  assert.doesNotMatch(workflow, /netlify\s+deploy|--prod|NETLIFY_AUTH_TOKEN/i);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npx tsc --noEmit/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
});

test("pull requests disclose preview, production-credit, and rollback gates", () => {
  assert.match(pullRequestTemplate, /Netlify Deploy Preview is ready/);
  assert.match(pullRequestTemplate, /intentional release or operationally justified fix/);
  assert.match(pullRequestTemplate, /metered Netlify production deploy/);
  assert.match(pullRequestTemplate, /rollback target or prior known-good deploy/);
});
