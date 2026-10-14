import assert from "node:assert/strict";
import test from "node:test";
import {
  AccountAdministrationLookupError,
  parseAccountAdministrationLookup,
} from "./account-administration-lookup.ts";

function rejects(body: string) {
  assert.throws(
    () => parseAccountAdministrationLookup(body),
    AccountAdministrationLookupError,
  );
}

test("accepts only exact approved opaque identifiers", () => {
  assert.deepEqual(
    parseAccountAdministrationLookup(JSON.stringify({
      kind: "account_id",
      value: "10000000-0000-4000-8000-000000000001",
    })),
    { kind: "account_id", value: "10000000-0000-4000-8000-000000000001" },
  );
  assert.deepEqual(
    parseAccountAdministrationLookup(JSON.stringify({
      kind: "character_id",
      value: "20000000-0000-4000-8000-000000000002",
    })),
    { kind: "character_id", value: "20000000-0000-4000-8000-000000000002" },
  );
  assert.deepEqual(
    parseAccountAdministrationLookup(JSON.stringify({
      kind: "character_handle",
      value: "@Signal-Pilot",
    })),
    { kind: "character_handle", value: "signal-pilot" },
  );
});

test("rejects email, fuzzy, malformed, oversized, and widened lookup shapes", () => {
  rejects(JSON.stringify({ kind: "email", value: "member@example.com" }));
  rejects(JSON.stringify({ kind: "character_handle", value: "signal*" }));
  rejects(JSON.stringify({ kind: "character_handle", value: "x" }));
  rejects(JSON.stringify({ kind: "account_id", value: "not-a-uuid" }));
  rejects(JSON.stringify({ kind: "character_handle", value: "signal-pilot", limit: 20 }));
  rejects(JSON.stringify({ kind: "character_handle", value: "a".repeat(40) }));
  rejects("{");
  rejects("x".repeat(1025));
});
