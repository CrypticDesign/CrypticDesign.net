"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { PriceDefinition, Subscription, SubscriptionEvent, TierDefinition } from "@/lib/membership";

interface MemberState {
  subscriptions: Subscription[];
  events: SubscriptionEvent[];
  entitlements: string[];
}

const EMPTY_STATE: MemberState = { subscriptions: [], events: [], entitlements: [] };

export default function MembershipSandbox() {
  const [catalog, setCatalog] = useState<{ tiers: TierDefinition[]; prices: PriceDefinition[] } | null>(null);
  const [member, setMember] = useState<MemberState>(EMPTY_STATE);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [message, setMessage] = useState("Loading sandbox tiers…");

  const loadMember = useCallback(async () => {
    const response = await fetch("/api/membership/subscriptions", { cache: "no-store" });
    if (response.status === 401) { setAuthenticated(false); setMember(EMPTY_STATE); return; }
    if (!response.ok) throw new Error("Membership history is unavailable");
    setAuthenticated(true);
    setMember(await response.json());
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/membership/tiers").then((response) => {
        if (!response.ok) throw new Error("Sandbox API is unavailable");
        return response.json();
      }),
      loadMember(),
    ]).then(([data]) => { setCatalog(data); setMessage(""); })
      .catch(() => setMessage("The local membership sandbox is currently unavailable."));
  }, [loadMember]);

  async function preview(tier: TierDefinition) {
    const price = catalog?.prices.find((item) => item.tierId === tier.id);
    if (!price) return;
    setMessage(`Creating a local ${tier.name} preview…`);
    const response = await fetch("/api/membership/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ tierId: tier.id, priceId: price.id }),
    });
    if (response.status === 401) { setAuthenticated(false); setMessage("Start a local preview session first."); return; }
    if (!response.ok) { setMessage("The local preview could not be created."); return; }
    await loadMember();
    setMessage(`${tier.name} preview created locally. No payment was collected.`);
  }

  async function changeStatus(subscription: Subscription, status: "active" | "canceled" | "expired", label: string) {
    setMessage(`${label}…`);
    const response = await fetch(`/api/membership/subscriptions/${subscription.id}/transition`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ status, reason: `local framework: ${label.toLowerCase()}` }),
    });
    if (!response.ok) { setMessage("The preview transition could not be completed."); return; }
    await loadMember();
    setMessage(`${label} complete. Membership access has been recalculated locally.`);
  }

  if (!catalog) return <p className="ui-loading" aria-live="polite">{message}</p>;

  return (
    <>
      {authenticated === false ? (
        <div className="ui-empty"><p>Membership history is account-bound.</p><Link href="/account/sign-in" className="text-accent-cyan hover:underline">Start a local preview session</Link></div>
      ) : null}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Sandbox membership tiers">
        {catalog.tiers.map((tier) => {
          const price = catalog.prices.find((item) => item.tierId === tier.id);
          return (
            <article key={tier.id} className="rounded-card border border-border bg-surface p-5">
              <span className="eyebrow">Local sandbox</span>
              <h2 className="mt-3 text-xl font-medium text-foreground">{tier.name}</h2>
              <p className="mt-2 text-2xl font-semibold text-white">{price ? `$${price.amountMinor / 100}` : "—"}<span className="text-sm text-muted-foreground"> / month</span></p>
              <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>
              <button className="button mt-5 w-full" type="button" onClick={() => preview(tier)}>Preview {tier.name}</button>
            </article>
          );
        })}
      </section>
      {authenticated && member.subscriptions.length === 0 ? <p className="ui-empty">No local membership history yet.</p> : null}
      {authenticated && member.subscriptions.length > 0 ? (
        <section className="panel p-5" aria-labelledby="membership-history-title">
          <h2 id="membership-history-title" className="text-xl font-medium">Membership history</h2>
          <div className="mt-4 grid gap-3">
            {member.subscriptions.map((subscription) => {
              const tier = catalog.tiers.find((item) => item.id === subscription.tierId);
              return <article key={subscription.id} className="border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{tier?.name ?? "Membership"}</strong><p className="mt-1 text-sm text-muted-foreground">Status: {subscription.status.replace("_", " ")}</p></div><div className="flex flex-wrap gap-2">{subscription.status === "incomplete" ? <button type="button" className="button secondary" onClick={() => changeStatus(subscription, "active", "Activate local preview")}>Activate locally</button> : null}{subscription.status === "active" ? <button type="button" className="button secondary" onClick={() => changeStatus(subscription, "canceled", "Cancel local membership")}>Cancel locally</button> : null}{subscription.status === "canceled" ? <button type="button" className="button secondary" onClick={() => changeStatus(subscription, "expired", "Expire local membership")}>Expire locally</button> : null}</div></div></article>;
            })}
          </div>
          <h3 className="mt-6 font-medium">Current access</h3>
          <p className="mt-2 text-sm text-muted-foreground">{member.entitlements.length ? member.entitlements.map((item) => item.replace("benefit_", "").replaceAll("_", " ")).join(" · ") : "No membership benefits are active."}</p>
          <h3 className="mt-6 font-medium">Lifecycle events</h3>
          {member.events.length ? <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">{member.events.map((event) => <li key={event.id}>{event.fromStatus} → {event.toStatus}: {event.reason}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No lifecycle events yet.</p>}
        </section>
      ) : null}
      {message ? <p className="ui-empty" aria-live="polite">{message}</p> : null}
    </>
  );
}
