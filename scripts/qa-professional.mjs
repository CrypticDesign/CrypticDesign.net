import axe from "axe-core";
import { readFile, mkdir } from "node:fs/promises";
import { chromium, firefox, webkit } from "playwright";
import { writeFile } from "node:fs/promises";

const base = process.argv[2] || "http://127.0.0.1:3100";
const routes = [
  "/professional/services",
  "/professional",
  "/professional/case-studies",
  "/professional/articles",
  "/professional/articles/holistic-ux-design-systems-thinking",
  "/professional/ux-interaction",
  "/professional/interface-systems",
  "/professional/creative-technology",
  "/professional/product-strategy",
  "/professional/contact",
  "/professional/inquiry",
];
const articleSource = await readFile("src/lib/articles.ts", "utf8");
for (const match of articleSource.matchAll(/"slug":\s*"([^"]+)"/g)) {
  const route = "/professional/articles/" + match[1];
  if(!routes.includes(route)) routes.push(route);
}
const engine = process.argv[3] || "chromium";
const outDir = process.argv[4] || "artifacts/CRY-496";
await mkdir(outDir, { recursive: true });
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const routeChecks = [];
const linkCache = new Map();
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const robots = await (await fetch(base + "/robots.txt")).text();
for(const route of routes.filter(route=>route!=="/professional/contact")) {
  const response = await fetch(base+route);
  const html = await response.text();
  const failures = [];
  if(response.status!==200) failures.push("HTTP " + response.status);
  if(!html.includes('rel="canonical" href="https://crypticdesign.net'+route+'"')) failures.push("canonical mismatch");
  for(const field of ['property="og:title"','property="og:description"','property="og:image"','name="twitter:card"','name="robots"']) if(!html.includes(field)) failures.push("missing " + field);
  if(!sitemap.includes("https://crypticdesign.net"+route+"</loc>")) failures.push("missing sitemap route");
  if(!robots.includes("sitemap.xml")) failures.push("missing robots sitemap");
  const links = [...html.matchAll(/href="(\/[^"?]*)"/g)].map(m=>m[1].replaceAll("&amp;","&"));
  for(const href of new Set(links)) {
    const url = new URL(href,base);
    if(!linkCache.has(url.pathname)) linkCache.set(url.pathname,fetch(base+url.pathname).then(async r=>({status:r.status,html:await r.text()})));
    const target = await linkCache.get(url.pathname);
    if(target.status>=400) failures.push("broken link " + href);
    if(url.hash && !target.html.includes('id="'+decodeURIComponent(url.hash.slice(1))+'"')) failures.push("missing anchor " + href);
  }
  routeChecks.push({route,status:response.status,failures});
}
const redirectChecks = [];
for(const route of routes.filter(route=>route.startsWith("/professional/articles/"))) {
  const legacy = route.replace("/professional", "");
  const response = await fetch(base+legacy,{redirect:"manual"});
  redirectChecks.push({source:legacy,status:response.status,location:response.headers.get("location"),pass:[307,308].includes(response.status) && new URL(response.headers.get("location"),base).pathname===route});
}
if(engine === "routes") {
  const problems = routeChecks.flatMap(result=>result.failures.map(failure=>result.route+": "+failure));
  for(const result of redirectChecks) if(!result.pass) problems.push("redirect failed: "+result.source);
  const evidence = { generated:new Date().toISOString(),base,routeChecks,redirectChecks,problems,pass:problems.length===0 };
  await writeFile(outDir+"/routes-final.json",JSON.stringify(evidence,null,2));
  console.log("Professional route/metadata verification: "+(evidence.pass?"PASS":"FAIL")+"; "+routeChecks.length+" routes; "+redirectChecks.length+" article redirects");
  for(const problem of problems) console.log(problem);
  process.exit(evidence.pass?0:1);
}
const browser = await ({ chromium, firefox, webkit }[engine]).launch();
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
    const response = await page.goto(base + route, { waitUntil: "load", timeout: 60000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(500);
    await page.evaluate(async () => {
      const visibleImages = [...document.images].filter(image=>image.getClientRects().length>0);
      for(const image of visibleImages) image.loading="eager";
      await Promise.race([Promise.all(visibleImages.map(image=>image.decode().catch(()=>null))),new Promise(resolve=>setTimeout(resolve,15000))]);
    });
    const facts = await page.evaluate(() => ({
      h1: document.querySelectorAll("h1").length,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      images: [...document.images].map((image) => ({ src: image.currentSrc || image.src, alt: image.alt, complete: image.complete, width: image.naturalWidth, loading: image.loading, visible: image.getClientRects().length > 0 })),
      main: Boolean(document.querySelector("main")),
    }));
    const nav = page.getByRole("navigation", { name: "Professional sections" });
    const trigger = page.locator(".professional-navigation summary");
    if (await trigger.isVisible()) { await trigger.focus(); await trigger.press("Enter"); }
    const navLinks = await nav.locator("a").allTextContents();
    if(navLinks.length !== 5) failures.push("Professional subnav count: " + navLinks.length);
    if(await trigger.isVisible()) await trigger.press("Enter");
    const violet = await page.locator(".professional-experience").evaluate(el => getComputedStyle(el).getPropertyValue("--section-accent").trim());
    if(violet.toLowerCase() !== "#9400d3") failures.push("Professional shared accent: " + violet);
    let violations = [];
    if(engine === "chromium") {
      await page.addScriptTag({ content: axe.source });
      violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: {type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa"]} })).violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})));
      for(const violation of violations) failures.push("axe " + JSON.stringify(violation));
    }
    if(engine === "chromium" && [390,1440].includes(viewport.width) && ["/professional","/professional/services","/professional/case-studies","/professional/articles","/professional/inquiry"].includes(route)) {
      await page.evaluate(()=>{ document.activeElement?.blur(); window.scrollTo({top:0,behavior:"instant"}); });
      await page.waitForTimeout(250);
      await page.screenshot({path:outDir+"/"+route.replaceAll("/","-").slice(1)+"-"+viewport.width+".png",fullPage:true});
    }
    // Lazy images below the active viewport may remain intentionally unloaded.
    // Network failures are captured independently; eager images must decode.
    const brokenImages = facts.images.filter((image) => (image.visible || image.loading !== "lazy") && (!image.complete || image.width === 0));
    results.push({ route, viewport: viewport.name, width: viewport.width, engine, violet, violations, status: response?.status(), h1: facts.h1, main: facts.main, horizontalOverflow: facts.horizontalOverflow, images: facts.images.length, brokenImages, failures });
    console.log(engine + " " + route + " @ " + viewport.width + ": " + (failures.length ? failures.length + " findings" : "checked"));
    await writeFile(outDir+"/progress-"+engine+".json",JSON.stringify(results,null,2));
    await page.close();
  }
}

const gallery = await browser.newPage({ viewport: viewports[0] });
await gallery.goto(`${base}/professional/case-studies`, { waitUntil: "load", timeout: 60000 });
const firstGalleryButton = gallery.getByRole("button", { name: /^Enlarge image:/ }).first();
await firstGalleryButton.focus();
await firstGalleryButton.press("Enter");
const dialog = gallery.getByRole("dialog");
const keyboard = { opened: await dialog.isVisible() };
await gallery.keyboard.press("ArrowRight");
keyboard.nextWorked = await dialog.getByText(/2 of \d+/).isVisible();
await gallery.keyboard.press("Escape");
keyboard.closed = !(await dialog.isVisible());
keyboard.focusRestored = await firstGalleryButton.evaluate(el=>document.activeElement===el);
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
for(const result of routeChecks) for(const failure of result.failures) problems.push(result.route+": "+failure);
for(const result of redirectChecks) if(!result.pass) problems.push("redirect failed: "+result.source);
if (!keyboard.opened || !keyboard.nextWorked || !keyboard.closed || !keyboard.focusRestored) problems.push("Case-study lightbox keyboard flow failed");

const evidence = { engine, browserVersion: browser.version(), generated: new Date().toISOString(), base, routeChecks, redirectChecks, results, keyboard, problems, pass: problems.length === 0 };
await writeFile(outDir + "/browser-" + engine + ".json", JSON.stringify(evidence, null, 2));
console.log(`Professional browser QA: ${evidence.pass ? "PASS" : "FAIL"}\nRoutes/viewports: ${results.length}\nLightbox keyboard: ${JSON.stringify(keyboard)}\nProblems: ${problems.length}`);
for (const problem of problems) console.log(`- ${problem}`);
if (!evidence.pass) process.exitCode = 1;
