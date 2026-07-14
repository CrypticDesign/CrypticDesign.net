import assert from "node:assert/strict";
import test from "node:test";
import {
  attributeScoreForUsage,
  contextualAttributeUsage,
  effectiveAttributes,
  levelForTime,
  levelProgress,
  maximumResources,
  startingAttributes,
  timeRequiredForLevel,
  usageRequiredForAttribute,
  type CharacterCondition,
  type ContextVector,
} from "./rpg-experience.ts";

const emptyContext = (): ContextVector => ({ strength: 0, agility: 0, vitality: 0, intelligence: 0, perception: 0, creativity: 0, presence: 0, resolve: 0 });

test("uses an endless, deterministic Time curve", () => {
  assert.equal(timeRequiredForLevel(1), 0);
  assert.equal(timeRequiredForLevel(2), 30);
  assert.equal(timeRequiredForLevel(10), 810);
  assert.equal(timeRequiredForLevel(100), 29551);
  assert.equal(levelForTime(0), 1);
  assert.equal(levelForTime(29), 1);
  assert.equal(levelForTime(30), 2);
  assert.equal(levelForTime(timeRequiredForLevel(1000)), 1000);
  assert.deepEqual(levelProgress(30), { level: 2, totalTime: 30, levelTime: 0, nextLevelAt: 85, requiredForNextLevel: 55 });
});

test("starts every classless character with equal attributes and resources", () => {
  const attributes = startingAttributes();
  assert.deepEqual(Object.values(attributes), Array(8).fill(10));
  assert.deepEqual(maximumResources(attributes, 1), { health: 70, focus: 70, resolve: 70 });
});

test("turns verified Time and Context into explainable attribute usage", () => {
  const context = emptyContext();
  context.agility = 0.4;
  context.perception = 0.3;
  context.resolve = 0.2;
  context.intelligence = 0.1;
  const usage = contextualAttributeUsage({ verifiedActiveMinutes: 20, context, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1 });
  assert.equal(usage.agility, 8);
  assert.equal(usage.perception, 6);
  assert.equal(usage.resolve, 4);
  assert.equal(usage.intelligence, 2);
  assert.equal(usage.strength, 0);
});

test("reduces contextual growth for routine low-challenge activity", () => {
  const context = emptyContext();
  context.presence = 0.6;
  context.resolve = 0.4;
  const meaningful = contextualAttributeUsage({ verifiedActiveMinutes: 10, context, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1 });
  const routine = contextualAttributeUsage({ verifiedActiveMinutes: 10, context, challengeFactor: 0.35, noveltyFactor: 0.15, valueFactor: 1 });
  assert.equal(meaningful.presence, 6);
  assert.ok(routine.presence < 0.32);
  assert.ok(routine.presence > 0);
});

test("advances attributes through an uncapped contextual-use curve", () => {
  assert.equal(usageRequiredForAttribute(10), 60);
  assert.equal(attributeScoreForUsage(59).score, 10);
  assert.deepEqual(attributeScoreForUsage(60), { score: 11, usageTowardNext: 0, requiredForNext: 71 });
  assert.equal(attributeScoreForUsage(131).score, 12);
});

test("conditions change effective capability without deleting base attributes", () => {
  const base = { ...startingAttributes(), strength: 16 };
  const brokenArm: CharacterCondition = {
    id: "condition_1",
    definitionId: "broken-arm",
    definitionVersion: 1,
    scope: "campaign",
    campaignId: "campaign_1",
    sessionId: null,
    severity: 2,
    attributeModifiers: { strength: -5, agility: -2 },
    effectiveAt: "2026-07-13T00:00:00Z",
    expiresAt: null,
    removedAt: null,
    sourceEventId: "event_1",
  };
  assert.deepEqual(effectiveAttributes(base, [brokenArm], "2026-07-13T01:00:00Z"), { ...base, strength: 11, agility: 8 });
  assert.equal(base.strength, 16);
  brokenArm.removedAt = "2026-07-13T02:00:00Z";
  assert.deepEqual(effectiveAttributes(base, [brokenArm], "2026-07-13T03:00:00Z"), base);
});

test("rejects invalid active Time, factors, and context vectors", () => {
  const context = emptyContext();
  context.strength = 1;
  assert.throws(() => contextualAttributeUsage({ verifiedActiveMinutes: -1, context, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1 }), /non-negative/);
  assert.throws(() => contextualAttributeUsage({ verifiedActiveMinutes: 1, context, challengeFactor: 2, noveltyFactor: 1, valueFactor: 1 }), /Challenge/);
  context.agility = 0.1;
  assert.throws(() => contextualAttributeUsage({ verifiedActiveMinutes: 1, context, challengeFactor: 1, noveltyFactor: 1, valueFactor: 1 }), /total 1/);
});
