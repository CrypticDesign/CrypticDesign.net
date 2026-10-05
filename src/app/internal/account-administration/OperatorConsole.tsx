"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  OperatorFixtureAccount,
  OperatorFixtureCommand,
  OperatorFixtureInspection,
} from "@/lib/account-administration-operator-fixtures";
import { OPERATOR_COMMANDS_ENABLED } from "@/lib/account-administration-operator-origin";
import styles from "./operator-console.module.css";

type Props = {
  accounts: readonly OperatorFixtureAccount[];
  commands: readonly OperatorFixtureCommand[];
  inspections: readonly OperatorFixtureInspection[];
  sessionControl?: ReactNode;
  children?: ReactNode;
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

function Status({ value }: { value: string }) {
  return <span className={styles.status} data-status={value}>{value.replaceAll("_", " ")}</span>;
}

export default function OperatorConsole({ accounts, commands, inspections, sessionControl, children }: Props) {
  const [query, setQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? "");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredAccounts = useMemo(() => accounts.filter((account) => {
    const character = account.character;
    return !normalizedQuery || [account.id, account.email, character?.name, character?.handle]
      .some((value) => value?.toLowerCase().includes(normalizedQuery));
  }), [accounts, normalizedQuery]);
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];
  const selectedCommands = commands.filter((command) => command.targetAccountId === selectedAccount?.id);
  const selectedInspections = inspections.filter((inspection) => inspection.targetAccountId === selectedAccount?.id);

  if (!selectedAccount) return null;

  return (
    <main className={styles.console} data-section-accent="blue">
      <header className={styles.operatorHeader} aria-label="Cryptic Design operator console">
        <div className={styles.operatorHeaderInner}>
          <a className={styles.operatorBrand} href="#operator-overview" aria-label="Cryptic Design operator systems overview">
            <strong>CRYPTIC DESIGN</strong>
            <span>Operator systems</span>
          </a>
          <nav className={styles.operatorNav} aria-label="Operator navigation">
            <a href="#operator-overview">Overview</a>
            <a href="#operator-security">Security</a>
            <a href="#operator-accounts">Accounts</a>
            <a href="#inspection-history-title">Audit</a>
          </nav>
          <span className={styles.operatorMode}>Local · Read-only</span>
        </div>
      </header>

      <div className={styles.consoleBody}>
      <header className={styles.header} id="operator-overview">
        <div>
          <div className="signal-rail" />
          <span className="eyebrow">CRY-400 · Local operator fixture</span>
          <h1 className="display-title">Account administration</h1>
          <p>Inspect the operator workflow with synthetic records. Any separately enabled live transport is read-only and exposes no mutation controls.</p>
        </div>
        <dl className={styles.environment}>
          <div><dt>Environment</dt><dd>Local development</dd></div>
          <div><dt>Data source</dt><dd>{children ? "Fixtures + opt-in reads" : "Approved fixtures"}</dd></div>
          <div><dt>Authority</dt><dd>Read-only</dd></div>
        </dl>
      </header>

      <div className={styles.notice} role="status">
        <strong>{children ? "Live read gate prepared" : "Fixture isolation active"}</strong>
        <span>{children
          ? "Fixture records remain synthetic; only explicit probe submissions issue read-only BFF requests."
          : "No Supabase, Auth, command, or inspection API requests are made from this page."}</span>
      </div>

      <section className={styles.metrics} aria-label="Fixture summary">
        <article><span>Accounts</span><strong>{accounts.length}</strong></article>
        <article><span>Pending commands</span><strong>{commands.filter((command) => command.status === "pending").length}</strong></article>
        <article><span>Inspection events</span><strong>{inspections.length}</strong></article>
        <article><span>Live writes</span><strong>0</strong></article>
      </section>

      <section className={styles.sessionBoundary} id="operator-security" aria-labelledby="operator-session-boundary-title">
        <div>
          <span className="eyebrow">Gate 3 · Isolated local origin</span>
          <h2 id="operator-session-boundary-title">Reauthentication boundary</h2>
          <p>{sessionControl
            ? "The separately gated local step-up flow can create a short-lived read-only operator session after provider-verified TOTP/AAL2."
            : "This preview does not accept credentials or create an operator session. TOTP/AAL2 is approved, but provider configuration and local session issuance remain separately gated."}</p>
        </div>
        <dl>
          <div><dt>Operator host</dt><dd>127.0.0.1 only</dd></div>
          <div><dt>Session cookie</dt><dd>Separate · HttpOnly · Strict</dd></div>
          <div><dt>Maximum session</dt><dd>15 minutes</dd></div>
          <div><dt>Commands</dt><dd>{OPERATOR_COMMANDS_ENABLED ? "Enabled" : "Disabled"}</dd></div>
        </dl>
        {sessionControl ?? (
          <>
            <button className="button secondary" type="button" disabled aria-describedby="operator-step-up-status">Begin secure step-up</button>
            <p id="operator-step-up-status" role="status">Unavailable until the separate local issuance gate is enabled.</p>
          </>
        )}
      </section>

      {children}

      <div className={styles.workspace}>
        <aside className={styles.directory} id="operator-accounts" aria-label="Fixture accounts">
          <label htmlFor="operator-account-search">Find an account</label>
          <input
            id="operator-account-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Email, UUID, Character…"
          />
          <div className={styles.accountList}>
            {filteredAccounts.map((account) => (
              <button
                type="button"
                key={account.id}
                aria-pressed={account.id === selectedAccount.id}
                onClick={() => setSelectedAccountId(account.id)}
              >
                <span>{account.character?.name ?? "No Character"}</span>
                <small>{account.email}</small>
                <Status value={account.status} />
              </button>
            ))}
            {filteredAccounts.length === 0 ? <p className={styles.empty}>No fixture accounts match.</p> : null}
          </div>
        </aside>

        <div className={styles.detail}>
          <section className={`${styles.panel} panel`} aria-labelledby="account-inspection-title">
            <div className={styles.panelHeading}>
              <div><span className="eyebrow">Account inspection</span><h2 id="account-inspection-title">{selectedAccount.email}</h2></div>
              <Status value={selectedAccount.status} />
            </div>
            <dl className={styles.definitionGrid}>
              <div><dt>Account ID</dt><dd>{selectedAccount.id}</dd></div>
              <div><dt>Email verified</dt><dd>{selectedAccount.emailVerified ? "Yes" : "No"}</dd></div>
              <div><dt>Protected target</dt><dd>{selectedAccount.protectedTarget ? "Yes" : "No"}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(selectedAccount.createdAt)}</dd></div>
              <div><dt>Last sign-in</dt><dd>{formatDate(selectedAccount.lastSignInAt)}</dd></div>
            </dl>
          </section>

          <section className={`${styles.panel} panel`} aria-labelledby="character-inspection-title">
            <div className={styles.panelHeading}>
              <div><span className="eyebrow">Character inspection</span><h2 id="character-inspection-title">{selectedAccount.character?.name ?? "No member Character"}</h2></div>
              {selectedAccount.character ? <Status value={selectedAccount.character.status} /> : null}
            </div>
            {selectedAccount.character ? (
              <dl className={styles.definitionGrid}>
                <div><dt>Handle</dt><dd>@{selectedAccount.character.handle}</dd></div>
                <div><dt>Character ID</dt><dd>{selectedAccount.character.id}</dd></div>
                <div><dt>Presence</dt><dd>{selectedAccount.character.presence}</dd></div>
                <div><dt>Visibility</dt><dd>{selectedAccount.character.visibility}</dd></div>
              </dl>
            ) : <p className={styles.emptyState}>This fixture account has not created its member Character.</p>}
          </section>

          <section className={`${styles.panel} panel`} aria-labelledby="command-diagnostics-title">
            <div className={styles.panelHeading}>
              <div><span className="eyebrow">Command diagnostics</span><h2 id="command-diagnostics-title">Recent command state</h2></div>
            </div>
            {selectedCommands.length ? selectedCommands.map((command) => (
              <article className={styles.command} key={command.requestId}>
                <div className={styles.commandSummary}>
                  <div><strong>{command.action.replaceAll("_", " ")}</strong><small>{command.requestId}</small></div>
                  <Status value={command.status} />
                </div>
                <dl className={styles.commandMeta}>
                  <div><dt>Requested</dt><dd>{formatDate(command.requestedAt)}</dd></div>
                  <div><dt>Safe next step</dt><dd>{command.nextStep.replaceAll("_", " ")}</dd></div>
                  <div><dt>Result</dt><dd>{command.resultCode ?? "Pending"}</dd></div>
                </dl>
                <ol className={styles.timeline}>
                  {command.events.map((event) => (
                    <li key={`${command.requestId}:${event.resultCode}`}>
                      <i aria-hidden="true" />
                      <div><strong>{event.label}</strong><span>{event.resultCode}</span></div>
                      <time>{formatDate(event.occurredAt)}</time>
                    </li>
                  ))}
                </ol>
              </article>
            )) : <p className={styles.emptyState}>No fixture commands exist for this account.</p>}
          </section>

          <section className={`${styles.panel} panel`} aria-labelledby="inspection-history-title">
            <div className={styles.panelHeading}>
              <div><span className="eyebrow">Immutable audit history</span><h2 id="inspection-history-title">Inspection events</h2></div>
              <span className={styles.count}>{selectedInspections.length} events</span>
            </div>
            <div className={styles.auditList}>
              {selectedInspections.map((inspection) => (
                <article key={inspection.inspectionId}>
                  <div><strong>{formatDate(inspection.occurredAt)}</strong><small>{inspection.inspectionId}</small></div>
                  <code>{inspection.projection}</code>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      </div>
    </main>
  );
}
