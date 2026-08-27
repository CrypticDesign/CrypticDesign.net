export const requestAccessEmail = "robert.croft@crypticdesign.net";

export const requestAccessInterests = [
  "Games & Worlds",
  "Music & Media",
  "Community",
  "Creator Participation",
  "General Platform Access",
] as const;

export type RequestAccessInterest = (typeof requestAccessInterests)[number];
export type AccessRequest = { email: string; name?: string; interest?: string };

export function buildRequestAccessMailto(request: AccessRequest): string {
  const email = request.email.trim();
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || email.length > 254) {
    throw new Error("Enter a valid email address.");
  }
  const interest = requestAccessInterests.find(value => value === request.interest) ?? "General Platform Access";
  const name = request.name?.replace(/[\r\n]+/g, " ").trim() || "Not provided";
  const subject = `CrypticDesign.net access request — ${interest}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Primary Interest: ${interest}`,
    "",
    "I would like to request access to CrypticDesign.net when an appropriate member-access wave becomes available.",
  ].join("\n");
  return `mailto:${requestAccessEmail}?subject=${encodeURIComponent(subject.replace(/[\r\n]+/g, " "))}&body=${encodeURIComponent(body)}`;
}
