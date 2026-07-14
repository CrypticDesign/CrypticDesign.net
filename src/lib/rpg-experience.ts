export const CORE_ATTRIBUTES = [
  "strength",
  "agility",
  "vitality",
  "intelligence",
  "perception",
  "creativity",
  "presence",
  "resolve",
] as const;

export type CoreAttribute = (typeof CORE_ATTRIBUTES)[number];
export type AttributeScores = Record<CoreAttribute, number>;
export type ContextVector = Record<CoreAttribute, number>;

export const STARTING_ATTRIBUTE_SCORE = 10;
export const TIME_RULE = { id: "verified-active-minute", version: 1 } as const;
export const LEVEL_RULE = { id: "endless-time-curve", version: 1, coefficient: 30, exponent: 1.5 } as const;
export const ATTRIBUTE_RULE = { id: "contextual-use-curve", version: 1, baseUsage: 60, growth: 1.18 } as const;

export const startingAttributes = (): AttributeScores => Object.fromEntries(
  CORE_ATTRIBUTES.map((attribute) => [attribute, STARTING_ATTRIBUTE_SCORE]),
) as AttributeScores;

export function timeRequiredForLevel(level: number): number {
  if (!Number.isSafeInteger(level) || level < 1) throw new Error("Level must be a positive integer");
  return Math.round(LEVEL_RULE.coefficient * Math.pow(level - 1, LEVEL_RULE.exponent));
}

export function levelForTime(time: number): number {
  if (!Number.isSafeInteger(time) || time < 0) throw new Error("Time must be a non-negative integer");
  let level = Math.floor(Math.pow(time / LEVEL_RULE.coefficient, 1 / LEVEL_RULE.exponent)) + 1;
  while (timeRequiredForLevel(level + 1) <= time) level += 1;
  while (timeRequiredForLevel(level) > time) level -= 1;
  return level;
}

export function levelProgress(time: number) {
  const level = levelForTime(time);
  const levelStart = timeRequiredForLevel(level);
  const nextLevelAt = timeRequiredForLevel(level + 1);
  return { level, totalTime: time, levelTime: time - levelStart, nextLevelAt, requiredForNextLevel: nextLevelAt - levelStart };
}

export function usageRequiredForAttribute(score: number): number {
  if (!Number.isSafeInteger(score) || score < STARTING_ATTRIBUTE_SCORE) throw new Error("Attribute score is below the starting score");
  return Math.round(ATTRIBUTE_RULE.baseUsage * Math.pow(ATTRIBUTE_RULE.growth, score - STARTING_ATTRIBUTE_SCORE));
}

export function attributeScoreForUsage(totalUsage: number): { score: number; usageTowardNext: number; requiredForNext: number } {
  if (!Number.isFinite(totalUsage) || totalUsage < 0) throw new Error("Attribute usage must be non-negative");
  let score = STARTING_ATTRIBUTE_SCORE;
  let remaining = totalUsage;
  let required = usageRequiredForAttribute(score);
  while (remaining >= required) {
    remaining -= required;
    score += 1;
    required = usageRequiredForAttribute(score);
  }
  return { score, usageTowardNext: remaining, requiredForNext: required };
}

export interface ContextualUseInput {
  verifiedActiveMinutes: number;
  context: ContextVector;
  challengeFactor: number;
  noveltyFactor: number;
  valueFactor: number;
}

function validateFactor(name: string, factor: number, maximum: number): void {
  if (!Number.isFinite(factor) || factor < 0 || factor > maximum) throw new Error(`${name} factor must be between 0 and ${maximum}`);
}

export function contextualAttributeUsage(input: ContextualUseInput): AttributeScores {
  if (!Number.isSafeInteger(input.verifiedActiveMinutes) || input.verifiedActiveMinutes < 0) throw new Error("Verified active minutes must be a non-negative integer");
  validateFactor("Challenge", input.challengeFactor, 1.5);
  validateFactor("Novelty", input.noveltyFactor, 1.25);
  validateFactor("Value", input.valueFactor, 1.5);
  const contextTotal = CORE_ATTRIBUTES.reduce((sum, attribute) => {
    const weight = input.context[attribute];
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error(`Invalid ${attribute} context weight`);
    return sum + weight;
  }, 0);
  if (Math.abs(contextTotal - 1) > 0.000001) throw new Error("Context weights must total 1");
  const multiplier = input.challengeFactor * input.noveltyFactor * input.valueFactor;
  return Object.fromEntries(CORE_ATTRIBUTES.map((attribute) => [
    attribute,
    input.verifiedActiveMinutes * input.context[attribute] * multiplier,
  ])) as AttributeScores;
}

export type ConditionScope = "global" | "campaign" | "session";

export interface CharacterCondition {
  id: string;
  definitionId: string;
  definitionVersion: number;
  scope: ConditionScope;
  campaignId: string | null;
  sessionId: string | null;
  severity: number;
  attributeModifiers: Partial<AttributeScores>;
  effectiveAt: string;
  expiresAt: string | null;
  removedAt: string | null;
  sourceEventId: string;
}

export function conditionIsActive(condition: CharacterCondition, evaluatedAt: string): boolean {
  const time = Date.parse(evaluatedAt);
  if (!Number.isFinite(time)) throw new Error("Invalid condition evaluation time");
  const effective = Date.parse(condition.effectiveAt);
  const expires = condition.expiresAt ? Date.parse(condition.expiresAt) : null;
  const removed = condition.removedAt ? Date.parse(condition.removedAt) : null;
  return effective <= time && (expires === null || time < expires) && (removed === null || time < removed);
}

export function effectiveAttributes(base: AttributeScores, conditions: readonly CharacterCondition[], evaluatedAt: string): AttributeScores {
  const result = { ...base };
  for (const condition of conditions.filter((candidate) => conditionIsActive(candidate, evaluatedAt))) {
    for (const attribute of CORE_ATTRIBUTES) result[attribute] += condition.attributeModifiers[attribute] ?? 0;
  }
  for (const attribute of CORE_ATTRIBUTES) result[attribute] = Math.max(0, result[attribute]);
  return result;
}

export interface CharacterResources { health: number; focus: number; resolve: number }

export function maximumResources(attributes: AttributeScores, level: number): CharacterResources {
  if (!Number.isSafeInteger(level) || level < 1) throw new Error("Level must be a positive integer");
  return {
    health: 20 + attributes.vitality * 5 + Math.floor(level / 5),
    focus: 20 + attributes.intelligence * 2 + attributes.perception * 2 + attributes.creativity,
    resolve: 20 + attributes.resolve * 4 + attributes.presence,
  };
}

