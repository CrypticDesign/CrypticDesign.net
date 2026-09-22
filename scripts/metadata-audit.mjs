import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as cheerio from "cheerio";

export const DEFAULT_BASE_URL = "https://crypticdesign.net/";
export const DEFAULT_REPORT_PATH = "metadata-audit-report.md";

const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;
const TITLE_MAX = 60;

export function normalizeBaseUrl(value = DEFAULT_BASE_URL) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

export function comparableUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
  return url.href;
}

function safeComparableUrl(value) {
  try {
    return comparableUrl(value);
  } catch {
    return null;
  }
}

function absoluteUrl(value, pageUrl) {
  if (!value) return "";
  try {
    return new URL(value, pageUrl).href;
  } catch {
    return value;
  }
}

export function parseSitemap(xml, baseUrl = DEFAULT_BASE_URL) {
  const base = normalizeBaseUrl(baseUrl);
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls = new Set();

  $("loc").each((_, element) => {
    const value = $(element).text().trim();
    if (!value) return;
    try {
      const url = new URL(value, base);
      url.hash = "";
      if (url.origin === base.origin) urls.add(url.href);
    } catch {
      // Invalid sitemap entries are ignored; the sitemap fetch itself remains audited.
    }
  });

  return [...urls].sort((left, right) => left.localeCompare(right));
}

function metaContent($, selector) {
  return $(selector).first().attr("content")?.trim() ?? "";
}

export function extractMetadata(html, pageUrl) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const description = metaContent($, 'meta[name="description"]');
  const canonical = absoluteUrl($("link[rel~='canonical']").first().attr("href")?.trim(), pageUrl);
  const openGraph = {
    title: metaContent($, 'meta[property="og:title"]'),
    description: metaContent($, 'meta[property="og:description"]'),
    image: absoluteUrl(metaContent($, 'meta[property="og:image"]'), pageUrl),
    url: absoluteUrl(metaContent($, 'meta[property="og:url"]'), pageUrl),
  };
  const explicitTwitter = {
    card: metaContent($, 'meta[name="twitter:card"]'),
    title: metaContent($, 'meta[name="twitter:title"]'),
    description: metaContent($, 'meta[name="twitter:description"]'),
    image: absoluteUrl(metaContent($, 'meta[name="twitter:image"]'), pageUrl),
  };

  const twitter = {
    card: explicitTwitter.card,
    title: explicitTwitter.title || openGraph.title,
    description: explicitTwitter.description || openGraph.description,
    image: explicitTwitter.image || openGraph.image,
    titleSource: explicitTwitter.title ? "twitter" : openGraph.title ? "og fallback" : "missing",
    descriptionSource: explicitTwitter.description ? "twitter" : openGraph.description ? "og fallback" : "missing",
    imageSource: explicitTwitter.image ? "twitter" : openGraph.image ? "og fallback" : "missing",
  };

  return { title, description, canonical, openGraph, twitter };
}

function finding(severity, field, message) {
  return { severity, field, message };
}

function validateTargetUrl(findings, field, actual, expected, origin) {
  if (!actual) return;
  const parsed = safeComparableUrl(actual);
  if (!parsed) {
    findings.push(finding("blocker", field, `${field} is not a valid URL: ${actual}`));
    return;
  }
  if (new URL(parsed).origin !== origin) {
    findings.push(finding("blocker", field, `${field} is off-origin: ${actual}`));
  } else if (parsed !== comparableUrl(expected)) {
    findings.push(finding("blocker", field, `${field} points to ${actual}; expected ${expected}`));
  }
}

