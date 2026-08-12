import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const SOURCE = "https://www.crypticdesign.net";
const output = process.argv[2] || "artifacts/CRY-344-squarespace-preservation";
const capturedAt = new Date().toISOString();
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const safeName = (url) => {
  const parsed = new URL(url);
  const stem = parsed.pathname === "/" ? "home" : parsed.pathname.slice(1);
  return stem.replaceAll(/[^a-zA-Z0-9._-]+/g, "-").replaceAll(/-+/g, "-").slice(0, 180) || "home";
};
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", "\"");
const match = (html, pattern) => decode(html.match(pattern)?.[1]?.trim() || "");

await mkdir(join(output, "html"), { recursive: true });
await mkdir(join(output, "screenshots"), { recursive: true });

const sitemapResponse = await fetch(`${SOURCE}/sitemap.xml`, { headers: { "user-agent": "CrypticDesign migration preservation audit" } });
if (!sitemapResponse.ok) throw new Error(`Sitemap returned HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
await writeFile(join(output, "sitemap.xml"), sitemap);

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => decode(entry[1]));
const knownOmissions = ["/", "/portfolio", "/portfolio/signal-systems", "/portfolio/humankind", "/portfolio/robert-croft", "/singularis", "/store", "/cart", "/privacy-policy"];
const urls = [...new Set([...sitemapUrls, ...knownOmissions.map((route) => SOURCE + route)])];
const inventory = [];

for (const url of urls) {
  const response = await fetch(url, { redirect: "manual", headers: { "user-agent": "CrypticDesign migration preservation audit" } });
  const html = await response.text();
  const filename = `${safeName(url)}.html`;
  await writeFile(join(output, "html", filename), html);
  inventory.push({
    sourceUrl: url,
    path: new URL(url).pathname,
    sitemap: sitemapUrls.includes(url),
    status: response.status,
    redirect: response.headers.get("location"),
    title: match(html, /<title>([^<]*)<\/title>/i),
    description: match(html, /<meta[^>]+(?:name|property)=["']description["'][^>]+content=["']([^"']*)["']/i),
    canonical: match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    ogImage: match(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i),
    contentType: response.headers.get("content-type"),
    htmlFile: `html/${filename}`,
    bytes: Buffer.byteLength(html),
    sha256: sha256(html),
  });
}

const screenshotCandidates = inventory.filter(({ path, status }) =>
  status === 200 && !path.startsWith("/articles/category/") && !path.startsWith("/articles/tag/"),
);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
for (const item of screenshotCandidates) {
  try {
    await page.goto(item.sourceUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const screenshotFile = `${safeName(item.sourceUrl)}.png`;
    const screenshotPath = join(output, "screenshots", screenshotFile);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    item.screenshotFile = `screenshots/${screenshotFile}`;
    item.screenshotSha256 = sha256(await readFile(screenshotPath));
  } catch (error) {
    item.screenshotError = error.message;
  }
}
await browser.close();

const manifest = {
  source: SOURCE,
  capturedAt,
  sitemapCount: sitemapUrls.length,
  omissionCount: urls.length - sitemapUrls.length,
  totalCount: inventory.length,
  htmlCaptured: inventory.filter((item) => item.htmlFile).length,
  screenshotsCaptured: inventory.filter((item) => item.screenshotFile).length,
  screenshotErrors: inventory.filter((item) => item.screenshotError).length,
  inventory,
};
await writeFile(join(output, "manifest.json"), JSON.stringify(manifest, null, 2));
const checksumLines = [
  `${sha256(sitemap)}  sitemap.xml`,
  ...inventory.map((item) => `${item.sha256}  ${item.htmlFile}`),
  ...inventory.filter((item) => item.screenshotFile).map((item) => `${item.screenshotSha256}  ${item.screenshotFile}`),
];
await writeFile(join(output, "SHA256SUMS.txt"), checksumLines.join("\n") + "\n");
await writeFile(join(output, "README.md"), [
  "# CRY-344 Squarespace preservation bundle",
  "",
  `Captured: ${capturedAt}`,
  `Source: ${SOURCE}`,
  `Sitemap URLs: ${manifest.sitemapCount}`,
  `Known sitemap omissions added: ${manifest.omissionCount}`,
  `HTML captures: ${manifest.htmlCaptured}`,
  `Full-page screenshots (significant non-taxonomy routes): ${manifest.screenshotsCaptured}`,
  `Screenshot errors: ${manifest.screenshotErrors}`,
  "",
  "This is a read-only preservation capture. It does not modify Squarespace, DNS, or production hosting.",
  "The manifest records response state, metadata, filenames, byte counts, and SHA-256 hashes.",
].join("\n"));
console.log(JSON.stringify({ output, ...manifest, inventory: undefined }, null, 2));
