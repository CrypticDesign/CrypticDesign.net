import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:3100";
const routes = [
  "/professional",
  "/professional/case-studies",
  "/professional/articles",
  "/professional/articles/holistic-ux-design-systems-thinking",
  "/professional/product-strategy",
  "/professional/contact",
  "/professional/inquiry",
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const failures = [];
    page.on("response", (response) => {
      if (response.status() < 400) return;
      const url = response.url();
      // Local production builds intentionally lack hosted Supabase credentials.
      if (url.endsWith("/api/membership/session") && response.status() === 503) return;
      failures.push(`${response.status()} ${url}`);
    });
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(500);
    const facts = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, alt: image.alt, complete: image.complete, width: image.naturalWidth, loading: image.loading })),
      main: Boolean(document.querySelector("main")),
    }));
    // Lazy images below the active viewport may remain intentionally unloaded.
    // Network failures are captured independently; eager images must decode.
    const brokenImages = facts.images.filter((image) => image.loading !== "lazy" && (!image.complete || image.width === 0));
    results.push({ route, viewport: viewport.name, status: response?.status(), h1: facts.h1, main: facts.main, horizontalOverflow: facts.horizontalOverflow, images: facts.images.length, brokenImages, failures });
    await page.close();
  }
}

const gallery = await browser.newPage({ viewport: viewports[0] });
await gallery.goto(`${base}/professional/case-studies`, { waitUntil: "networkidle" });
const firstGalleryButton = gallery.getByRole("button", { name: /^Enlarge image:/ }).first();
await firstGalleryButton.focus();
await firstGalleryButton.press("Enter");
const dialog = gallery.getByRole("dialog");
const keyboard = { opened: await dialog.isVisible() };
await gallery.keyboard.press("ArrowRight");
keyboard.nextWorked = await dialog.getByText(/2 of \d+/).isVisible();
await gallery.keyboard.press("Escape");
keyboard.closed = !(await dialog.isVisible());
await gallery.close();
await browser.close();

const problems = results.flatMap((result) => [
  ...(result.status === 200 ? [] : [`${result.route} @ ${result.viewport}: HTTP ${result.status}`]),
  ...(result.h1 === 1 ? [] : [`${result.route} @ ${result.viewport}: ${result.h1} h1 elements`]),
  ...(result.main ? [] : [`${result.route} @ ${result.viewport}: missing main landmark`]),
  ...(result.horizontalOverflow ? [`${result.route} @ ${result.viewport}: horizontal overflow`] : []),
  ...result.brokenImages.map((image) => `${result.route} @ ${result.viewport}: broken image ${image.src}`),
  ...result.failures.map((failure) => `${result.route} @ ${result.viewport}: ${failure}`),
]);
if (!keyboard.opened || !keyboard.nextWorked || !keyboard.closed) problems.push("Case-study lightbox keyboard flow failed");

const evidence = { generated: new Date().toISOString(), base, results, keyboard, problems, pass: problems.length === 0 };
await writeFile("artifacts/CRY-454-professional-browser-qa.json", JSON.stringify(evidence, null, 2));
console.log(`Professional browser QA: ${evidence.pass ? "PASS" : "FAIL"}\nRoutes/viewports: ${results.length}\nLightbox keyboard: ${JSON.stringify(keyboard)}\nProblems: ${problems.length}`);
for (const problem of problems) console.log(`- ${problem}`);
if (!evidence.pass) process.exitCode = 1;
