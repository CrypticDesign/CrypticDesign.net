import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const repo = process.cwd();
const operations = join(repo, "..", "..");
const preservation = join(operations, "CRY-344_SquarespacePreservation_2026-08-11");
const output = join(repo, "artifacts", "CRY-344-closeout");
await mkdir(output, { recursive: true });

const manifest = JSON.parse(await readFile(join(preservation, "manifest.json"), "utf8"));
const destination = (path) => {
  if (path === "/" || path === "/home") return ["Rewrite/Merge", "/", "My Home replaces the legacy marketing home; company positioning is merged into Professional."];
  if (["/aboutcrypticdesign", "/services"].includes(path)) return ["Rewrite/Merge", "/professional", "Current company and services content is implemented in Professional."];
  if (path === "/products") return ["Merge/Redirect", "/products", "Canonical contextual product index."];
  if (path === "/singularis") return ["Merge/Redirect", "/products/singularis", "Canonical Singularis product destination."];
  if (["/lifa", "/lifa-demo", "/lifa-progress-reports"].includes(path) || path.startsWith("/lifa-progress-reports/")) return ["Merge/Redirect", "/products/lifa", "Legacy Lifa content and demo discovery merge into the canonical product context; the progress post is also retained as a Professional article."];
  if (path === "/soundwave") return ["Archive/Redirect", "/products/cryptic-signal", "Soundwave is retired; source preserved for provenance and public discovery moves to Cryptic Signal."];
  if (path === "/cryptic-academy") return ["Archive/Redirect", "/professional/articles", "Standalone Academy positioning is retired; retained writing lives in Articles."];
  if (["/crypticcareers", "/contact"].includes(path)) return ["Retire/Redirect", "/professional/inquiry", "Current single Professional inquiry route."];
  if (path === "/privacy-policy") return ["Migrate/Redirect", "/privacy", "Policy retained in the current legal route."];
  if (path === "/portfolio") return ["Merge/Redirect", "/professional", "No competing portfolio hierarchy."];
  if (path === "/portfolio/signal-systems") return ["Merge/Redirect", "/audio", "CS001 and Cryptic Signal context."];
  if (path === "/portfolio/humankind") return ["Migrate/Redirect", "/professional/case-studies", "Rights-cleared case-study destination."];
  if (path === "/portfolio/robert-croft") return ["Merge/Redirect", "/professional", "Founder experience is framed honestly in Professional."];
  if (path === "/store" || path === "/cart" || path.startsWith("/store/")) return ["Merge/Redirect", "/entertainment/store", "Catalog preview retained; checkout and pricing remain deferred."];
  if (path === "/articles") return ["Migrate/Redirect", "/professional/articles", "Canonical article index."];
  if (path.startsWith("/articles/category/") || path.startsWith("/articles/tag/")) return ["Retire/Redirect", "/professional/articles", "Generated taxonomy has no unique governed destination."];
  if (path === "/articles/player-psychology-game-design") return ["Retire/Redirect", "/professional/articles", "Stale sitemap URL returns 404 and has no live source content."];
  if (path.startsWith("/articles/")) return ["Migrate/Redirect", `/professional${path}`, "Approved article migrated to the governed article model."];
  return ["Archive", "—", "Public source is preserved; no active destination is asserted."];
};

const routeRows = manifest.inventory.map((item) => {
  const [disposition, target, reason] = destination(item.path);
  const rights = item.path.startsWith("/portfolio/") || item.path === "/services" ? "client-approved / owned" : "owned or public-source preservation";
  return { source: item.path, status: item.status, disposition, destination: target, rights, html: item.htmlFile, screenshot: item.screenshotFile || "—", sha256: item.sha256, reason };
});

const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;
await writeFile(join(output, "source-route-disposition-ledger.csv"), [
  "source,status,disposition,destination,rights,html,screenshot,sha256,reason",
  ...routeRows.map((row) => Object.values(row).map(csv).join(",")),
].join("\n"));

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path)); else files.push(path);
  }
  return files;
}
const publicRoot = join(repo, "public");
const mediaFiles = (await filesUnder(publicRoot)).filter((path) => [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".mp3", ".wav", ".mp4", ".webm", ".pdf"].includes(extname(path).toLowerCase()));
const sourceFiles = (await filesUnder(join(repo, "src"))).filter((path) => [".ts", ".tsx", ".css"].includes(extname(path).toLowerCase()));
const sourceText = (await Promise.all(sourceFiles.map((path) => readFile(path, "utf8")))).join("\n");
const mediaRows = [];
for (const path of mediaFiles) {
  const bytes = await readFile(path);
  const publicPath = "/" + relative(publicRoot, path).replaceAll("\\", "/");
  const rights = publicPath.includes("/case-studies/") ? "client-approved" : "owned";
  mediaRows.push({ path: publicPath, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), rights, referenced: sourceText.includes(publicPath), treatment: "local governed asset" });
}
await writeFile(join(output, "sitewide-media-rights-ledger.csv"), [
  "path,bytes,sha256,rights,referenced,treatment",
  ...mediaRows.map((row) => Object.values(row).map(csv).join(",")),
].join("\n"));

const summary = {
  generatedAt: new Date().toISOString(),
  sourceRoutes: routeRows.length,
  sourceStatus: Object.groupBy(routeRows, (row) => String(row.status)),
  dispositions: Object.groupBy(routeRows, (row) => row.disposition),
  mediaAssets: mediaRows.length,
  referencedMedia: mediaRows.filter((row) => row.referenced).length,
  unreferencedMedia: mediaRows.filter((row) => !row.referenced).length,
  rights: Object.groupBy(mediaRows, (row) => row.rights),
};
const counts = (groups) => Object.fromEntries(Object.entries(groups).map(([key, rows]) => [key, rows.length]));
summary.sourceStatus = counts(summary.sourceStatus);
summary.dispositions = counts(summary.dispositions);
summary.rights = counts(summary.rights);
await writeFile(join(output, "summary.json"), JSON.stringify(summary, null, 2));
await writeFile(join(output, "README.md"), [
  "# CRY-344 closeout ledgers",
  "",
  `Generated: ${summary.generatedAt}`,
  `Source routes: ${summary.sourceRoutes}`,
  `Dispositions: ${JSON.stringify(summary.dispositions)}`,
  `Local governed media: ${summary.mediaAssets}`,
  `Rights: ${JSON.stringify(summary.rights)}`,
  `Referenced media: ${summary.referencedMedia}; unreferenced media retained: ${summary.unreferencedMedia}`,
  "",
  "The source ledger covers every preserved public route. The media ledger covers every local public image, audio, video, and document asset with checksum, rights state, and current source-reference state.",
].join("\n"));
console.log(JSON.stringify(summary, null, 2));
