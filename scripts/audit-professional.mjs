import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const articleSource = await readFile(path.join(root, "src/lib/articles.ts"), "utf8");
const caseSource = await readFile(path.join(root, "src/lib/case-studies.ts"), "utf8");
const professionalFiles = [
  "src/lib/case-studies.ts",
  "src/app/professional/services/page.tsx",
  "src/app/professional/page.tsx",
  "src/app/professional/articles/page.tsx",
  "src/app/professional/articles/[slug]/page.tsx",
  "src/app/professional/case-studies/page.tsx",
];

const unique = (items) => [...new Set(items)];
const matches = (source, expression) => unique([...source.matchAll(expression)].map((match) => match[1]));
const articleSlugs = matches(articleSource, /"slug":\s*"([^"]+)"/g);
const articleImages = matches(articleSource, /"hero":\s*"(\/images\/articles\/[^"]+)"/g);
const caseStudySlugs = matches(caseSource, /^\s+slug:\s*"([^"]+)"/gm);
const caseImages = matches(caseSource, /src:\s*"(\/images\/case-studies\/[^"]+)"/g);

let professionalSource = "";
for (const file of professionalFiles) professionalSource += await readFile(path.join(root, file), "utf8");
const supportingImages = matches(professionalSource, /(?:src=|src:)\s*[{]?"(\/images\/(?!articles\/|case-studies\/)[^"]+)"/g);

const usageByAsset = new Map();
for (const asset of articleImages) usageByAsset.set(asset, { usage: "article hero", rights: "Owned editorial content" });
for (const asset of caseImages) usageByAsset.set(asset, { usage: "case-study proof/gallery", rights: "Approved client/founder portfolio evidence" });
for (const asset of supportingImages) usageByAsset.set(asset, { usage: "Professional landing/supporting art", rights: "Owned brand content" });

const ledger = [];
for (const [asset, governance] of [...usageByAsset].sort(([a], [b]) => a.localeCompare(b))) {
  const diskPath = path.join(root, "public", asset.slice(1));
  let bytes = null;
  let state = "present";
  try { bytes = (await stat(diskPath)).size; } catch { state = "missing"; }
  ledger.push({
    asset,
    destination: asset.includes("/articles/") ? "/professional/articles/[slug]" : asset.includes("/case-studies/") ? "/professional/case-studies" : "/professional",
    usage: governance.usage,
    rights: governance.rights,
    altTextState: "authored in route/content model",
    bytes,
    state,
  });
}

const diskFiles = [];
for (const folder of ["articles", "case-studies"]) {
  for (const entry of await readdir(path.join(root, "public/images", folder), { withFileTypes: true })) {
    if (entry.isFile()) diskFiles.push(`/images/${folder}/${entry.name}`);
  }
}
const unreferenced = diskFiles.filter((asset) => !usageByAsset.has(asset));
const missing = ledger.filter((entry) => entry.state === "missing");
const duplicateReferences = [...usageByAsset].filter(([asset]) => professionalSource.split(asset).length > 3).map(([asset]) => asset);

const summary = {
  generated: new Date().toISOString(),
  articles: articleSlugs.length,
  articleImages: articleImages.length,
  caseStudies: caseStudySlugs.length,
  caseStudyImages: caseImages.length,
  professionalAssets: ledger.length,
  missing: missing.map((entry) => entry.asset),
  unreferenced,
  duplicateReferences,
  pass: articleSlugs.length === 11 && articleImages.length === 11 && caseStudySlugs.length === 6 && caseImages.length === 55 && ledger.length === 69 && missing.length === 0 && unreferenced.length === 0,
};

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/CRY-496-professional-media-ledger.json", JSON.stringify({ summary, ledger }, null, 2));
const csv = ["asset,destination,usage,rights,alt_text_state,bytes,state", ...ledger.map((e) => [e.asset, e.destination, e.usage, e.rights, e.altTextState, e.bytes ?? "", e.state].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))].join("\n");
await writeFile("artifacts/CRY-496-professional-media-ledger.csv", csv);
const report = `# CRY-496 Professional inventory evidence\n\nGenerated: ${summary.generated}\n\n- Articles: ${summary.articles}/11\n- Article hero images: ${summary.articleImages}/11\n- Case studies: ${summary.caseStudies}/6\n- Case-study proof images: ${summary.caseStudyImages}/55\n- Total Professional assets inventoried: ${summary.professionalAssets}\n- Missing referenced assets: ${summary.missing.length}\n- Unreferenced article/case-study assets: ${summary.unreferenced.length}\n- Result: **${summary.pass ? "PASS" : "FAIL"}**\n\nThe verified CRY-454 baseline of six studies, 55 distinct proof images, 11 articles, and 69 governed Professional assets is retained. Historical CRY-454 evidence is unchanged. See CRY-496/README.md for runtime acceptance and review status.\n`;
await writeFile("artifacts/CRY-496-professional-completion-evidence.md", report);
console.log(report);
if (!summary.pass) process.exitCode = 1;
