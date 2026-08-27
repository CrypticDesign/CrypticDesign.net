import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildRequestAccessMailto, requestAccessEmail, requestAccessInterests } from "./request-access.ts";
import { PUBLIC_ACCOUNT_CREATION_AVAILABLE } from "./account-admission.ts";
import { inquiryEmail } from "./professional-inquiry.ts";

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const page = source("../app/account/create/page.tsx");
const form = source("../components/RequestAccessForm.tsx");

test("Request Access uses the approved company destination and exact interest vocabulary", () => {
  assert.equal(requestAccessEmail, "robert.croft@crypticdesign.net");
  assert.equal(requestAccessEmail, inquiryEmail);
  assert.deepEqual(requestAccessInterests, ["Games & Worlds", "Music & Media", "Community", "Creator Participation", "General Platform Access"]);
});

test("minimal request requires email and defaults optional values", () => {
  const url = new URL(buildRequestAccessMailto({ email: " visitor@example.com " }));
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, requestAccessEmail);
  assert.equal(url.searchParams.get("subject"), "CrypticDesign.net access request — General Platform Access");
  assert.equal(url.searchParams.get("body"), "Name: Not provided\nEmail: visitor@example.com\nPrimary Interest: General Platform Access\n\nI would like to request access to CrypticDesign.net when an appropriate member-access wave becomes available.");
  for (const email of ["", " ", "invalid", "a@@example.com", "a@example.com\r\nBcc:other@example.com", "a".repeat(255) + "@example.com"]) {
    assert.throws(() => buildRequestAccessMailto({ email }), /valid email/);
  }
});

test("all approved interests and optional names encode safely without extra mail headers", () => {
  for (const interest of requestAccessInterests) {
    const url = new URL(buildRequestAccessMailto({ email: "visitor+qa@example.com", name: " QA & Example = ? # ", interest }));
    assert.equal(url.searchParams.get("subject"), `CrypticDesign.net access request — ${interest}`);
    assert.match(url.searchParams.get("body")!, /Name: QA & Example = \? #\nEmail: visitor\+qa@example.com/);
    assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
  }
  const injected = new URL(buildRequestAccessMailto({ email: "visitor@example.com", name: "QA\r\nName", interest: "Community\r\nBcc:other@example.com" }));
  assert.doesNotMatch(injected.searchParams.get("subject")!, /[\r\n]|Bcc/);
  assert.match(injected.searchParams.get("body")!, /Name: QA Name\n/);
});

test("account/create presents Request Access with preserved canonical and share asset", () => {
  assert.match(page, /title: "Request Access"/);
  assert.match(page, /canonical: "\/account\/create"/);
  assert.match(page, /\/share\/account-create\.png/);
  assert.match(page, />REQUEST ACCESS</);
  assert.match(page, /<h1[^>]*>Join the next wave\.<\/h1>/);
  assert.match(page, /<RequestAccessForm \/>/);
  assert.doesNotMatch(page, /AccountAccessForm/);
  assert.match(page, /href="\/account\/sign-in">Already have access\? Sign In/);
  assert.match(page, /href="\/entertainment"[^>]*>Explore Entertainment/);
});

test("dedicated conversion collects only approved fields and explains the mail handoff", () => {
  assert.deepEqual([...form.matchAll(/name="([^"]+)"/g)].map(match => match[1]), ["email", "name", "interest"]);
  assert.match(form, /name="email" type="email" required/);
  assert.match(form, /requestAccessInterests\.map/);
  assert.match(form, /does not create an account\. Access is not guaranteed/);
  assert.match(form, /Review and send the prepared email yourself/);
  assert.match(form, /does not store your details or send the email/);
  assert.match(form, /type="submit"[^>]*>Prepare Access Request/);
  assert.match(form, /window\.location\.href = mailto/);
  assert.match(form, /role="status" aria-live="polite"/);
  assert.doesNotMatch(form, /Request sent|You're on the list|Account created|We'll approve you soon|Submit Request/i);
  assert.doesNotMatch(form, /fetch\(|\/api\/|supabase|localStorage|sessionStorage|Turnstile|password|payment|captcha/i);
});

test("public admission and the existing server rejection remain closed", () => {
  assert.equal(PUBLIC_ACCOUNT_CREATION_AVAILABLE, false);
  const route = source("../app/api/membership/session/route.ts");
  const rejection = route.slice(route.indexOf('if (body.action === "create")'), route.indexOf('if (body.action !== "sign-in")'));
  assert.match(rejection, /ACCOUNT_ADMISSION_CLOSED/);
  assert.match(rejection, /status: 403/);
  assert.match(rejection, /accountCreationAvailable: PUBLIC_ACCOUNT_CREATION_AVAILABLE/);
  assert.doesNotMatch(route, /\.signUp\(/);
  assert.match(source("./membership-store.ts"), /process\.env\.NODE_ENV !== "production" && process\.env\.MEMBERSHIP_SANDBOX_ENABLED === "true"/);
});
