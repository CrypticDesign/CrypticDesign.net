export const MEMBERSHIP_SESSION_CHANGED_EVENT = "cryptic:membership-session-changed";

export function announceMembershipSession(authenticated: boolean): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEMBERSHIP_SESSION_CHANGED_EVENT, {
    detail: { authenticated },
  }));
}
