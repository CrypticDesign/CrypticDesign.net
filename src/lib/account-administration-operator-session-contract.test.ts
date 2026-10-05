import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./account-administration-operator-session.ts", import.meta.url),
  "utf8",
);

test("Gate 1 remains provider-neutral and disconnected from routes and persistence", () => {
  assert.doesNotMatch(source, /process\.env|fetch\(|@supabase|from\(["']/);
  assert.match(source, /loadSessionByTokenDigest/);
  assert.match(source, /loadOperator/);
});

test("Gate 1 stores only token and Auth-session digests", () => {
  const storedSessionShape = source.match(/export type OperatorAccessSession = \{([\s\S]*?)\n\};/)?.[1] ?? "";
  assert.match(source, /tokenDigest: digest\(token\)/);
  assert.match(source, /authSessionReferenceDigest: digest\(input\.identity\.authSessionReference\)/);
  assert.doesNotMatch(storedSessionShape, /\n\s+token:/);
  assert.doesNotMatch(storedSessionShape, /\n\s+authSessionReference:/);
});

test("Gate 4 owns cryptographic session identifiers and 256-bit opaque tokens", () => {
  assert.match(source, /randomUUID\(\)/);
  assert.match(source, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.doesNotMatch(source, /generateOpaqueToken|createSessionId/);
});

test("Gate 1 fixes session lifetime and rechecks live authority", () => {
  assert.match(source, /OPERATOR_SESSION_MAX_AGE_SECONDS = 15 \* 60/);
  assert.match(source, /session\.revokedAt !== null/);
  assert.match(source, /await dependencies\.loadOperator\(session\.operatorAccountId\)/);
  assert.match(source, /principal\.status !== "active"/);
  assert.match(source, /principal\.capabilities\.includes\(capability\)/);
});
