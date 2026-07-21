// CRY-344 item 3: one-time importer for the 12 legacy Squarespace articles.
// Fetches each post, extracts metadata + body blocks, downloads hero images,
// and emits src/lib/articles.generated.ts.
// Run: node scripts/import-legacy-articles.mjs
import { writeFile } from "node:fs/promises";
import { load } from "cheerio";

const BASE = "https://www.crypticdesign.net/articles/";
const SLUGS = [
  "owning-the-stack-post-generative-creative-economy",
  "2026-game-design-benchmarks",
  "arc-raiders-a-player-experience-review",
  "when-tools-begin-to-decide",
  "ai-in-ux-design",
  "scalable-ui-systems-design-tokens-components",
  "how-to-conduct-a-ux-audit",
  "holistic-ux-design-systems-thinking",
  "video-games-2023-q1-cryptic-insights",
  "artificial-intelligence-2023-q1-cryptic-insights",
];
const EXTRA = [
  {
    slug: "shaping-the-universe",
    url: "https://www.crypticdesign.net/lifa-progress-reports/shaping-the-universe-zyw6x",
  },
];

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

// Convert a Squarespace body element into structured blocks we render with
// our own components (no runtime markdown/HTML-injection dependency).
function toBlocks($, root) {
  const blocks = [];
  const pushText = (type, el) => {
    const text = clean($(el).text());
    if (text) blocks.push({ type, text });
  };

  $(root)
    .find("h1,h2,h3,h4,p,ul,ol,blockquote,hr")
    .each((_, el) => {
      // Skip nodes nested inside a list item — the parent list already
      // captured their text, otherwise every bullet repeats as a paragraph.
      if ($(el).parents("li").length) return;
      const tag = el.tagName.toLowerCase();
      if (tag === "hr") {
        if (blocks[blocks.length - 1]?.type !== "divider")
          blocks.push({ type: "divider" });
        return;
      }
      if (tag === "ul" || tag === "ol") {
        const items = $(el)
          .children("li")
          .map((__, li) => clean($(li).text()))
          .get()
          .filter(Boolean);
        if (items.length)
          blocks.push({ type: tag === "ul" ? "list" : "orderedList", items });
        return;
      }
      if (tag === "blockquote") return pushText("quote", el);
      if (tag === "h1" || tag === "h2") return pushText("h2", el);
      if (tag === "h3") return pushText("h3", el);
      if (tag === "h4") return pushText("h4", el);
      return pushText("paragraph", el);
    });

  // Drop leading duplicate of the title and any trailing empties.
  return blocks.filter((b, i) => !(i === 0 && b.type === "h2"));
}

async function scrape(slug, url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const $ = load(await res.text());

  const meta = (p) =>
    $(`meta[property="${p}"]`).attr("content") ||
    $(`meta[name="${p}"]`).attr("content") ||
    "";

  const title = clean($("h1").first().text()) || clean(meta("og:title"));
  const description = clean(meta("description") || meta("og:description"));
  // Squarespace exposes the date via JSON-LD, a <time> element, or plain text.
  let published = meta("article:published_time") || "";
  if (!published) {
    $('script[type="application/ld+json"]').each((_, s) => {
      if (published) return;
      try {
        const j = JSON.parse($(s).contents().text());
        const node = Array.isArray(j) ? j[0] : j;
        published = node?.datePublished || node?.dateCreated || "";
      } catch {
        /* ignore malformed blocks */
      }
    });
  }
  if (!published) {
    published =
      $("time[datetime]").first().attr("datetime") ||
      clean($("time").first().text());
  }

  // Categories and tags render as links under /articles/category|tag/.
  const linkText = (frag) =>
    $(`a[href*="/articles/${frag}/"]`)
      .map((_, a) => clean($(a).text()))
      .get()
      .filter(Boolean);
  const categories = [...new Set(linkText("category"))];
  const tags = [...new Set(linkText("tag"))].map((t) => t.replace(/^#/, ""));

  const body = $(".sqs-block-content").first().length
    ? $(".sqs-block-content").parent()
    : $("article");
  const blocks = toBlocks($, body);

  const heroRemote = meta("og:image").split("?")[0];

  return {
    slug,
    title,
    description,
    published,
    categories,
    tags,
    heroRemote,
    blocks,
  };
}

const targets = [
  ...SLUGS.map((s) => ({ slug: s, url: BASE + s })),
  ...EXTRA,
];

const out = [];
for (const t of targets) {
  try {
    const a = await scrape(t.slug, t.url);
    out.push(a);
    console.log(
      `OK   ${a.slug}  blocks=${a.blocks.length}  cats=${a.categories.length}  tags=${a.tags.length}`,
    );
  } catch (e) {
    console.log(`FAIL ${t.slug}  ${e.message}`);
  }
}

await writeFile(
  "scripts/articles.raw.json",
  JSON.stringify(out, null, 2),
  "utf8",
);
console.log(`\nWrote scripts/articles.raw.json (${out.length} articles)`);
