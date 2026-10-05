export function accountAdministrationFixtureUiEnabled(
  environment: {
    NODE_ENV?: string;
    ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED?: string;
  } = process.env,
) {
  return environment.NODE_ENV !== "production" && environment.ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED === "true";
}

export function accountAdministrationLiveReadUiEnabled(
  environment: {
    NODE_ENV?: string;
    ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED?: string;
    ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED?: string;
    ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED?: string;
  } = process.env,
) {
  return accountAdministrationFixtureUiEnabled(environment) &&
    environment.ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED === "true" &&
    environment.ACCOUNT_ADMINISTRATION_OPERATOR_LIVE_UI_ENABLED === "true";
}

export function accountAdministrationSessionIssuanceUiEnabled(
  environment: {
    NODE_ENV?: string;
    ACCOUNT_ADMINISTRATION_FIXTURE_UI_ENABLED?: string;
    ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED?: string;
    ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
  } = process.env,
) {
  return accountAdministrationFixtureUiEnabled(environment) &&
    environment.ACCOUNT_ADMINISTRATION_OPERATOR_BFF_ENABLED === "true" &&
    environment.ACCOUNT_ADMINISTRATION_OPERATOR_SESSION_ISSUANCE_ENABLED === "true" &&
    Boolean(
      environment.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() &&
      environment.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    );
}
