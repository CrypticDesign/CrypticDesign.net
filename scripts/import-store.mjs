// CRY-344 item 5: import the legacy Squarespace store catalog for a
// preview-only presentation. No pricing or checkout is carried over —
// commerce remains a deferred backend (CRY-320 constraint).
import { writeFile, mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { load } from "cheerio";
import path from "node:path";

const STORE = "https://www.crypticdesign.net/store";
const IMG_DIR = path.join("public", "images", "store");
await mkdir(IMG_DIR, { recursive: true });

const res = await fetch(STORE, { headers: { "User-Agent": "Mozilla/5.0" } });
const $ = load(await res.text());

const items = [];
$('a[href*="/store/p/"]').each((_, a) => {
  const href = $(a).attr("href") || "";
  const slug = href.split("/store/p/")[1]?.split(/[?#]/)[0];
  if (!slug || items.some((i) => i.slug === slug)) return;
  const img = $(a).find("img").first();
  const src = img.attr("data-src") || img.attr("src") || "";
  const alt = (img.attr("alt") || "").replace(/\s+/g, " ").trim();
  items.push({ slug, src: src.split("?")[0], alt });
});

console.log(`found ${items.length} products`);

for (const item of items) {
  if (!item.src) {
    console.log(`  no image: ${item.slug}`);
    continue;
  }
  const ext = (item.src.match(/\.(png|jpe?g|webp)$/i)?.[1] || "jpg").toLowerCase();
  const dest = path.join(IMG_DIR, `${item.slug}.${ext}`);
  try {
    const r = await fetch(`${item.src}?format=1000w`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    await pipeline(Readable.fromWeb(r.body), createWriteStream(dest));
    item.image = `/images/store/${item.slug}.${ext}`;
    console.log(`OK ${item.slug}`);
  } catch (e) {
    console.log(`FAIL ${item.slug} ${e.message}`);
  }
}

await writeFile("scripts/store.raw.json", JSON.stringify(items, null, 2), "utf8");
console.log("\nWrote scripts/store.raw.json");
