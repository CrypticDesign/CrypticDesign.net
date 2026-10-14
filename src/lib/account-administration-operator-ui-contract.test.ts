import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/internal/account-administration/page.tsx", import.meta.url), "utf8");
const consoleSource = readFileSync(new URL("../app/internal/account-administration/OperatorConsole.tsx", import.meta.url), "utf8");
const liveReadPanel = readFileSync(new URL("../app/internal/account-administration/OperatorLiveReadPanel.tsx", import.meta.url), "utf8");
const gate = readFileSync(new URL("./account-administration-operator-ui.ts", import.meta.url), "utf8");
const fixtures = readFileSync(new URL("./account-administration-operator-fixtures.ts", import.meta.url), "utf8");
const rootLayout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const consoleStyles = readFileSync(new URL("../app/internal/account-administration/operator-console.module.css", import.meta.url), "utf8");

test("operator fixture UI is explicitly enabled, non-production, non-indexed, and dynamic", () => {
  assert.match(gate, /NODE_ENV !== "production"/);
  assert.match(gate, /ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED === "true"/);
  assert.match(page, /if \(!accountAdministrationFixtureUiEnabled\(\)\) notFound\(\)/);
  assert.match(page, /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.match(page, /dynamic = "force-dynamic"/);
});

test("operator console keeps fixtures isolated from independently gated live transports", () => {
  assert.match(consoleSource, /Fixture isolation active/);
  assert.match(consoleSource, /Live lookup and mutation transports remain independent, local-only, and default-off/i);
  assert.doesNotMatch(consoleSource, /fetch\(|createServiceRoleSupabaseClient|\.rpc\(|method:\s*["'](?:POST|PATCH|PUT|DELETE)/i);
  assert.doesNotMatch(consoleSource, /suspend account|restore account|revoke sessions/i);
  assert.match(fixtures, /@example\.test/);
});

test("operator console covers inspection, diagnostics, and immutable audit history", () => {
  assert.match(consoleSource, /Account inspection/);
  assert.match(consoleSource, /Character inspection/);
  assert.match(consoleSource, /Command diagnostics/);
  assert.match(consoleSource, /Immutable audit history/);
});

test("live reads remain GET-only while lookup and commands use separately gated CSRF-protected POSTs", () => {
  assert.match(gate, /ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED === "true"/);
  assert.match(gate, /ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED === "true"/);
  assert.match(page, /accountAdministrationLiveReadUiEnabled\(\)/);
  assert.match(liveReadPanel, /method: "GET"/);
  assert.match(liveReadPanel, /"x-cry-operator-request": "1"/);
  assert.match(liveReadPanel, /credentials: "same-origin"/);
  assert.match(liveReadPanel, /cache: "no-store"/);
  assert.match(liveReadPanel, /method: "POST"/);
  assert.match(liveReadPanel, /"x-cry-operator-csrf": csrfToken/);
  assert.match(gate, /ACCOUNT_ADMINISTRATION_OPERATOR_LOOKUP_ENABLED === "true"/);
  assert.match(gate, /ACCOUNT_ADMINISTRATION_OPERATOR_COMMANDS_ENABLED === "true"/);
  assert.doesNotMatch(liveReadPanel, /createServiceRoleSupabaseClient|ACCOUNT_ADMINISTRATION_INTERNAL_SECRET|Bearer /);
});

test("operator surface uses an isolated VDS shell instead of public navigation and analytics", () => {
  assert.match(middleware, /requestHeaders\.set\("x-cry-operator-surface", "1"\)/);
  assert.match(rootLayout, /requestHeaders\.get\("x-cry-operator-surface"\) === "1"/);
  assert.match(rootLayout, /return <OperatorRoot>\{children\}<\/OperatorRoot>/);
  assert.ok(
    rootLayout.indexOf('requestHeaders.get("x-cry-operator-surface")') <
      rootLayout.indexOf("getInitialAccountAuthenticated()"),
  );
  assert.match(consoleSource, /data-section-accent="blue"/);
  assert.match(consoleSource, /className="signal-rail"/);
  assert.match(consoleSource, /className="display-title"/);
  assert.match(consoleSource, /aria-label="Operator navigation"/);
  assert.match(consoleSource, /href="#operator-security"/);
  assert.match(consoleSource, /href="#operator-accounts"/);
  assert.match(consoleStyles, /\.operatorHeader\s*\{[\s\S]*?width:\s*100%/);
  assert.match(consoleStyles, /\.operatorHeaderInner\s*\{[\s\S]*?width:\s*min\(100% - 8rem, 1312px\)/);
});
