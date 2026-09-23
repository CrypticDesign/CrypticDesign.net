import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_ROOT = "https://api.globalping.io/v1";
const USER_AGENT = "CrypticDesign.net-CRY-432-Audit/1.0 (+https://crypticdesign.net)";
const DEFAULT_BASE_URL = "https://demo.crypticdesign.net";
const DEFAULT_ROUTES = ["/", "/products/singularis"];
const DEFAULT_LOCATIONS = [
  { region: "Northern America", limit: 1 },
  { region: "Western Europe", limit: 1 },
  { region: "Australia and New Zealand", limit: 1 },
];
const DEFAULT_CLIENTS = [
  { name: "automated", userAgent: USER_AGENT },
  { name: "desktop-browser", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36" },
  { name: "mobile-browser", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1" },
  { name: "search-crawler", userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "social-crawler", userAgent: "Twitterbot/1.0" },
];
const SELECTED_HEADERS = [
  "cache-control",
  "content-type",
  "location",
  "server",
  "strict-transport-security",
  "vary",
  "x-nf-request-id",
];

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function chicagoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function pickHeaders(headers = {}) {
  const normalized = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return Object.fromEntries(
    SELECTED_HEADERS.filter((name) => normalized[name] != null).map((name) => [name, normalized[name]]),
  );
}

function isApprovedSameSiteRedirect(location, requestedUrl) {
  if (!location || !requestedUrl) return false;
  try {
    const requested = new URL(requestedUrl);
    const target = new URL(location, requested);
    const normalizeHost = (host) => host.toLowerCase().replace(/^www\./, "");
    return target.protocol === "https:"
      && normalizeHost(target.hostname) === normalizeHost(requested.hostname)
      && target.pathname === requested.pathname;
  } catch {
    return false;
  }
}

export function summarizeProbeResult(item, { acceptRedirects = false, requestedUrl } = {}) {
  const result = item?.result ?? {};
  const headers = pickHeaders(result.headers);
  const failures = [];

  if (result.status !== "finished") failures.push({ layer: "probe", detail: result.rawOutput || result.status || "unknown failure" });
  if (!result.resolvedAddress) failures.push({ layer: "dns", detail: "No resolved address was returned." });
  if (!result.tls) failures.push({ layer: "tls", detail: "No TLS certificate evidence was returned." });
  else if (!result.tls.authorized) failures.push({ layer: "tls", detail: result.tls.error || "Certificate was not authorized." });
  const isAcceptedRedirect = acceptRedirects
    && result.statusCode >= 300
    && result.statusCode < 400
    && isApprovedSameSiteRedirect(headers.location, requestedUrl);
  if (result.statusCode !== 200 && !isAcceptedRedirect) failures.push({ layer: "http", detail: `Expected HTTP 200, received ${result.statusCode ?? "no status"}.` });
  const contentType = Array.isArray(headers["content-type"]) ? headers["content-type"].join("; ") : headers["content-type"];
  if (!isAcceptedRedirect && !contentType?.toLowerCase().includes("text/html")) failures.push({ layer: "rendering", detail: "Response was not identified as HTML." });
  if (!isAcceptedRedirect && (typeof result.rawBody !== "string" || !/<(?:!doctype|html)[\s>]/i.test(result.rawBody))) {
    failures.push({ layer: "rendering", detail: "The returned body did not contain an HTML document marker." });
  }

  return {
    probe: {
      continent: item?.probe?.continent ?? null,
      region: item?.probe?.region ?? null,
      country: item?.probe?.country ?? null,
      state: item?.probe?.state ?? null,
      city: item?.probe?.city ?? null,
      asn: item?.probe?.asn ?? null,
      network: item?.probe?.network ?? null,
      tags: item?.probe?.tags ?? [],
    },
    status: result.status ?? "unknown",
    statusCode: result.statusCode ?? null,
    statusCodeName: result.statusCodeName ?? null,
    resolvedAddress: result.resolvedAddress ?? null,
    timings: result.timings ?? null,
    tls: result.tls
      ? {
          authorized: result.tls.authorized,
          protocol: result.tls.protocol ?? null,
          cipherName: result.tls.cipherName ?? null,
          subject: result.tls.subject ?? null,
          issuer: result.tls.issuer ?? null,
          createdAt: result.tls.createdAt ?? null,
          expiresAt: result.tls.expiresAt ?? null,
        }
      : null,
    headers,
    acceptedRedirect: isAcceptedRedirect ? headers.location : null,
    bodyTruncated: Boolean(result.truncated),
    pass: failures.length === 0,
    failures,
  };
}

export function summarizeMeasurement(measurement, requestedUrl, { acceptRedirects = false } = {}) {
  const probes = (measurement.results ?? []).map((item) => summarizeProbeResult(item, { acceptRedirects, requestedUrl }));
  return {
    requestedUrl,
    measurementId: measurement.id,
    measurementUrl: `${API_ROOT}/measurements/${measurement.id}`,
    status: measurement.status,
    createdAt: measurement.createdAt,
    updatedAt: measurement.updatedAt,
    probesCount: measurement.probesCount,
    pass: measurement.status === "finished" && probes.length >= 3 && probes.every((probe) => probe.pass),
    probes,
  };
}

async function checkedJson(response, operation) {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${operation} failed with HTTP ${response.status}: ${detail.slice(0, 600)}`);
  }
  return response.json();
}

async function createMeasurement(url, { fetchImpl = fetch, locations = DEFAULT_LOCATIONS } = {}) {
  const response = await fetchImpl(`${API_ROOT}/measurements`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "user-agent": USER_AGENT,
    },
    body: JSON.stringify({
      type: "http",
      target: url.hostname,
      locations,
      timeout: 30,
      measurementOptions: {
        protocol: url.protocol === "http:" ? "HTTP" : "HTTPS",
        port: url.port ? Number(url.port) : url.protocol === "http:" ? 80 : 443,
        request: {
          path: `${url.pathname}${url.search}`,
          method: "GET",
          headers: { Accept: "text/html,application/xhtml+xml" },
        },
      },
    }),
  });
  return checkedJson(response, `Creating measurement for ${url}`);
}

async function pollMeasurement(id, { fetchImpl = fetch, timeoutMs = 70_000 } = {}) {
  const endpoint = `${API_ROOT}/measurements/${id}`;
  const deadline = Date.now() + timeoutMs;
  let etag;

  while (Date.now() < deadline) {
    const response = await fetchImpl(endpoint, {
      headers: {
        "accept": "application/json",
        "user-agent": USER_AGENT,
        ...(etag ? { "if-none-match": etag } : {}),
      },
    });
    if (response.status !== 304) {
      const payload = await checkedJson(response, `Polling measurement ${id}`);
      etag = response.headers.get("etag") ?? etag;
      if (payload.status !== "in-progress") return payload;
    }
    await sleep(750);
  }
  throw new Error(`Measurement ${id} did not finish within ${timeoutMs}ms.`);
}

async function runLocalRequest(url, { fetchImpl = fetch, client = DEFAULT_CLIENTS[0] } = {}) {
  const startedAt = performance.now();
  const response = await fetchImpl(url, {
    redirect: "follow",
    headers: { "accept": "text/html,application/xhtml+xml", "user-agent": client.userAgent },
  });
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const failures = [];
  const sameSiteFinal = isApprovedSameSiteRedirect(response.url, url.toString()) || response.url === url.toString();
  if (response.status !== 200) failures.push({ layer: "http", detail: `Expected HTTP 200, received ${response.status}.` });
  if (!sameSiteFinal) failures.push({ layer: "redirect", detail: `Final URL left the approved HTTPS host family: ${response.url}` });
  if (!contentType.toLowerCase().includes("text/html")) failures.push({ layer: "rendering", detail: "Response was not identified as HTML." });
  if (!/<(?:!doctype|html)[\s>]/i.test(body)) failures.push({ layer: "rendering", detail: "Response did not contain an HTML document marker." });

  return {
    client: client.name,
    requestedUrl: url.toString(),
    finalUrl: response.url,
    redirected: response.redirected,
    statusCode: response.status,
    elapsedMs: Math.round(performance.now() - startedAt),
    contentType,
    bodyBytes: Buffer.byteLength(body),
    pass: failures.length === 0,
    failures,
  };
}

export async function auditExternalHttp(baseUrl, {
  routes = DEFAULT_ROUTES,
  locations = DEFAULT_LOCATIONS,
  clients = DEFAULT_CLIENTS,
  ticket = "CRY-432",
  acceptRedirects = false,
  fetchImpl = fetch,
} = {}) {
  const base = new URL(baseUrl);
  const routeResults = [];

  for (const route of routes) {
    const url = new URL(route, base);
    const clientResults = [];
    for (const client of clients) clientResults.push(await runLocalRequest(url, { fetchImpl, client }));
    const created = await createMeasurement(url, { fetchImpl, locations });
    const measurement = await pollMeasurement(created.id, { fetchImpl });
    routeResults.push({ clients: clientResults, global: summarizeMeasurement(measurement, url.toString(), { acceptRedirects }) });
  }

  return {
    ticket,
    generatedAt: new Date().toISOString(),
    baseUrl: base.toString(),
    locations,
    pass: routeResults.every(({ clients: clientResults, global }) => clientResults.every((client) => client.pass) && global.pass),
    routes: routeResults,
  };
}

function probeLabel(probe) {
  return [probe.city, probe.state, probe.country, probe.region].filter(Boolean).join(", ");
}

export function renderMarkdown(report) {
  const lines = [
    `# ${report.ticket} External HTTP Accessibility Audit`,
    "",
    `Generated: ${report.generatedAt}`,
    `Target: ${report.baseUrl}`,
    `Verdict: **${report.pass ? "PASS" : "FAIL"}**`,
    "",
    "This report compares a normal automated client with three geographically distributed Globalping probes. Browser rendering is verified separately because Globalping validates HTTP delivery rather than JavaScript execution.",
  ];

  for (const route of report.routes) {
    lines.push(
      "",
      `## ${new URL(route.clients[0].requestedUrl).pathname}`,
      "",
      "| Client profile | HTTP | Redirected | Final URL | Time | Result |",
      "|---|---:|---|---|---:|---|",
      ...route.clients.map((client) => `| ${client.client} | ${client.statusCode} | ${client.redirected ? "yes" : "no"} | \`${client.finalUrl}\` | ${client.elapsedMs} ms | ${client.pass ? "PASS" : "FAIL"} |`),
      "",
      `Global measurement: [${route.global.measurementId}](${route.global.measurementUrl}) — ${route.global.pass ? "PASS" : "FAIL"}.`,
      "",
      "| Probe | Network | HTTP | DNS/IP | TLS | Total | Result |",
      "|---|---|---:|---|---|---:|---|",
    );
    for (const probe of route.global.probes) {
      lines.push(`| ${probeLabel(probe.probe)} | ${probe.probe.network ?? "—"} | ${probe.statusCode ?? "—"} | ${probe.resolvedAddress ?? "—"} | ${probe.tls?.authorized ? `${probe.tls.protocol} authorized` : "failed/missing"} | ${probe.timings?.total ?? "—"} ms | ${probe.pass ? "PASS" : "FAIL"} |`);
    }
    const failures = [...route.clients, ...route.global.probes].flatMap((item) => item.failures ?? []);
    if (failures.length) {
      lines.push("", "Failures:", "", ...failures.map((failure) => `- ${failure.layer}: ${failure.detail}`));
    }
  }

  lines.push(
    "",
    "## Boundary conclusion",
    "",
    report.pass
      ? "No deterministic DNS, TLS, HTTP, or initial-HTML delivery boundary was identified across the tested routes and regions."
      : "At least one deterministic delivery failure was observed. Use the layer-tagged failures above to route remediation.",
    "",
    "## Ticket disposition",
    "",
    report.pass
      ? `The automated portions of ${report.ticket} acceptance pass. Add any separately required human-browser or operational verification before closing the ticket.`
      : `${report.ticket} remains open. Create a bounded remediation issue for each distinct failing infrastructure boundary.`,
    "",
  );
  return lines.join("\n");
}

export function parseArgs(argv) {
  const values = Object.fromEntries(argv.filter((arg) => arg.startsWith("--") && arg.includes("=")).map((arg) => arg.slice(2).split(/=(.*)/s, 2)));
  return {
    baseUrl: values.base || DEFAULT_BASE_URL,
    outDir: values["out-dir"] || path.join("artifacts", "CRY-432"),
    ticket: values.ticket || "CRY-432",
    acceptRedirects: values["accept-redirects"] === "true",
    routes: values.routes
      ? values.routes.split(",").map((route) => route.trim()).filter(Boolean)
      : DEFAULT_ROUTES,
  };
}

async function main() {
  const { baseUrl, outDir, ticket, acceptRedirects, routes } = parseArgs(process.argv.slice(2));
  const report = await auditExternalHttp(baseUrl, { ticket, acceptRedirects, routes });
  const date = chicagoDate();
  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${date}-external-http-audit.json`);
  const markdownPath = path.join(outDir, `${date}-external-http-audit.md`);
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, `${renderMarkdown(report)}\n`, "utf8");
  console.log(renderMarkdown(report));
  console.log(`\nEvidence written to ${jsonPath} and ${markdownPath}`);
  if (!report.pass) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
