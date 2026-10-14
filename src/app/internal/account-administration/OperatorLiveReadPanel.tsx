"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  OperatorAction,
  OperatorCommandOutcome,
} from "@/lib/account-administration";
import type { AccountAdministrationCommandDiagnostics } from "@/lib/account-administration-diagnostics";
import type { AccountInspectionHistory } from "@/lib/account-administration-inspection-history";
import type { AccountAdministrationInspection } from "@/lib/account-administration-inspection";
import type { AccountAdministrationLookupKind } from "@/lib/account-administration-lookup";
import styles from "./operator-console.module.css";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CHARACTER_ACTIONS = new Set<OperatorAction>(["suspend_character", "restore_character"]);

const ACTIONS: readonly { value: OperatorAction; label: string }[] = [
  { value: "suspend_account", label: "Suspend account" },
  { value: "restore_account", label: "Restore account" },
  { value: "revoke_sessions", label: "Revoke sessions (provider-limited)" },
  { value: "suspend_character", label: "Suspend Character" },
  { value: "restore_character", label: "Restore Character" },
];

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

async function operatorPost<T>(path: string, body: object, csrfToken: string): Promise<T> {
  const result = await fetch(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cry-operator-request": "1",
      "x-cry-operator-csrf": csrfToken,
    },
    body: JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!result.ok) throw new Error("unavailable");
  return await result.json() as T;
}

type Props = {
  csrfToken: string | null;
  lookupEnabled: boolean;
  commandsEnabled: boolean;
};

