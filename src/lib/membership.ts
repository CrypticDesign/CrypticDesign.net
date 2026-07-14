export const SUBSCRIPTION_STATUSES = [
  "pending",
  "incomplete",
  "trialing",
  "active",
  "past_due",
  "grace",
  "paused",
  "canceled",
  "expired",
  "refunded",
  "disputed",
  "terminated",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type BillingInterval = "month" | "year";

export interface MemberProfile {
  id: string;
  accountId: string;
  displayName: string;
  createdAt: string;
}

export interface Benefit {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface TierDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  benefitIds: string[];
  active: boolean;
}

export interface PriceDefinition {
  id: string;
  tierId: string;
  currency: string;
  amountMinor: number;
  interval: BillingInterval;
  active: boolean;
}

export interface Subscription {
  id: string;
  memberId: string;
  tierId: string;
  priceId: string;
  status: SubscriptionStatus;
  provider: string | null;
  providerSubscriptionId: string | null;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  fromStatus: SubscriptionStatus;
  toStatus: SubscriptionStatus;
  reason: string;
  occurredAt: string;
}

const ENTITLED_STATUSES: readonly SubscriptionStatus[] = ["trialing", "active"];

export function resolveEntitlements(
  subscriptions: readonly Subscription[],
  tiers: readonly TierDefinition[],
): string[] {
  const eligibleTierIds = new Set(
    subscriptions.filter((item) => ENTITLED_STATUSES.includes(item.status)).map((item) => item.tierId),
  );
  return [...new Set(
    tiers.filter((tier) => tier.active && eligibleTierIds.has(tier.id)).flatMap((tier) => tier.benefitIds),
  )].sort();
}

const ALLOWED_TRANSITIONS: Readonly<Record<SubscriptionStatus, readonly SubscriptionStatus[]>> = {
  pending: ["active", "trialing", "incomplete", "canceled"],
  incomplete: ["trialing", "active", "canceled", "expired"],
  trialing: ["active", "past_due", "canceled", "expired"],
  active: ["past_due", "paused", "canceled", "expired", "refunded", "disputed", "terminated"],
  past_due: ["active", "grace", "paused", "canceled", "expired", "terminated"],
  grace: ["active", "expired", "terminated"],
  paused: ["active", "canceled", "expired", "terminated"],
  canceled: ["active", "expired"],
  expired: [],
  refunded: ["active", "expired", "terminated"],
  disputed: ["active", "expired", "terminated"],
  terminated: [],
};

export function canTransitionSubscription(
  from: SubscriptionStatus,
  to: SubscriptionStatus,
): boolean {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to);
}

export function transitionSubscription(
  subscription: Subscription,
  toStatus: SubscriptionStatus,
  options: { eventId: string; reason: string; occurredAt: string },
): { subscription: Subscription; event: SubscriptionEvent | null } {
  if (!canTransitionSubscription(subscription.status, toStatus)) {
    throw new Error(`Invalid subscription transition: ${subscription.status} -> ${toStatus}`);
  }

  if (subscription.status === toStatus) {
    return { subscription, event: null };
  }

  const event: SubscriptionEvent = {
    id: options.eventId,
    subscriptionId: subscription.id,
    fromStatus: subscription.status,
    toStatus,
    reason: options.reason,
    occurredAt: options.occurredAt,
  };

  return {
    subscription: { ...subscription, status: toStatus, updatedAt: options.occurredAt },
    event,
  };
}

export interface BillingAdapter {
  createCheckout(input: {
    memberId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; providerCheckoutId: string }>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
  parseEvent(payload: unknown, signature: string): Promise<SubscriptionEvent | null>;
}

export const SANDBOX_TIERS: readonly TierDefinition[] = [
  {
    id: "tier_observer",
    code: "observer",
    name: "Observer",
    description: "Sandbox fixture based on the historical Patreon tier.",
    benefitIds: ["benefit_updates"],
    active: true,
  },
  {
    id: "tier_builder",
    code: "builder",
    name: "Builder",
    description: "Sandbox fixture based on the historical Patreon tier.",
    benefitIds: ["benefit_updates", "benefit_early_access"],
    active: true,
  },
  {
    id: "tier_architect",
    code: "architect",
    name: "Architect",
    description: "Sandbox fixture based on the historical Patreon tier.",
    benefitIds: ["benefit_updates", "benefit_early_access", "benefit_premium_access"],
    active: true,
  },
] as const;

export const SANDBOX_PRICES: readonly PriceDefinition[] = [
  { id: "price_observer_month", tierId: "tier_observer", currency: "USD", amountMinor: 800, interval: "month", active: true },
  { id: "price_builder_month", tierId: "tier_builder", currency: "USD", amountMinor: 2000, interval: "month", active: true },
  { id: "price_architect_month", tierId: "tier_architect", currency: "USD", amountMinor: 5000, interval: "month", active: true },
] as const;
