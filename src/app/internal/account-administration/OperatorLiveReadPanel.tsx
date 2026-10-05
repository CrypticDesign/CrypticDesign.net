"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { AccountAdministrationCommandDiagnostics } from "@/lib/account-administration-diagnostics";
import type { AccountInspectionHistory } from "@/lib/account-administration-inspection-history";
import type { AccountAdministrationInspection } from "@/lib/account-administration-inspection";
import styles from "./operator-console.module.css";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function operatorGet<T>(path: string): Promise<T> {
  const result = await fetch(path, {
    method: "GET",
    headers: { "x-cry-operator-request": "1" },
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!result.ok) throw new Error("unavailable");
  return await result.json() as T;
}

export default function OperatorLiveReadPanel() {
  const [accountId, setAccountId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [account, setAccount] = useState<AccountAdministrationInspection | null>(null);
  const [history, setHistory] = useState<AccountInspectionHistory | null>(null);
  const [diagnostics, setDiagnostics] = useState<AccountAdministrationCommandDiagnostics | null>(null);
  const [accountStatus, setAccountStatus] = useState("No live request made.");
  const [commandStatus, setCommandStatus] = useState("No live request made.");

  async function inspectAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = accountId.trim();
    setAccount(null);
    setHistory(null);
    if (!UUID.test(target)) {
      setAccountStatus("Enter a valid account UUID.");
      return;
    }
    setAccountStatus("Requesting authorized read…");
    try {
      const [inspection, events] = await Promise.all([
        operatorGet<AccountAdministrationInspection>(`/api/operator/account-administration/accounts/${encodeURIComponent(target)}`),
        operatorGet<AccountInspectionHistory>(`/api/operator/account-administration/inspections?targetAccountId=${encodeURIComponent(target)}&limit=10`),
      ]);
      setAccount(inspection);
      setHistory(events);
      setAccountStatus("Authorized read completed.");
    } catch {
      setAccountStatus("Live inspection is unavailable or unauthorized.");
    }
  }

  async function inspectCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = requestId.trim();
    setDiagnostics(null);
    if (!UUID.test(target)) {
      setCommandStatus("Enter a valid request UUID.");
      return;
    }
    setCommandStatus("Requesting authorized read…");
    try {
      setDiagnostics(await operatorGet<AccountAdministrationCommandDiagnostics>(
        `/api/operator/account-administration/commands/${encodeURIComponent(target)}`,
      ));
      setCommandStatus("Authorized read completed.");
    } catch {
      setCommandStatus("Command diagnostics are unavailable or unauthorized.");
    }
  }

  return (
    <section className={styles.liveRead} aria-labelledby="operator-live-read-title">
      <div className={styles.panelHeading}>
        <div>
          <span className="eyebrow">Gate 4 · Explicit local opt-in</span>
          <h2 id="operator-live-read-title">Live read-only BFF probe</h2>
        </div>
        <span className={styles.status} data-status="pending">Commands disabled</span>
      </div>
      <p>This panel can issue GET requests only. It requires a verified member session, a separately issued short-lived operator cookie, and current inspect capability.</p>
      <div className={styles.liveReadForms}>
        <form onSubmit={inspectAccount}>
          <label htmlFor="live-account-id">Account UUID</label>
          <div><input id="live-account-id" value={accountId} onChange={(event) => setAccountId(event.target.value)} autoComplete="off" /><button className="button secondary" type="submit">Inspect account</button></div>
          <p role="status">{accountStatus}</p>
        </form>
        <form onSubmit={inspectCommand}>
          <label htmlFor="live-request-id">Command request UUID</label>
          <div><input id="live-request-id" value={requestId} onChange={(event) => setRequestId(event.target.value)} autoComplete="off" /><button className="button secondary" type="submit">Inspect diagnostics</button></div>
          <p role="status">{commandStatus}</p>
        </form>
      </div>
      {account ? (
        <dl className={styles.definitionGrid}>
          <div><dt>Account</dt><dd>{account.account.id}</dd></div>
          <div><dt>Status</dt><dd>{account.account.status}</dd></div>
          <div><dt>Email</dt><dd>{account.account.email ?? "Unavailable"}</dd></div>
          <div><dt>Character</dt><dd>{account.character?.name ?? "None"}</dd></div>
          <div><dt>Protected target</dt><dd>{account.protectedTarget ? "Yes" : "No"}</dd></div>
          <div><dt>Audit events returned</dt><dd>{history?.events.length ?? 0}</dd></div>
        </dl>
      ) : null}
      {diagnostics ? (
        <dl className={styles.definitionGrid}>
          <div><dt>Request</dt><dd>{diagnostics.command.requestId}</dd></div>
          <div><dt>Status</dt><dd>{diagnostics.command.status}</dd></div>
          <div><dt>Action</dt><dd>{diagnostics.command.action.replaceAll("_", " ")}</dd></div>
          <div><dt>Safe next step</dt><dd>{diagnostics.reconciliation.nextStep.replaceAll("_", " ")}</dd></div>
        </dl>
      ) : null}
    </section>
  );
}
