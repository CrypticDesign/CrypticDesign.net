import assert from "node:assert/strict";
import test from "node:test";

import { PublicActionEvidenceLedger, authorizePublicProfileAction, type PublicActionContext } from "./public-profile-actions.ts";

const allowedContext: PublicActionContext = {
  featureEnabled: true,
  actorAccountId: "actor_1",
  targetCharacterId: "character_1",
  targetOwnerAccountId: "owner_1",
  targetPubliclyRenderable: true,
  targetActive: true,
  blockedAccountPairs: [],
  externalPolicy: { policyVersion: "policy-2026-07", mayInteract: true, mayShare: true, reasonCode: null },
  rateLimitRemaining: 10,
};

test("keeps every public action disabled behind an explicit feature gate", () => {
  for (const action of ["follow", "appreciate", "save", "share"] as const) {
    const decision = authorizePublicProfileAction(action, { ...allowedContext, featureEnabled: false });
    assert.equal(decision.allowed, false);
    assert.equal(decision.denialCode, "feature_disabled");
  }
});

test("requires authentication, public rendering, active state, and remaining rate limit", () => {
  assert.equal(authorizePublicProfileAction("save", { ...allowedContext, actorAccountId: null }).denialCode, "authentication_required");
  assert.equal(authorizePublicProfileAction("save", { ...allowedContext, targetPubliclyRenderable: false }).denialCode, "target_not_public");
  assert.equal(authorizePublicProfileAction("save", { ...allowedContext, targetActive: false }).denialCode, "target_inactive");
  assert.equal(authorizePublicProfileAction("save", { ...allowedContext, rateLimitRemaining: 0 }).denialCode, "rate_limited");
});

test("honors blocking in either direction and external youth/content policy decisions", () => {
  const blocked = authorizePublicProfileAction("follow", { ...allowedContext, blockedAccountPairs: [["owner_1", "actor_1"]] });
  assert.equal(blocked.denialCode, "blocked");
  const restricted = authorizePublicProfileAction("appreciate", { ...allowedContext, externalPolicy: { policyVersion: "policy-teen", mayInteract: false, mayShare: false, reasonCode: "interaction_not_eligible" } });
  assert.equal(restricted.denialCode, "policy_restricted");
  assert.equal(restricted.policyVersion, "policy-teen");
  const noShare = authorizePublicProfileAction("share", { ...allowedContext, externalPolicy: { policyVersion: "policy-private-share", mayInteract: true, mayShare: false, reasonCode: "share_not_eligible" } });
  assert.equal(noShare.denialCode, "share_restricted");
});

test("prevents self follow and appreciate while allowing private save and policy-approved share", () => {
  const self = { ...allowedContext, actorAccountId: "owner_1" };
  assert.equal(authorizePublicProfileAction("follow", self).denialCode, "self_action_not_allowed");
  assert.equal(authorizePublicProfileAction("appreciate", self).denialCode, "self_action_not_allowed");
  assert.equal(authorizePublicProfileAction("save", self).allowed, true);
  assert.equal(authorizePublicProfileAction("share", self).allowed, true);
});

test("records accepted action evidence idempotently with its policy version", () => {
  const ledger = new PublicActionEvidenceLedger();
  const decision = authorizePublicProfileAction("appreciate", allowedContext);
  const input = { decision, actorAccountId: "actor_1", targetCharacterId: "character_1", requestId: "request_1", occurredAt: "2026-07-14T00:00:00Z" };
  const first = ledger.record(input);
  const replay = ledger.record(input);
  assert.deepEqual(replay, first);
  assert.equal(first.policyVersion, "policy-2026-07");
  assert.equal(ledger.historyFor("character_1").length, 1);
});

test("corrects evidence additively and never turns a denied action into accepted evidence", () => {
  const ledger = new PublicActionEvidenceLedger();
  const accepted = ledger.record({ decision: authorizePublicProfileAction("follow", allowedContext), actorAccountId: "actor_1", targetCharacterId: "character_1", requestId: "request_1", occurredAt: "2026-07-14T00:00:00Z" });
  const correction = ledger.correct({ evidenceId: accepted.id, operatorId: "operator_1", requestId: "correction_1", occurredAt: "2026-07-14T01:00:00Z" });
  assert.equal(correction.correctsEvidenceId, accepted.id);
  assert.equal(ledger.historyFor("character_1").length, 2);
  assert.throws(() => ledger.record({ decision: authorizePublicProfileAction("follow", { ...allowedContext, featureEnabled: false }), actorAccountId: "actor_1", targetCharacterId: "character_1", requestId: "denied", occurredAt: "2026-07-14T02:00:00Z" }), /Denied/);
});
