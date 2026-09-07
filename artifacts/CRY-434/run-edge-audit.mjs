import { mkdir, writeFile } from "node:fs/promises";

const base = (process.argv[2] || "https://demo.crypticdesign.net").replace(/\/$/, "");
const output = "artifacts/CRY-434";
await mkdir(output, { recursive: true });

const userAgents = {
  browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
  googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  bingbot: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  social: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
};
const routes = ["/", "/entertainment", "/entertainment/explore", "/community", "/community/creators", "/community/groups", "/community/events", "/account/create", "/account/sign-in", "/professional", "/products/singularis", "/releases/singularis-themes-vol-1", "/robots.txt", "/sitemap.xml", "/share/home.png"];
const redirects = {
  "/home": "/",
  "/creative-works": "/entertainment",
  "/worlds": "/entertainment",
  "/labs": "/entertainment/visual-studies",
  "/soundwave": "/products/cryptic-signal",
  "/privacy-policy": "/privacy",
  "/entertainment/arcade": "/entertainment/explore",
  "/releases/singularis-vertical-slice": "/products/singularis",
};

const selectedHeaders = headers => Object.fromEntries([
  "server", "cache-control", "age", "etag", "vary", "content-type", "content-length",
  "location", "x-nf-request-id", "x-frame-options", "content-security-policy",
  "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security",
].map(name => [name, headers.get(name)]));
const direct = [];
const redirectResults = [];
const findings = [];

for (const [agent, value] of Object.entries(userAgents)) {
  for (const route of routes) {
    const response = await fetch(base + route, { redirect: "manual", headers: { "user-agent": value } });
    direct.push({ agent, route, status: response.status, headers: selectedHeaders(response.headers) });
    if (response.status !== 200) findings.push({ severity: "launch-blocking", type: "direct-route", agent, route, status: response.status });
  }
}

for (const [route, expectedPath] of Object.entries(redirects)) {
  const response = await fetch(base + route, { redirect: "manual", headers: { "user-agent": userAgents.browser } });
  const location = response.headers.get("location");
  const actualPath = location ? new URL(location, base).pathname : null;
  redirectResults.push({ route, status: response.status, location, expectedPath, pass: [301, 302, 307, 308].includes(response.status) && actualPath === expectedPath });
  if (![301, 302, 307, 308].includes(response.status) || actualPath !== expectedPath) findings.push({ severity: "launch-blocking", type: "redirect", route, status: response.status, location, expectedPath });
}

const root = direct.find(result => result.agent === "browser" && result.route === "/");
for (const name of ["x-frame-options", "content-security-policy", "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security"]) {
  if (!root?.headers[name]) findings.push({ severity: "follow-up", type: "missing-security-header", header: name });
}
const crawlerStatuses = direct.filter(r => r.agent !== "browser").map(r => r.status);
const result = {
  generatedAt: new Date().toISOString(), base, repositoryConfiguration: {
    netlifyTomlPresent: false,
    edgeFunctionsPresent: false,
    redirectsOwnedBy: "next.config.ts",
    note: "No repository netlify.toml or Netlify edge-function directory is present in exact current main.",
  },
  direct, redirects: redirectResults, findings,
  summary: {
    directChecks: direct.length,
    redirectChecks: redirectResults.length,
    unintendedCrawlerBlocking: crawlerStatuses.some(status => status !== 200),
    launchBlockingFindings: findings.filter(f => f.severity === "launch-blocking").length,
    followUpFindings: findings.filter(f => f.severity === "follow-up").length,
  },
};
result.disposition = result.summary.launchBlockingFindings === 0 ? "PASS_WITH_FOLLOW_UPS" : "FAIL";
await writeFile(`${output}/edge-audit-live.json`, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify({ disposition: result.disposition, summary: result.summary, followUps: findings.filter(f => f.severity === "follow-up"), evidence: `${output}/edge-audit-live.json` }, null, 2));
if (result.summary.launchBlockingFindings) process.exitCode = 1;
