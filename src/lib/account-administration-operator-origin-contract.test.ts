import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const consoleSource = readFileSync(new URL("../app/internal/account-administration/OperatorConsole.tsx", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("middleware applies fail-closed host routing and operator security headers", () => {
  assert.match(middleware, /operatorOriginDecision/);
  assert.match(middleware, /operatorDecision === "deny"/);
  assert.match(middleware, /status: 404/);
  assert.match(middleware, /operatorSecurityHeaders/);
  assert.match(middleware, /Content-Security-Policy/);
  assert.match(middleware, /const host = request\.headers\.get\("host"\)/);
  assert.match(middleware, /const forwardedHost = request\.headers\.get\("x-forwarded-host"\)/);
  assert.match(middleware, /operatorOriginDecision\(\{\s*host,\s*forwardedHost,/);
  assert.doesNotMatch(middleware, /x-forwarded-host"\) \?\? request\.headers\.get\("host"\)/);
  assert.equal(packageJson.scripts.dev, "next dev --turbopack --hostname 127.0.0.1");
});

test("Gate 3 reauthentication UI accepts no credentials and exposes no command control", () => {
  assert.match(consoleSource, /This preview does not accept credentials or create an operator session/);
  assert.match(consoleSource, /Begin secure step-up/);
  assert.match(consoleSource, /disabled aria-describedby="operator-step-up-status"/);
  assert.doesNotMatch(consoleSource, /type="password"|onSubmit=|fetch\(|\.rpc\(/);
  assert.match(consoleSource, /OPERATOR_COMMANDS_ENABLED/);
});
