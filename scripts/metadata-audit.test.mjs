import assert from "node:assert/strict";
import test from "node:test";
import {
  auditPage,
  auditSite,
  extractMetadata,
  parseSitemap,
  renderMarkdown,
} from "./metadata-audit.mjs";

const description = "A carefully written metadata description that gives readers a clear, accurate preview of this published page while staying inside the target character range.";

function pageHtml(url, overrides = {}) {
  const values = {
    title: "Published page | Cryptic Design",
    description,
    canonical: url,
    ogTitle: "Published page | Cryptic Design",
    ogDescription: description,
    ogImage: "https://crypticdesign.net/social/published-page.png",
    ogUrl: url,
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    ...overrides,
  };
  return `<!doctype html><html><head>
    <title>${values.title}</title>
    <meta name="description" content="${values.description}">
    <link rel="canonical" href="${values.canonical}">
    <meta property="og:title" content="${values.ogTitle}">
    <meta property="og:description" content="${values.ogDescription}">
    <meta property="og:image" content="${values.ogImage}">
    <meta property="og:url" content="${values.ogUrl}">
    <meta name="twitter:card" content="${values.twitterCard}">
    ${values.twitterTitle ? `<meta name="twitter:title" content="${values.twitterTitle}">` : ""}
    ${values.twitterDescription ? `<meta name="twitter:description" content="${values.twitterDescription}">` : ""}
    ${values.twitterImage ? `<meta name="twitter:image" content="${values.twitterImage}">` : ""}
  </head><body></body></html>`;
}

test("parseSitemap keeps only same-origin URLs, then deduplicates and sorts", () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://crypticdesign.net/z</loc></url>
    <url><loc>https://outside.example/nope</loc></url>
    <url><loc>https://crypticdesign.net/a</loc></url>
    <url><loc>https://crypticdesign.net/z</loc></url>
  </urlset>`;
  assert.deepEqual(parseSitemap(xml), [
    "https://crypticdesign.net/a",
    "https://crypticdesign.net/z",
  ]);
});

test("Open Graph fallbacks satisfy X title, description, and image requirements", () => {
  const url = "https://crypticdesign.net/releases/example";
  const metadata = extractMetadata(pageHtml(url, { ogUrl: "" }), url);
  const result = auditPage({ requestedUrl: url, metadata });

  assert.equal(result.findings.filter((item) => item.severity === "blocker").length, 0);
  assert.equal(metadata.twitter.titleSource, "og fallback");
  assert.equal(metadata.twitter.descriptionSource, "og fallback");
  assert.equal(metadata.twitter.imageSource, "og fallback");
});

test("canonical defects block while length and generic artwork findings advise", () => {
  const url = "https://crypticdesign.net/video";
  const metadata = extractMetadata(pageHtml(url, {
    description: "Too short.",
    canonical: "https://outside.example/video",
    ogImage: "/share.png",
  }), url);
  const result = auditPage({ requestedUrl: url, metadata });

  assert.deepEqual(result.findings.filter((item) => item.severity === "blocker").map((item) => item.field), ["canonical"]);
  assert.deepEqual(result.findings.filter((item) => item.severity === "advisory").map((item) => item.field), ["description", "og:image"]);
});

test("auditSite requests only sitemap-derived pages and reports ticket boundaries", async () => {
  const calls = [];
  const sitemap = `<?xml version="1.0"?><urlset>
    <url><loc>https://crypticdesign.net/b</loc></url>
    <url><loc>https://crypticdesign.net/a</loc></url>
  </urlset>`;
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.endsWith("sitemap.xml")) return new Response(sitemap, { status: 200 });
    return new Response(pageHtml(url), { status: 200 });
  };

  const audit = await auditSite("https://crypticdesign.net", { fetchImpl, concurrency: 1 });
  assert.deepEqual(calls, [
    "https://crypticdesign.net/sitemap.xml",
    "https://crypticdesign.net/a",
    "https://crypticdesign.net/b",
  ]);
  assert.equal(audit.blockers.length, 0);
  const report = renderMarkdown(audit);
  assert.match(report, /CRY-446/);
  assert.match(report, /CRY-433/);
  assert.match(report, /CRY-436/);
});
