// CRY-320 launch QA matrix: crawls the launch-critical routes at three
// viewports against a running target, recording nav integrity, touch-target
// size, console errors, and load status. Emits JSON + a markdown table.
// Usage: node scripts/qa-matrix.mjs [baseUrl]   (default demo.crypticdesign.net)
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE = process.argv[2] || "https://demo.crypticdesign.net";

const ROUTES = [
  "/", "/entertainment", "/professional", "/search", "/account/create",
  "/professional/case-studies", "/professional/articles",
  "/professional/articles/holistic-ux-design-systems-thinking",
  "/entertainment/visual-studies", "/entertainment/store",
  "/products", "/products/singularis", "/audio", "/privacy", "/terms",
];

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch();
const rows = [];

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const t = m.text();
      // Ignore known benign third-party noise (Turnstile/Supabase dev logging).
      if (t.includes("font-size:0;color:transparent")) return;
      consoleErrors.push(t.slice(0, 140));
    });
    let status = 0;
    try {
      // domcontentloaded (not networkidle): auth routes hold live Turnstile/
      // Supabase connections that never let the network go idle.
      const resp = await page.goto(BASE + route, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await page.waitForTimeout(1800);
      status = resp ? resp.status() : 0;
    } catch (e) {
      rows.push({ route, vp: vp.name, status: "ERR", detail: e.message.slice(0, 80) });
      await ctx.close();
      continue;
    }

    const nav = await page.evaluate(() => {
      const links = [...document.querySelectorAll(".primary-nav a")];
      const rects = links.map((a) => a.getBoundingClientRect());
      // Cluster by vertical CENTER within a 24px band — items of different
      // heights that are vertically centered together are one visual row.
      const centers = rects.map((r) => r.top + r.height / 2).sort((a, b) => a - b);
      let bands = 0, last = -999;
      for (const c of centers) { if (c - last > 24) { bands++; last = c; } }
      return {
        navCount: links.length,
        navRows: bands,
        minNavTarget: rects.length ? Math.min(...rects.map((r) => Math.round(r.height))) : 0,
        navVisible: rects.filter((r) => r.width > 0 && r.height > 0).length,
      };
    });

    const rail = await page.evaluate(() => {
      const el = document.querySelector(".channel-rail");
      if (!el) return null;
      const links = [...el.querySelectorAll("a")];
      const tops = new Set(links.map((a) => Math.round(a.getBoundingClientRect().top)));
      return { rows: tops.size, scrollable: el.scrollWidth > el.clientWidth + 1 };
    });

    // Skip-link + single H1 are the low-cost a11y/SEO checks.
    const seo = await page.evaluate(() => ({
      h1: document.querySelectorAll("main h1, h1").length,
      hasSkip: !!document.querySelector('a[href="#main-content"], .skip-link'),
      title: document.title.length,
    }));

    rows.push({
      route,
      vp: vp.name,
      status,
      navCount: nav.navCount,
      navVisible: nav.navVisible,
      navRows: nav.navRows,
      minNavTarget: nav.minNavTarget,
      railRows: rail ? rail.rows : "-",
      railScroll: rail ? rail.scrollable : "-",
      h1: seo.h1,
      skip: seo.hasSkip,
      consoleErrors: consoleErrors.length,
    });
    await ctx.close();
  }
}

await browser.close();

// ---- Report ----
const problems = [];
for (const r of rows) {
  if (r.status !== 200 && r.status !== "ERR") continue; // redirects handled separately
  if (r.status === "ERR") { problems.push(`${r.route} @ ${r.vp}: load error — ${r.detail}`); continue; }
  if (r.navVisible !== r.navCount) problems.push(`${r.route} @ ${r.vp}: ${r.navCount - r.navVisible} nav item(s) hidden`);
  if (r.navRows > 1) problems.push(`${r.route} @ ${r.vp}: nav wraps to ${r.navRows} rows`);
  // 44px touch-target rule applies to touch viewports; desktop uses a mouse.
  if (r.vp !== "desktop" && r.minNavTarget > 0 && r.minNavTarget < 44) problems.push(`${r.route} @ ${r.vp}: nav target ${r.minNavTarget}px < 44px`);
  if (r.railRows !== "-" && r.railRows > 1) problems.push(`${r.route} @ ${r.vp}: channel rail wraps to ${r.railRows} rows`);
  if (r.h1 !== 1) problems.push(`${r.route} @ ${r.vp}: ${r.h1} h1 elements (want exactly 1)`);
  if (!r.skip) problems.push(`${r.route} @ ${r.vp}: no skip link`);
  if (r.consoleErrors > 0) problems.push(`${r.route} @ ${r.vp}: ${r.consoleErrors} console error(s)`);
}

const header = "| Route | VP | HTTP | Nav (vis/total) | Rows | Target | Rail rows | H1 | Skip | ConsoleErr |";
const sep = "|---|---|---|---|---|---|---|---|---|---|";
const lines = rows.map((r) =>
  `| ${r.route} | ${r.vp} | ${r.status} | ${r.navVisible ?? "-"}/${r.navCount ?? "-"} | ${r.navRows ?? "-"} | ${r.minNavTarget ?? "-"} | ${r.railRows} | ${r.h1 ?? "-"} | ${r.skip ? "y" : "n"} | ${r.consoleErrors ?? "-"} |`,
);

const md = [
  `# CRY-320 QA Matrix — ${BASE}`,
  `Generated ${new Date().toISOString()} · ${ROUTES.length} routes × ${VIEWPORTS.length} viewports`,
  "",
  problems.length ? `## Problems found (${problems.length})` : "## No problems found",
  ...problems.map((p) => `- ${p}`),
  "",
  "## Full matrix",
  header, sep, ...lines,
].join("\n");

await writeFile("qa-matrix-report.md", md, "utf8");
await writeFile("qa-matrix-report.json", JSON.stringify(rows, null, 2), "utf8");
console.log(md.slice(0, 4000));
console.log(`\n\nPROBLEMS: ${problems.length}`);
