import { buildInquiryMailto, initialInquiry, supportOptions } from "./professional-inquiry.ts";
import { articleCardExcerpt, articleCardTitle, curateProfessionalArticles } from "./professional-articles.ts";
import { professionalCopy } from "./professional-copy.ts";
import { caseStudies } from "./case-studies.ts";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { allArticles } from "./articles.ts";

const root = process.cwd();

test("Professional publishes the approved eleven-article inventory with local hero art", () => {
  const articles = allArticles();
  assert.equal(articles.length, 11);
  assert.equal(new Set(articles.map(({ slug }) => slug)).size, 11);
  for (const article of articles) {
    assert.ok(article.title.trim());
    assert.ok(article.description.trim());
    assert.match(article.published, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.blocks.length > 0);
    assert.ok(existsSync(path.join(root, "public", article.hero.slice(1))), `missing ${article.hero}`);
    const bodyText = article.blocks.flatMap((block) => "text" in block ? [block.text] : []).join("\n");
    assert.doesNotMatch(bodyText, /^(Image Title|Image Description)/m, `${article.slug} exposes image metadata as prose`);
  }
});

test("Professional publishes six case studies and maps all 55 proof images", () => {
  const source = readFileSync(path.join(root, "src/lib/case-studies.ts"), "utf8");
  const studies = [...source.matchAll(/^\s+slug:\s*"([^"]+)"/gm)].map((match) => match[1]);
  const images = [...new Set([...source.matchAll(/src:\s*"(\/images\/case-studies\/[^"]+)"/g)].map((match) => match[1]))];
  assert.equal(studies.length, 6);
  assert.equal(new Set(studies).size, 6);
  assert.equal(images.length, 55);
  for (const image of images) assert.ok(existsSync(path.join(root, "public", image.slice(1))), `missing ${image}`);
  assert.doesNotMatch(source, /alt:\s*"\s*"/);
  assert.doesNotMatch(source, /caption:\s*"\s*"/);
  assert.match(source, /question: "What is Humankind\?"/);
  assert.match(source, /question: "What were Cryptic Design's primary contributions\?"/);
  assert.match(source, /question: "What is WIN Reality\?"/);
  assert.match(source, /question: "What was Project WIRE\?"/);
  assert.match(source, /question: "What is WellSky\?"/);
  assert.match(source, /question: "What is Onward\?"/);
  assert.match(source, /question: "What was Star Wars: Rise to Power\?"/);
  assert.equal([...source.matchAll(/\n\s+faq: \[/g)].length, 6);
  assert.match(readFileSync(path.join(root, "src/app/professional/case-studies/page.tsx"), "utf8"), /<details key=\{item\.question\}/);
});

test("Professional preserves owned editorial imagery from the live articles", () => {
  const articleImages = JSON.parse(readFileSync(path.join(root, "src/lib/article-images.json"), "utf8").replace(/^\uFEFF/, "")) as Record<string, { src: string; alt: string }[]>;
  const images = Object.values(articleImages).flat();
  assert.ok(images.length >= 45, `expected at least 45 editorial images, found ${images.length}`);
  for (const image of images) {
    assert.ok(image.alt.trim(), `missing alt text for ${image.src}`);
    assert.ok(existsSync(path.join(root, "public", image.src.slice(1))), `missing ${image.src}`);
  }
});

test("Professional launch routes expose canonical and share metadata", () => {
  for (const file of ["src/app/professional/page.tsx", "src/app/professional/services/page.tsx", "src/app/professional/articles/page.tsx", "src/app/professional/case-studies/page.tsx", "src/app/professional/inquiry/page.tsx", "src/app/professional/contact/page.tsx", "src/app/professional/creators/page.tsx"]) {
    const source = readFileSync(path.join(root, file), "utf8");
    assert.match(source, /canonical:/, `${file} lacks canonical metadata`);
    assert.match(source, /openGraph:/, `${file} lacks Open Graph metadata`);
    assert.match(source, /twitter:/, `${file} lacks Twitter metadata`);
  }
  const articlePage = readFileSync(path.join(root, "src/app/professional/articles/[slug]/page.tsx"), "utf8");
  for (const field of ["canonical:", "openGraph:", "twitter:", "authors:", "keywords:", "robots:"]) assert.match(articlePage, new RegExp(field), `article detail lacks ${field}`);
  const articleBody = readFileSync(path.join(root, "src/components/ArticleBody.tsx"), "utf8");
  assert.match(articleBody, /https\?:\\\/\\\//, "article URLs are not linkified");
  for (const network of ["LinkedIn", "Facebook", ">X<"]) assert.match(articleBody, new RegExp(network));
});

test("Professional uses one contact path, section tabs, and complete capability pages", () => {
  const navigation = readFileSync(path.join(root, "src/components/ProfessionalNavigation.tsx"), "utf8");
  const breadcrumbs = readFileSync(path.join(root, "src/components/SubNavBreadcrumbs.tsx"), "utf8");
  const services = readFileSync(path.join(root, "src/app/professional/[slug]/page.tsx"), "utf8");
  const inquiry = readFileSync(path.join(root, "src/components/ProfessionalInquiryForm.tsx"), "utf8");
  for (const label of ["Overview", "Services", "Case Studies", "Articles", "Start a Project"]) assert.match(navigation, new RegExp(label));
  assert.match(navigation, /href: "\/professional\/services"/);
  assert.ok(existsSync(path.join(root, "src/app/professional/services/page.tsx")));
  assert.match(breadcrumbs, /pathname\.startsWith\("\/professional\/"\)/);
  assert.match(services, /How the work moves/);
  assert.match(services, /Typical deliverables/);
  assert.match(services, /Selected proof/);
  assert.match(inquiry, /buildInquiryMailto\(inquiry\)/);
  assert.doesNotMatch(inquiry, /localStorage|does not send/);
});

test("Professional inquiry encodes every field without query or header injection", () => {
  const inquiry = { name: "A & B + 雪", email: "test+design@example.com", organization: "Studio / R&D?", message: "First line\nSecond line: & ? # % +", stage: "Prototype #2", support: "UX & Interaction", timing: "Q4 / 2026", budget: "Scope & capacity", link: "https://example.com/?a=1&b=2#work" };
  const mail = new URL(buildInquiryMailto(inquiry));
  assert.equal(mail.protocol, "mailto:");
  assert.equal(mail.pathname, "robert.croft@crypticdesign.net");
  assert.deepEqual([...mail.searchParams.keys()], ["subject", "body"]);
  for (const value of Object.values(inquiry)) assert.ok(mail.searchParams.get("body")?.includes(value), "missing field " + value);
  assert.equal(mail.searchParams.get("subject"), "Professional inquiry — UX & Interaction — Studio / R&D?");
  assert.ok(supportOptions.includes("Fractional / Embedded Leadership"));
  const minimal = new URL(buildInquiryMailto({ ...initialInquiry, name:"Name", email:"test@example.com", organization:"Project", message:"Problem" }));
  assert.ok(minimal.searchParams.get("subject")?.includes("Not Sure Yet"));
  assert.ok(minimal.searchParams.get("body")?.includes("Supporting Link: Not provided"));
});

test("Professional article curation preserves every source and cleans only presentation", () => {
  const articles = allArticles();
  const before = JSON.stringify(articles);
  const { featured, archive } = curateProfessionalArticles(articles);
  assert.equal(featured.length, 4);
  assert.equal(archive.length, 7);
  assert.deepEqual(new Set([...featured, ...archive].map(a => a.slug)), new Set(articles.map(a => a.slug)));
  assert.equal(featured[0].slug, "owning-the-stack-post-generative-creative-economy");
  for(const article of articles) {
    assert.doesNotMatch(articleCardExcerpt(article), /#[A-Za-z]/);
    assert.doesNotMatch(articleCardTitle(article), /#[A-Za-z]/);
  }
  assert.equal(JSON.stringify(articles), before);
});

test("Professional overview has the approved hierarchy and governed selected proof", () => {
  const source=readFileSync(path.join(root,"src/app/professional/page.tsx"),"utf8");
  const ids=["professional-title","capabilities","engagement","selected-proof","experience","method","principles","founder","start-project"];
  const positions=ids.map(id=>source.indexOf('id="'+id+'"'));
  assert.ok(positions.every((position,index)=>position>=0 && (index===0||position>positions[index-1])));
  assert.equal(professionalCopy.engagement.cards.length,4);
  assert.equal(professionalCopy.method.steps.length,5);
  for(const slug of Object.keys(professionalCopy.proof.summaries)) {
    const study=caseStudies.find(study=>study.slug===slug);
    assert.ok(study?.engagement);
    assert.ok(study?.hero.src);
  }
  assert.deepEqual(Object.keys(professionalCopy.proof.summaries),["humankind-console","win-reality","wellsky"]);
  assert.match(source, /src="\/images\/team\/robert-croft\.png"/);
  assert.match(source, /alt="Portrait of Robert Croft, founder of Cryptic Design"/);
});
