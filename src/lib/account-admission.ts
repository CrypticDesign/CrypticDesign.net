export const ACCOUNT_ADMISSION_CLOSED_MESSAGE =
  "Subscriber accounts are not open for public registration. Public pages and samples remain available without an account.";

export type AccountAdmissionMode = "closed" | "invitation";

export function accountAdmissionMode(): AccountAdmissionMode {
  return process.env.ACCOUNT_ADMISSION_MODE?.trim().toLowerCase() === "invitation"
    ? "invitation"
    : "closed";
}

// Invitation mode is an operational state, not permission for browser signup.
// Approved invitations must use a separate server-only Auth Admin path.
export const PUBLIC_ACCOUNT_CREATION_AVAILABLE = false;
