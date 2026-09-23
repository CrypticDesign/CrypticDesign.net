import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown, summarizeMeasurement, summarizeProbeResult } from "./external-http-audit.mjs";

function passingProbe(region = "Northern America") {
  return {
    probe: { continent: "NA", region, country: "US", state: "TX", city: "Austin", asn: 64500, network: "Example Network", tags: ["eyeball-network"] },
    result: {
      status: "finished",
      statusCode: 200,
      statusCodeName: "OK",
      resolvedAddress: "192.0.2.1",
      rawBody: "<!doctype html><html><body>Cryptic Design</body></html>",
      truncated: false,
      headers: { "content-type": "text/html; charset=utf-8", server: "Netlify" },
      timings: { total: 120, dns: 10, tcp: 20, tls: 30, firstByte: 50, download: 10 },
      tls: { authorized: true, protocol: "TLSv1.3", cipherName: "TLS_AES_256_GCM_SHA384", subject: { CN: "crypticdesign.net" }, issuer: { CN: "Example CA" }, createdAt: "2026-01-01T00:00:00Z", expiresAt: "2027-01-01T00:00:00Z" },
    },
  };
}

test("summarizeProbeResult passes a resolved authorized HTML response", () => {
  const summary = summarizeProbeResult(passingProbe());
  assert.equal(summary.pass, true);
  assert.equal(summary.statusCode, 200);
  assert.equal(summary.tls.authorized, true);
  assert.deepEqual(summary.failures, []);
});

test("summarizeProbeResult identifies DNS, TLS, HTTP, and rendering boundaries", () => {
  const probe = passingProbe();
  probe.result.resolvedAddress = null;
  probe.result.tls = null;
  probe.result.statusCode = 503;
  probe.result.headers["content-type"] = "text/plain";
  probe.result.rawBody = "unavailable";
  const summary = summarizeProbeResult(probe);
  assert.equal(summary.pass, false);
  assert.deepEqual(summary.failures.map(({ layer }) => layer), ["dns", "tls", "http", "rendering", "rendering"]);
});

test("summarizeProbeResult accepts an explicitly allowed HTTPS redirect", () => {
  const probe = passingProbe();
  probe.result.statusCode = 301;
  probe.result.statusCodeName = "Moved Permanently";
  probe.result.headers = { location: "https://crypticdesign.net/" };
  probe.result.rawBody = null;
  const summary = summarizeProbeResult(probe, { acceptRedirects: true, requestedUrl: "https://www.crypticdesign.net/" });
  assert.equal(summary.pass, true);
  assert.equal(summary.acceptedRedirect, "https://crypticdesign.net/");
});

test("summarizeMeasurement requires three passing regions", () => {
  const measurement = { id: "measure-1", status: "finished", createdAt: "2026-09-22T00:00:00Z", updatedAt: "2026-09-22T00:00:01Z", probesCount: 3, results: [passingProbe("Northern America"), passingProbe("Western Europe"), passingProbe("Australia and New Zealand")] };
  const summary = summarizeMeasurement(measurement, "https://demo.crypticdesign.net/");
  assert.equal(summary.pass, true);
  assert.equal(summary.probes.length, 3);
});

test("renderMarkdown records regional delivery evidence and the browser boundary", () => {
  const report = {
    ticket: "CRY-432",
    generatedAt: "2026-09-22T00:00:00Z",
    baseUrl: "https://demo.crypticdesign.net/",
    pass: true,
    routes: [{
      clients: [
        { client: "automated", requestedUrl: "https://demo.crypticdesign.net/", finalUrl: "https://demo.crypticdesign.net/", redirected: false, statusCode: 200, elapsedMs: 100, bodyBytes: 1000, pass: true, failures: [] },
        { client: "mobile-browser", requestedUrl: "https://demo.crypticdesign.net/", finalUrl: "https://demo.crypticdesign.net/", redirected: false, statusCode: 200, elapsedMs: 105, bodyBytes: 1000, pass: true, failures: [] },
      ],
      global: summarizeMeasurement({ id: "measure-1", status: "finished", createdAt: "2026-09-22T00:00:00Z", updatedAt: "2026-09-22T00:00:01Z", probesCount: 3, results: [passingProbe(), passingProbe("Western Europe"), passingProbe("Australia and New Zealand")] }, "https://demo.crypticdesign.net/"),
    }],
  };
  const markdown = renderMarkdown(report);
  assert.match(markdown, /Verdict: \*\*PASS\*\*/);
  assert.match(markdown, /mobile-browser/);
  assert.match(markdown, /Western Europe/);
  assert.match(markdown, /human-browser or operational verification/);
});