export default function OperatorLiveReadPanel({ csrfToken, lookupEnabled, commandsEnabled }: Props) {
  const [accountId, setAccountId] = useState("");
  const [lookupKind, setLookupKind] = useState<AccountAdministrationLookupKind>("character_handle");
  const [lookupValue, setLookupValue] = useState("");
  const [requestId, setRequestId] = useState("");
  const [account, setAccount] = useState<AccountAdministrationInspection | null>(null);
  const [history, setHistory] = useState<AccountInspectionHistory | null>(null);
  const [diagnostics, setDiagnostics] = useState<AccountAdministrationCommandDiagnostics | null>(null);
  const [accountStatus, setAccountStatus] = useState("No live request made.");
  const [commandStatus, setCommandStatus] = useState("No live request made.");
  const [action, setAction] = useState<OperatorAction>("suspend_account");
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pendingCommand, setPendingCommand] = useState(false);

  const targetId = CHARACTER_ACTIONS.has(action)
    ? account?.character?.id ?? ""
    : account?.account.id ?? "";
  const expectedConfirmation = targetId ? `${action}:${targetId}` : "";
  const canUseStateChangingPost = Boolean(csrfToken);
  const commandReady = commandsEnabled && canUseStateChangingPost && Boolean(
    account &&
    targetId &&
    reason.trim().length >= 12 &&
    reason.trim().length <= 500 &&
    confirmation === expectedConfirmation &&
    !pendingCommand
  );
  const commandHint = useMemo(() => {
    if (!account) return "Inspect a target before preparing a command.";
    if (CHARACTER_ACTIONS.has(action) && !account.character) return "This account has no member Character.";
    if (action === "revoke_sessions") return "The current Supabase adapter records a controlled SESSION_REVOCATION_UNAVAILABLE failure until provider-safe global revocation is available.";
    return `Type ${expectedConfirmation} to confirm the exact action and target.`;
  }, [account, action, expectedConfirmation]);

  async function loadInspection(inspection: AccountAdministrationInspection) {
    setAccount(inspection);
    setAccountId(inspection.account.id);
    setConfirmation("");
    try {
      setHistory(await operatorGet<AccountInspectionHistory>(
        `/api/operator/account-administration/inspections?targetAccountId=${encodeURIComponent(inspection.account.id)}&limit=10`,
      ));
    } catch {
      setHistory(null);
    }
  }

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
      const inspection = await operatorGet<AccountAdministrationInspection>(
        `/api/operator/account-administration/accounts/${encodeURIComponent(target)}`,
      );
      await loadInspection(inspection);
      setAccountStatus("Authorized read completed and audited.");
    } catch {
      setAccountStatus("Live inspection is unavailable or unauthorized.");
    }
  }

  async function lookupAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lookupEnabled || !csrfToken || !lookupValue.trim()) return;
    setAccount(null);
    setHistory(null);
    setAccountStatus("Resolving exact approved identifier…");
    try {
      const inspection = await operatorPost<AccountAdministrationInspection>(
        "/api/operator/account-administration/lookup",
        { kind: lookupKind, value: lookupValue },
        csrfToken,
      );
      await loadInspection(inspection);
      setAccountStatus("Exact identifier resolved; inspection completed and audited.");
    } catch {
      setAccountStatus("No authorized exact match was returned.");
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

  async function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!commandReady || !account || !csrfToken) return;
    const nextRequestId = crypto.randomUUID();
    setPendingCommand(true);
    setDiagnostics(null);
    setRequestId(nextRequestId);
    setCommandStatus("Submitting audited operator command…");
    try {
      const outcome = await operatorPost<OperatorCommandOutcome>(
        "/api/operator/account-administration/commands",
        {
          requestId: nextRequestId,
          action,
          targetAccountId: account.account.id,
          ...(CHARACTER_ACTIONS.has(action) && account.character
            ? { targetCharacterId: account.character.id }
            : {}),
          reason: reason.trim(),
          confirmation,
        },
        csrfToken,
      );
      setCommandStatus(`Command ${outcome.status}: ${outcome.resultCode}.`);
      setConfirmation("");
      try {
        setDiagnostics(await operatorGet<AccountAdministrationCommandDiagnostics>(
          `/api/operator/account-administration/commands/${encodeURIComponent(nextRequestId)}`,
        ));
      } catch {
        setDiagnostics(null);
      }
    } catch {
      setCommandStatus("The command was rejected or the operator service is unavailable.");
    } finally {
      setPendingCommand(false);
    }
  }

  return (
    <section className={styles.liveRead} aria-labelledby="operator-live-read-title">
      <div className={styles.panelHeading}>
        <div>
          <span className="eyebrow">Gate 4 · Explicit local opt-in</span>
          <h2 id="operator-live-read-title">Live operator BFF probe</h2>
        </div>
        <span className={styles.status} data-status={commandsEnabled ? "active" : "pending"}>
          {commandsEnabled ? "Mutations locally enabled" : "Commands disabled"}
        </span>
      </div>
      <p>Every request requires the isolated numeric-loopback origin, a verified member session, a short-lived operator session, a current capability, and an independent feature gate. Exact lookup and commands use CSRF-protected POST requests.</p>
      <div className={styles.liveReadForms}>
        <form onSubmit={inspectAccount}>
          <label htmlFor="live-account-id">Exact account UUID</label>
          <div><input id="live-account-id" value={accountId} onChange={(event) => setAccountId(event.target.value)} autoComplete="off" /><button className="button secondary" type="submit">Inspect account</button></div>
          <p role="status">{accountStatus}</p>
        </form>
        {lookupEnabled ? (
          <form onSubmit={lookupAccount}>
            <label htmlFor="live-lookup-value">Exact approved identifier</label>
            <div className={styles.lookupControls}>
              <select id="live-lookup-kind" aria-label="Identifier type" value={lookupKind} onChange={(event) => setLookupKind(event.target.value as AccountAdministrationLookupKind)}>
                <option value="account_id">Account UUID</option>
                <option value="character_id">Character UUID</option>
                <option value="character_handle">Character handle</option>
              </select>
              <input id="live-lookup-value" value={lookupValue} onChange={(event) => setLookupValue(event.target.value)} autoComplete="off" />
              <button className="button secondary" type="submit" disabled={!canUseStateChangingPost || !lookupValue.trim()}>Resolve and inspect</button>
            </div>
            <p>Email and fuzzy search are intentionally excluded to prevent broad Auth-directory enumeration.</p>
          </form>
        ) : null}
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
      {commandsEnabled ? (
        <form className={styles.liveCommand} onSubmit={submitCommand}>
          <div className={styles.panelHeading}>
            <div><span className="eyebrow">Independent mutation gate</span><h3>Prepare audited command</h3></div>
            <span className={styles.status} data-status="pending">Exact confirmation required</span>
          </div>
          <div className={styles.commandFields}>
            <label>Action<select value={action} onChange={(event) => { setAction(event.target.value as OperatorAction); setConfirmation(""); }}>
              {ACTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select></label>
            <label>Reason<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={12} maxLength={500} /></label>
            <label>Exact confirmation<input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" /></label>
          </div>
          <p>{commandHint}</p>
          <button className="button secondary" type="submit" disabled={!commandReady}>{pendingCommand ? "Submitting…" : "Submit audited command"}</button>
        </form>
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
