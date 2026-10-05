import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adr = readFileSync(
  new URL("../../docs/CRY_400_SecureOperatorSessionBoundary_2026-09-29.md", import.meta.url),
  "utf8",
);

test("operator-session ADR authorizes local Gate 4 while keeping production gated", () => {
  assert.match(adr, /Status:\*\* Accepted for local Gates 1–4/);
  assert.match(adr, /default-disabled read-only BFF routes/i);
  assert.match(adr, /production activation remains approval-gated/i);
  assert.match(adr, /No browser session-issuance route exists/i);
});

test("operator-session ADR keeps browser and machine authority separate", () => {
  assert.match(adr, /browser must never receive the service-role key or machine bearer secret/i);
  assert.match(adr, /machine bearer endpoints remain distinct from browser sessions/i);
  assert.match(adr, /no CORS/i);
  assert.match(adr, /dedicated operator origin/i);
});

test("operator-session ADR requires revocable step-up authority and live capability checks", () => {
  assert.match(adr, /stateful, short-lived operator session/i);
  assert.match(adr, /maximum 15 minutes/i);
  assert.match(adr, /refresh time does not qualify/i);
  assert.match(adr, /rechecked on every request/i);
  assert.match(adr, /raw token is never stored/i);
});

test("operator-session ADR preserves fail-closed audit and future mutation gates", () => {
  assert.match(adr, /disclosed only after their immutable audit event succeeds/i);
  assert.match(adr, /Requires separate Robert approval/i);
  assert.match(adr, /exact confirmation/);
  assert.match(adr, /idempotency/);
  assert.match(adr, /reconciliation/);
});
