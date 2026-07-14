import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  SANDBOX_PRICES,
  SANDBOX_TIERS,
  transitionSubscription,
  type PriceDefinition,
  type Subscription,
  type SubscriptionEvent,
  type SubscriptionStatus,
  type TierDefinition,
} from "./membership.ts";

export interface MembershipData {
  tiers: TierDefinition[];
  prices: PriceDefinition[];
  subscriptions: Subscription[];
  events: SubscriptionEvent[];
  processedRequestIds: string[];
}

export const DEFAULT_MEMBERSHIP_DATA: MembershipData = {
  tiers: [...SANDBOX_TIERS],
  prices: [...SANDBOX_PRICES],
  subscriptions: [],
  events: [],
  processedRequestIds: [],
};

export class MembershipStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async read(): Promise<MembershipData> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as MembershipData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await this.write(DEFAULT_MEMBERSHIP_DATA);
      return structuredClone(DEFAULT_MEMBERSHIP_DATA);
    }
  }

  async createSubscription(input: {
    id: string;
    memberId: string;
    tierId: string;
    priceId: string;
    requestId: string;
    occurredAt: string;
  }): Promise<Subscription> {
    const data = await this.read();
    const duplicate = data.subscriptions.find((item) => item.id === input.id);
    if (data.processedRequestIds.includes(input.requestId) && duplicate) return duplicate;
    if (!data.tiers.some((item) => item.id === input.tierId && item.active)) throw new Error("Unknown active tier");
    if (!data.prices.some((item) => item.id === input.priceId && item.tierId === input.tierId && item.active)) {
      throw new Error("Price does not belong to the active tier");
    }

    const subscription: Subscription = {
      id: input.id,
      memberId: input.memberId,
      tierId: input.tierId,
      priceId: input.priceId,
      status: "incomplete",
      provider: null,
      providerSubscriptionId: null,
      currentPeriodStartsAt: null,
      currentPeriodEndsAt: null,
      cancelAtPeriodEnd: false,
      createdAt: input.occurredAt,
      updatedAt: input.occurredAt,
    };
    data.subscriptions.push(subscription);
    data.processedRequestIds.push(input.requestId);
    await this.write(data);
    return subscription;
  }

  async transition(input: {
    subscriptionId: string;
    status: SubscriptionStatus;
    requestId: string;
    reason: string;
    occurredAt: string;
  }): Promise<{ subscription: Subscription; event: SubscriptionEvent | null }> {
    const data = await this.read();
    const existing = data.subscriptions.find((item) => item.id === input.subscriptionId);
    if (!existing) throw new Error("Subscription not found");
    if (data.processedRequestIds.includes(input.requestId)) return { subscription: existing, event: null };

    const result = transitionSubscription(existing, input.status, {
      eventId: `event_${input.requestId}`,
      reason: input.reason,
      occurredAt: input.occurredAt,
    });
    data.subscriptions = data.subscriptions.map((item) => item.id === existing.id ? result.subscription : item);
    if (result.event) data.events.push(result.event);
    data.processedRequestIds.push(input.requestId);
    await this.write(data);
    return result;
  }

  private async write(data: MembershipData): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    await rename(temporaryPath, this.filePath);
  }
}

export function getMembershipStore(): MembershipStore {
  return new MembershipStore(path.join(process.cwd(), ".data", "membership-sandbox.json"));
}

export function membershipSandboxEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.MEMBERSHIP_SANDBOX_ENABLED === "true";
}
