import { load } from "cheerio";
import { readFile } from "node:fs/promises";

const slug = process.argv[2] || "ai-in-ux-design";
const res = await fetch(`https://www.crypticdesign.net/articles/${slug}`, {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const $ = load(await res.text());
const body = $(".sqs-block-content").first().length
  ? $(".sqs-block-content").parent()
  : $("article");

const src = [];
body.find("h1,h2,h3,h4,p").each((_, el) => {
  if ($(el).parents("li").length) return;
  const t = $(el).text().replace(/\s+/g, " ").trim();
  if (t) src.push(`${el.tagName}: ${t.slice(0, 64)}`);
});

const gen = JSON.parse(await readFile("scripts/articles.raw.json", "utf8"))
  .find((a) => a.slug === slug)
  .blocks.filter((b) => b.text)
  .map((b) => `${b.type}: ${b.text.slice(0, 64)}`);

console.log("--- SOURCE (first 10) ---");
console.log(src.slice(0, 10).join("\n"));
console.log("\n--- IMPORTED (first 10) ---");
console.log(gen.slice(0, 10).join("\n"));
console.log(`\nsource text nodes: ${src.length}  imported: ${gen.length}`);