export function auditPage({ requestedUrl, finalUrl = requestedUrl, status = 200, metadata, error = "" }) {
  const findings = [];
  const requested = new URL(requestedUrl);

  if (error) findings.push(finding("blocker", "fetch", error));
  else if (status < 200 || status >= 300) findings.push(finding("blocker", "http", `HTTP ${status}`));

  if (!metadata) return { requestedUrl, finalUrl, status, metadata: null, findings };

  if (!metadata.title) findings.push(finding("blocker", "title", "Missing <title>"));
  if (!metadata.description) findings.push(finding("blocker", "description", "Missing meta description"));
  if (!metadata.canonical) findings.push(finding("blocker", "canonical", "Missing canonical URL"));

  for (const field of ["title", "description", "image"]) {
    if (!metadata.openGraph[field]) findings.push(finding("blocker", `og:${field}`, `Missing og:${field}`));
  }
  if (!metadata.twitter.card) findings.push(finding("blocker", "twitter:card", "Missing twitter:card"));
  for (const field of ["title", "description", "image"]) {
    if (!metadata.twitter[field]) findings.push(finding("blocker", `twitter:${field}`, `Missing twitter:${field} and og:${field} fallback`));
  }

  validateTargetUrl(findings, "canonical", metadata.canonical, requestedUrl, requested.origin);

  if (metadata.title && metadata.title.length > TITLE_MAX) {
    findings.push(finding("advisory", "title", `Title is ${metadata.title.length} characters; target is <= ${TITLE_MAX}`));
  }
  if (metadata.description && (metadata.description.length < DESCRIPTION_MIN || metadata.description.length > DESCRIPTION_MAX)) {
    findings.push(finding("advisory", "description", `Description is ${metadata.description.length} characters; target is ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}`));
  }
  if (metadata.openGraph.image && /\/share\.png(?:[?#]|$)/i.test(metadata.openGraph.image)) {
    findings.push(finding("advisory", "og:image", "Uses generic /share.png artwork"));
  }

  return { requestedUrl, finalUrl, status, metadata, findings };
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function fetchText(fetchImpl, url) {
  const response = await fetchImpl(url, {
    headers: { "User-Agent": "CrypticDesign-MetadataAudit/1.0" },
    redirect: "manual",
    signal: AbortSignal.timeout(25_000),
  });
  return { response, text: await response.text() };
}

export async function auditSite(baseUrl = DEFAULT_BASE_URL, options = {}) {
  const base = normalizeBaseUrl(baseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;
  const sitemapUrl = new URL("sitemap.xml", base).href;
  const startedAt = new Date().toISOString();
  const { response: sitemapResponse, text: sitemapXml } = await fetchText(fetchImpl, sitemapUrl);
  if (!sitemapResponse.ok) throw new Error(`Sitemap fetch failed: HTTP ${sitemapResponse.status} at ${sitemapUrl}`);

  const urls = parseSitemap(sitemapXml, base);
  if (urls.length === 0) throw new Error(`Sitemap contained no same-origin URLs: ${sitemapUrl}`);

  const pages = await mapConcurrent(urls, options.concurrency ?? 6, async (url) => {
    try {
      const { response, text } = await fetchText(fetchImpl, url);
      const location = response.headers.get("location");
      const finalUrl = location ? new URL(location, url).href : response.url || url;
      return auditPage({ requestedUrl: url, finalUrl, status: response.status, metadata: extractMetadata(text, finalUrl) });
    } catch (error) {
      return auditPage({ requestedUrl: url, status: 0, metadata: null, error: error instanceof Error ? error.message : String(error) });
    }
  });

  const blockers = pages.flatMap((page) => page.findings.filter((item) => item.severity === "blocker").map((item) => ({ url: page.requestedUrl, ...item })));
  const advisories = pages.flatMap((page) => page.findings.filter((item) => item.severity === "advisory").map((item) => ({ url: page.requestedUrl, ...item })));
  return { baseUrl: base.href, sitemapUrl, startedAt, completedAt: new Date().toISOString(), urls, pages, blockers, advisories };
}

function mark(value) {
  return value ? "yes" : "no";
}

function cell(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderMarkdown(audit) {
  const lines = [
    `# CRY-260 Metadata Audit — ${audit.baseUrl}`,
    "",
    `Generated ${audit.completedAt} from [${audit.sitemapUrl}](${audit.sitemapUrl}).`,
    "",
    `- Published URLs audited: ${audit.pages.length}`,
    `- Blocking findings: ${audit.blockers.length}`,
    `- Advisories: ${audit.advisories.length}`,
    "",
    "## Blocking findings",
    "",
    ...(audit.blockers.length ? audit.blockers.map((item) => `- **${item.field}** — ${item.url}: ${item.message}`) : ["None."]),
    "",
    "## Advisories",
    "",
    ...(audit.advisories.length ? audit.advisories.map((item) => `- **${item.field}** — ${item.url}: ${item.message}`) : ["None."]),
    "",
    "## Full route matrix",
    "",
    "| URL | HTTP | Title | Desc | Canonical | OG title | OG desc | OG image | OG URL | X card | X title | X desc | X image | B | A |",
    "|---|---:|---:|---:|---|---|---|---|---|---|---|---|---|---:|---:|",
  ];

  for (const page of audit.pages) {
    const m = page.metadata;
    const blockers = page.findings.filter((item) => item.severity === "blocker").length;
    const advisories = page.findings.filter((item) => item.severity === "advisory").length;
    lines.push(`| ${cell(page.requestedUrl)} | ${page.status || "ERR"} | ${m?.title.length ?? 0} | ${m?.description.length ?? 0} | ${mark(m?.canonical)} | ${mark(m?.openGraph.title)} | ${mark(m?.openGraph.description)} | ${mark(m?.openGraph.image)} | ${mark(m?.openGraph.url)} | ${mark(m?.twitter.card)} | ${cell(m?.twitter.titleSource ?? "missing")} | ${cell(m?.twitter.descriptionSource ?? "missing")} | ${cell(m?.twitter.imageSource ?? "missing")} | ${blockers} | ${advisories} |`);
  }

  lines.push(
    "",
    "## Scope boundaries",
    "",
    "- Information architecture and route-removal decisions belong to CRY-446.",
    "- Crawl policy and indexing controls belong to CRY-433.",
    "- External platform unfurl validation belongs to CRY-436.",
    "- This audit does not invent artwork, alter analytics, or change provider configuration.",
    "",
  );
  return lines.join("\n");
}

export async function writeReport(audit, reportPath = DEFAULT_REPORT_PATH) {
  const resolved = path.resolve(reportPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, renderMarkdown(audit), "utf8");
  return resolved;
}

export async function main(argv = process.argv.slice(2)) {
  const audit = await auditSite(argv[0] || DEFAULT_BASE_URL);
  const resolved = await writeReport(audit, argv[1] || DEFAULT_REPORT_PATH);
  console.log(`Audited ${audit.pages.length} sitemap URLs.`);
  console.log(`Blocking findings: ${audit.blockers.length}; advisories: ${audit.advisories.length}.`);
  console.log(`Report: ${resolved}`);
  process.exitCode = audit.blockers.length > 0 ? 1 : 0;
  return audit;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
