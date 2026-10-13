import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  OPERATOR_FIXTURE_ACCOUNTS,
  OPERATOR_FIXTURE_COMMANDS,
  OPERATOR_FIXTURE_INSPECTIONS,
} from "@/lib/account-administration-operator-fixtures";
import {
  accountAdministrationCommandsUiEnabled,
  accountAdministrationFixtureUiEnabled,
  accountAdministrationLiveReadUiEnabled,
  accountAdministrationLookupUiEnabled,
  accountAdministrationSessionIssuanceUiEnabled,
} from "@/lib/account-administration-operator-ui";
import { OPERATOR_CSRF_REQUEST_TOKEN_HEADER, validOperatorCsrfToken } from "@/lib/account-administration-operator-origin";
import OperatorConsole from "./OperatorConsole";
import OperatorLiveReadPanel from "./OperatorLiveReadPanel";
import OperatorStepUpPanel from "./OperatorStepUpPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local Account Administration Fixture",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountAdministrationFixturePage() {
  if (!accountAdministrationFixtureUiEnabled()) notFound();
  const issuanceEnabled = accountAdministrationSessionIssuanceUiEnabled();
  const liveReadEnabled = accountAdministrationLiveReadUiEnabled();
  const lookupEnabled = accountAdministrationLookupUiEnabled();
  const commandsEnabled = accountAdministrationCommandsUiEnabled();
  const csrfToken = issuanceEnabled || lookupEnabled || commandsEnabled
    ? (await headers()).get(OPERATOR_CSRF_REQUEST_TOKEN_HEADER)
    : null;

  return (
    <OperatorConsole
      accounts={OPERATOR_FIXTURE_ACCOUNTS}
      commands={OPERATOR_FIXTURE_COMMANDS}
      inspections={OPERATOR_FIXTURE_INSPECTIONS}
      commandsEnabled={commandsEnabled}
      sessionControl={issuanceEnabled && validOperatorCsrfToken(csrfToken)
        ? <OperatorStepUpPanel csrfToken={csrfToken} />
        : null}
    >
      {liveReadEnabled ? (
        <OperatorLiveReadPanel
          csrfToken={validOperatorCsrfToken(csrfToken) ? csrfToken : null}
          lookupEnabled={lookupEnabled}
          commandsEnabled={commandsEnabled}
        />
      ) : null}
    </OperatorConsole>
  );
}
