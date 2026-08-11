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
  }
});

test("Professional publishes six case studies and maps all 55 proof images", () => {
  const source = readFileSync(path.join(root, "src/app/professional/case-studies/page.tsx"), "utf8");
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
  assert.match(source, /<details key=\{item\.question\}/);
});

test("Professional launch routes expose canonical and share metadata", () => {
  for (const file of ["src/app/professional/page.tsx", "src/app/professional/articles/page.tsx", "src/app/professional/case-studies/page.tsx"]) {
    const source = readFileSync(path.join(root, file), "utf8");
    assert.match(source, /canonical:/, `${file} lacks canonical metadata`);
    assert.match(source, /openGraph:/, `${file} lacks Open Graph metadata`);
    assert.match(source, /twitter:/, `${file} lacks Twitter metadata`);
  }
});
