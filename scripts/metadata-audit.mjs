// CRY-260 metadata audit: fetches each launch-critical route and checks
// canonical URL, <title> length (<=60), meta description length (140-160),
// and Open Graph title/description/image presence. Emits a markdown table.
// Usage: node scripts/metadata-audit.mjs [baseUrl]
import { writeFile } from "node:fs/promises";

const BASE = process.argv[2] || "https://demo.crypticdesign.net";
const ROUTES = [
  "/", "/entertainment", "/professional", "/search", "/account/create",
  "/professional/case-studies", "/professional/articles",
  "/professional/articles/holistic-ux-design-systems-thinking",
  "/entertainment/visual-studies", "/entertainment/store",
  "/products", "/products/singularis", "/audio", "/privacy", "/terms",
];

const pick = (html, re) => (html.match(re)?.[1] ?? "").trim();

const rows = [];
for (const route of ROUTES) {
  let html = "";
  try {
    const r = await fetch(BASE + route, { headers: { "User-Agent": "Mozilla/5.0" } });
    html = await r.text();
  } catch (e) {
    rows.push({ route, error: e.message.slice(0, 60) });
    continue;
  }
  const title = pick(html, /<title>([^<]*)<\/title>/i);
  const desc = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const ogTitle = /property=["']og:title["']/i.test(html);
  const ogDesc = /property=["']og:description["']/i.test(html);
  const ogImg = pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
  rows.push({ route, title, titleLen: title.length, descLen: desc.length, canonical, ogTitle, ogDesc, ogImg });
}

const problems = [];
for (const r of rows) {
  if (r.error) { problems.push(`${r.route}: fetch error — ${r.error}`); continue; }
  if (!r.title) problems.push(`${r.route}: missing <title>`);
  else if (r.titleLen > 60) problems.push(`${r.route}: title ${r.titleLen} chars > 60`);
  if (r.descLen === 0) problems.push(`${r.route}: missing meta description`);
  else if (r.descLen < 140 || r.descLen > 160) problems.push(`${r.route}: description ${r.descLen} chars (want 140-160)`);
  if (!r.canonical) problems.push(`${r.route}: missing canonical`);
  if (!r.ogTitle) problems.push(`${r.route}: missing og:title`);
  if (!r.ogDesc) problems.push(`${r.route}: missing og:description`);
  if (!r.ogImg) problems.push(`${r.route}: missing og:image`);
  else if (/share\.png$/.test(r.ogImg)) problems.push(`${r.route}: og:image is the generic placeholder (share.png) — CRY-260 per-route art pending`);
}

const header = "| Route | Title len | Desc len | Canonical | og:title | og:desc | og:image |";
const sep = "|---|---|---|---|---|---|---|";
const lines = rows.map((r) => r.error
  ? `| ${r.route} | ERR | ERR | - | - | - | ${r.error} |`
  : `| ${r.route} | ${r.titleLen} | ${r.descLen} | ${r.canonical ? "y" : "n"} | ${r.ogTitle ? "y" : "n"} | ${r.ogDesc ? "y" : "n"} | ${/share\.png$/.test(r.ogImg) ? "generic" : (r.ogImg ? "custom" : "n")} |`);

const md = [
  `# CRY-260 Metadata Audit — ${BASE}`,
  `Generated ${new Date().toISOString()} · ${ROUTES.length} routes`,
  "",
  problems.length ? `## Findings (${problems.length})` : "## No findings",
  ...problems.map((p) => `- ${p}`),
  "",
  "## Full table",
  header, sep, ...lines,
].join("\n");

await writeFile("metadata-audit-report.md", md, "utf8");
console.log(md);
console.log(`\nFINDINGS: ${problems.length}`);
